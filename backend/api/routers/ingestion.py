from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel, ConfigDict
from api.models import Document
from api.deps import db_dependency, llm_dependency, embedding_dependency, supabase_dependency
from typing import List, Optional, Any
from dotenv import load_dotenv
from uuid import UUID

from rag_engine.pipelines.ingestion import *
from rag_engine.ingestion.document_loader import partition_document
from rag_engine.ingestion.chunker_and_summarizer import create_chunks_by_title, summarise_chunks

import os
import pathlib
import asyncio

load_dotenv()

router = APIRouter(
    prefix='/ingestion',
    tags=['ingestion']
)

class DocumentBase(BaseModel):
    file_name: str
    file_type: Optional[str] = None
    file_path: str
    total_page: int = 0
    total_chunk: int = 0
    private: bool = False

class Document(DocumentBase):
    document_id: UUID
    uploaded_by: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)

class DocumentCreate(DocumentBase):
    uploaded_by: Optional[UUID] = None


class ChunkBase(BaseModel):
      chunk_index: int
      chunk_metadata: Optional[Any] = None  # JSON field

class ChunkCreate(ChunkBase):
    document_id: UUID
    embedding: List[float] # 1536 dimensions

class Chunk(ChunkBase):
    chunk_id: UUID
    document_id: UUID
    embedding: List[float]

    model_config = ConfigDict(from_attributes=True)

@router.post('/upload')
async def upload_document(
    db: db_dependency,
    file: UploadFile = File(...),
    is_private: bool = False,   
    user_id: UUID = None,
    ):
    
    storage_dir = pathlib.Path('storage')
    storage_dir.mkdir(exist_ok=True)

    safe_name = pathlib.Path(file.filename).name   
    file_path = storage_dir / safe_name

    try:
        contents = await file.read()
        with open(file_path, 'wb') as fp:
            fp.write(contents)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"File write failed: {exc}")

    doc = Document(
        file_name=file.filename,
        file_type=file.content_type,
        file_path=str(file_path),
        total_page=0,        
        total_chunk=0,         
        private=is_private,
        uploaded_by=user_id,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    total_elements = await asyncio.to_thread(partition_document, str(file_path))
    total_chunks = await asyncio.to_thread(create_chunks_by_title, total_elements)
    total_pages = len({e.metadata.page_number for e in total_elements if e.metadata.page_number})

    doc.total_page  = total_pages
    doc.total_chunk = len(total_chunks)
    db.commit()

    summarized_chunks = await asyncio.to_thread(summarise_chunks, total_chunks)

    await asyncio.to_thread(upload_vector_store, summarized_chunks, embedding_dependency, supabase_dependency)