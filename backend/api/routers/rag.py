import asyncio
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from api.deps import (
    user_dependency,
    supabase_dependency,
    llm_dependency,
    embedding_dependency,
)
from rag_engine.embeddings.vector_store import get_vector_store
from rag_engine.retrieval_and_answer.retrieve_chunks import retrieve_chunks, retrieve_chunks_multi
from rag_engine.retrieval_and_answer.reciprocal_rank_fusion import reciprocal_rank_fusion
from rag_engine.retrieval_and_answer.generate_answer import generate_final_answer

router = APIRouter(
    prefix="/rag",
    tags=["rag"],
)


class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Question or prompt to answer")
    document_id: Optional[str] = Field(
        default=None,
        description="Scope retrieval to a specific uploaded document UUID",
    )
    use_multi_query: bool = Field(
        default=True,
        description="Whether to generate query variations for multi-angle retrieval",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of top source chunks to return in the response",
    )


class SourceChunk(BaseModel):
    content: str
    score: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceChunk] = Field(default_factory=list)


class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    document_id: Optional[str] = Field(
        default=None,
        description="Scope retrieval to a specific uploaded document UUID",
    )
    top_k: int = Field(default=5, ge=1, le=50, description="Max chunks to retrieve")


class RAGSearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SourceChunk] = Field(default_factory=list)



@router.post("/query", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
async def query_rag(
    request: RAGQueryRequest,
    current_user: user_dependency,
    supabase_client: supabase_dependency,
    llm: llm_dependency,
    embeddings: embedding_dependency,
):
    """
    RAG QA endpoint:
    1. Connects to the vector store.
    2. Runs retrieval (multi-query MMR or standard single query).
       Optionally scoped to a single document via document_id.
    3. Fuses & reranks retrieved chunks using Reciprocal Rank Fusion.
    4. Synthesizes a multimodal answer with the LLM.
    """
    try:
        filter_kwargs = {"filter": {"document_id": str(request.document_id)}} if request.document_id else {}
        vector_store = get_vector_store(embeddings, client=supabase_client)

        if request.use_multi_query:
            chunk_lists = await asyncio.to_thread(
                retrieve_chunks_multi, llm, request.query, vector_store, filter_kwargs
            )
            ranked_chunks = reciprocal_rank_fusion(chunk_lists)
        else:
            chunks = await asyncio.to_thread(
                retrieve_chunks, request.query, vector_store, filter_kwargs
            )
            ranked_chunks = [(c, 1.0) for c in chunks]

        answer = await asyncio.to_thread(
            generate_final_answer, ranked_chunks, request.query, llm
        )

        sources = []
        for item in ranked_chunks[: request.top_k]:
            doc = item[0] if isinstance(item, tuple) else item
            score = item[1] if isinstance(item, tuple) else None
            sources.append(
                SourceChunk(
                    content=doc.page_content or "",
                    score=score,
                    metadata=doc.metadata if hasattr(doc, "metadata") else {},
                )
            )

        return RAGQueryResponse(
            query=request.query,
            answer=str(answer) if answer is not None else "",
            sources=sources,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG query failed: {exc}",
        )


@router.post("/search", response_model=RAGSearchResponse, status_code=status.HTTP_200_OK)
async def search_chunks(
    request: RAGSearchRequest,
    current_user: user_dependency,
    supabase_client: supabase_dependency,
    embeddings: embedding_dependency,
):
    """
    Direct semantic chunk search without LLM answer generation.
    Optionally scoped to a single document via document_id.
    """
    try:
        filter_kwargs = {"filter": {"document_id": str(request.document_id)}} if request.document_id else {}
        vector_store = get_vector_store(embeddings, client=supabase_client)
        docs = await asyncio.to_thread(
            retrieve_chunks, request.query, vector_store, filter_kwargs
        )

        results = [
            SourceChunk(
                content=doc.page_content or "",
                metadata=doc.metadata if hasattr(doc, "metadata") else {},
            )
            for doc in docs[: request.top_k]
        ]

        return RAGSearchResponse(
            query=request.query,
            total_results=len(results),
            results=results,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG search failed: {exc}",
        )
