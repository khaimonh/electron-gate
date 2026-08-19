from dotenv import load_dotenv
import os
from langchain_community.vectorstores import SupabaseVectorStore

load_dotenv(override=True)

SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")



def upload_vector_store(docs, embeddings, client):
    
    vector_store = SupabaseVectorStore.from_documents(
        docs,
        embeddings,
        client=client,
        table_name="chunks",
        query_name="match_document_chunks"
    )

def get_vector_store(embeddings, client):
    vector_store = SupabaseVectorStore(
        embedding=embeddings,
        client=client,
        table_name="chunks",
        query_name="match_document_chunks"
    )
    return vector_store

from typing import Any, List, Dict
from pydantic import Field
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document

class SupabaseKeywordRetriever(BaseRetriever):
    client: Any = Field(exclude=True)
    k: int = 10
    filter_kwargs: Dict[str, Any] = Field(default_factory=dict)
    
    def _get_relevant_documents(self, query: str, *, run_manager=None) -> List[Document]:
        filter_dict = self.filter_kwargs.get("filter", {})
        
        res = self.client.rpc(
            "match_keyword_chunks", 
            {
                "query": query, 
                "match_count": self.k, 
                "filter": filter_dict
            }
        ).execute()
        
        return [
            Document(page_content=row["content"], metadata=row["metadata"])
            for row in res.data
        ]
