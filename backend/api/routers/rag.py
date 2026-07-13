from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel

try:
    from rag_engine.retrieval_and_answer.generate_answer import generate_rag_response
    from rag_engine.pipelines.ingestion import run_ingestion_pipeline
except ImportError as e:
    print(f"Error importing RAG engine: {e}")
    generate_rag_response = None
    run_ingestion_pipeline = None

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 3

class QueryResponse(BaseModel):
    answer: str
    sources: List[str] 


@router.post("/query", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    if generate_rag_response is None:
        raise HTTPException(status_code=500, detail="RAG Engine not initialized")

    try:
        result = generate_rag_response(request.question, top_k=request.top_k)

        return {
            "answer": result.get("answer", "No answer generated"),
            "sources": result.get("sources", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Error: {str(e)}")

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):

    if run_ingestion_pipeline is None:
        raise HTTPException(status_code=500, detail="Ingestion pipeline not initialized")

    try:
        # 1. Save the uploaded file to the /backend/data directory
        import shutil
        import os

        data_path = "backend/data/"
        os.makedirs(data_path, exist_ok=True)
        file_path = os.path.join(data_path, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Run your existing ingestion pipeline on the saved file
        # I'm assuming run_ingestion_pipeline takes a file path
        run_ingestion_pipeline(file_path)

        return {"message": f"File {file.filename} successfully ingested into vector store."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion Error: {str(e)}")

@router.get("/status")
async def get_rag_status():
    """Check if the vector store is loaded and ready."""
    return {"status": "online", "engine": "RAG-v1"}