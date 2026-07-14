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
        table_name="document_chunks",
        query_name="match_document_chunks"
    )

def get_vector_store(embeddings, client):
    vector_store = SupabaseVectorStore(
        embedding=embeddings,
        client=client,
        table_name="document_chunks",
        query_name="match_document_chunks"
    )
    return vector_store
