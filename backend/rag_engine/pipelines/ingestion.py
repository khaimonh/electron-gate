from rag_engine.ingestion.document_loader import partition_document
from rag_engine.ingestion.chunker_and_summarizer import create_chunks_by_title, summarise_chunks
from rag_engine.embeddings.vector_store import upload_vector_store


def ingestion_pipeline(file_path: str, embeddings, client, llm):
    partitioned = partition_document(file_path)
    chunks_by_title = create_chunks_by_title(partitioned)
    summarized = summarise_chunks(chunks_by_title, llm)
    return upload_vector_store(summarized, embeddings, client)