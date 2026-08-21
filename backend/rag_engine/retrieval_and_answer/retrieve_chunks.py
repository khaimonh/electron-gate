from pydantic import BaseModel

from typing import List, Optional, Dict, Any
from langchain_community.callbacks.manager import get_openai_callback


def retrieve_chunks(query: str, vector_store, filter_kwargs: Optional[Dict[str, Any]] = None):
    search_kwargs: Dict[str, Any] = {"k": 3}
    if filter_kwargs:
        search_kwargs.update(filter_kwargs)
    retriever = vector_store.as_retriever(search_kwargs=search_kwargs)
    chunks = retriever.invoke(query)
    return chunks

def retrieve_chunks_multi(llm, query: str, vector_store, filter_kwargs: Optional[Dict[str, Any]] = None, bm25_retriever=None):
    with get_openai_callback() as cb:
        prompt = f"""Generate 3 different variations of this query that would help retrieve relevant documents:

Original query: {query}

Return 3 alternative queries that rephrase or approach the same question from different but similar angles.

Return only the 3 queries, one per line, with no numbering or extra text."""

        response = llm.invoke(prompt)
        text = response.content if hasattr(response, "content") else str(response)

        query_variations = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ][:3]

        search_kwargs: Dict[str, Any] = {"k": 15, "fetch_k": 70, "lambda_mult": 0.55}
        if filter_kwargs:
            search_kwargs.update(filter_kwargs)
        retriever = vector_store.as_retriever(search_type="mmr", search_kwargs=search_kwargs)
        all_retrieval_results = []

        for query_var in query_variations:
            docs = retriever.invoke(query_var)
            all_retrieval_results.append(docs)

            if bm25_retriever:
                sparse_docs = bm25_retriever.invoke(query_var)
                all_retrieval_results.append(sparse_docs)

        return all_retrieval_results
