from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel, ConfigDict
from supabase import Client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from api.models import Document as DocumentModel, Chunk as ChunkModel
from api.deps import db_dependency, user_dependency, supabase_dependency, llm_dependency, embedding_dependency
from typing import Optional, List
from uuid import UUID, uuid4
import pathlib
import asyncio

from rag_engine.ingestion.document_loader import partition_document
from rag_engine.ingestion.chunker_and_summarizer import create_chunks_by_title, summarise_chunks

router = APIRouter(
    prefix='/ingestion',
    tags=['ingestion']
)

class DocumentResponse(BaseModel):
    document_id: UUID
    uploaded_by: Optional[UUID] = None
    file_name: str
    file_type: Optional[str] = None
    file_path: str
    total_page: int = 0
    total_chunk: int = 0
    private: bool = False

    model_config = ConfigDict(from_attributes=True)


@router.get('/documents', response_model=List[DocumentResponse], status_code=status.HTTP_200_OK)
async def get_documents(
    db: db_dependency,
    current_user: user_dependency,
):
    """
    Retrieve all document metadata (document_id, file_name, file_type, total_page, total_chunk, private, etc.).
    - Admin/Staff: Can view all documents in the system.
    - Regular Users: Can view all public documents and their own private documents.
    """
    user_id = UUID(str(current_user["id"]))
    user_role = current_user.get("role", "User")

    if user_role in ("Admin", "Staff"):
        documents = db.query(DocumentModel).order_by(DocumentModel.file_name.asc()).all()
    else:
        documents = (
            db.query(DocumentModel)
            .filter((DocumentModel.private == False) | (DocumentModel.uploaded_by == user_id))
            .order_by(DocumentModel.file_name.asc())
            .all()
        )

    return documents


@router.get('/documents/{document_id}', response_model=DocumentResponse, status_code=status.HTTP_200_OK)
async def get_document_by_id(
    document_id: UUID,
    db: db_dependency,
    current_user: user_dependency,
):
    """
    Retrieve metadata for a specific document by its UUID.
    """
    user_id = UUID(str(current_user["id"]))
    user_role = current_user.get("role", "User")

    doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found",
        )

    if doc.private and user_role not in ("Admin", "Staff") and doc.uploaded_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to this private document is restricted",
        )

    return doc


@router.delete('/documents/{document_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: db_dependency,
    current_user: user_dependency,
):
    """
    Delete a document and cascade-delete its vector chunks.
    - Admin/Staff: Can delete any document.
    - Regular Users: Can only delete their own uploaded documents.
    """
    user_id = UUID(str(current_user["id"]))
    user_role = current_user.get("role", "User")

    doc = db.query(DocumentModel).filter(DocumentModel.document_id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found",
        )

    if user_role not in ("Admin", "Staff") and doc.uploaded_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this document",
        )

    db.delete(doc)
    db.commit()
    return None


@router.post('/upload', response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    db: db_dependency,
    current_user: user_dependency,
    supabase_client: supabase_dependency,
    llm: llm_dependency,
    embeddings: embedding_dependency,
    file: UploadFile = File(...),
    is_private: bool = False,
):
    user_id = UUID(current_user["id"])
    
    storage_dir = pathlib.Path('storage')
    storage_dir.mkdir(exist_ok=True)

    safe_name = pathlib.Path(file.filename).name   
    file_path = storage_dir / safe_name
    bucket_name = 'electron-gate/pdfs'

    try:
        contents = await file.read()
        with open(file_path, 'wb') as fp:
            fp.write(contents)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"File write failed: {exc}")

    upload_key = f"{uuid4()}-{file.filename}"
    upload_result = supabase_client.storage.from_(bucket_name).upload(upload_key, contents)

    if not upload_result:
        raise HTTPException(status_code=500, detail="Supabase upload failed")

    doc = DocumentModel(
        document_id=uuid4(),
        uploaded_by=user_id,
        file_name=file.filename,
        file_type=file.content_type,
        file_path=str(file_path),
        total_page=0,        
        total_chunk=0,         
        private=is_private,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    total_elements = await asyncio.to_thread(partition_document, str(file_path))
    total_chunks = await asyncio.to_thread(create_chunks_by_title, total_elements)
    total_pages = len({e.metadata.page_number for e in total_elements if e.metadata.page_number})

    # Summarize chunks containing tables/images using LLM
    summarized_chunks = await asyncio.to_thread(summarise_chunks, total_chunks, llm)

    # Generate vector embeddings and insert Chunks via SQLAlchemy ORM
    if summarized_chunks:
        texts = [chunk.page_content for chunk in summarized_chunks]
        vectors = await asyncio.to_thread(embeddings.embed_documents, texts)

        for idx, (chunk, vector) in enumerate(zip(summarized_chunks, vectors)):
            db_chunk = ChunkModel(
                chunk_id=uuid4(),
                document_id=doc.document_id,
                chunk_index=idx,
                content=chunk.page_content,
                embedding=vector,
                chunk_metadata={
                    "document_id": str(doc.document_id),  # enables filter in match_document_chunks
                    **chunk.metadata
                }
            )
            db.add(db_chunk)

    doc.total_page = total_pages
    doc.total_chunk = len(total_chunks)
    db.commit()
    db.refresh(doc)

    return doc
