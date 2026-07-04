from supabase import create_client
from dotenv import load_dotenv
import os
from langchain_community.vectorstores import SupabaseVectorStore

load_dotenv(override=True)

SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")

def create_supabase_client():
    supabase = create_client(
        supabase_key=SUPABASE_KEY,
        supabase_url=SUPABASE_URL
    )
    return supabase

def upload_vector_store(docs, embeddings, client=create_supabase_client()):
    
    vector_store = SupabaseVectorStore.from_documents(
        docs,
        embeddings,
        client=client,
        table_name="document_chunks_test",
        query_name="match_document_chunks_test"
    )

def get_vector_store(embeddings, client=create_supabase_client()):
    vector_store = SupabaseVectorStore(
        embedding=embeddings,
        client=client,
        table_name="document_chunks_test",
        query_name="match_document_chunks_test"
    )
    return vector_store
