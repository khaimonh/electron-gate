from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel, ConfigDict
from supabase import Client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from api.models import Document as DocumentModel, Chunk as ChunkModel
from api.deps import db_dependency, user_dependency, supabase_dependency, llm_dependency, embedding_dependency
from typing import Optional
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
