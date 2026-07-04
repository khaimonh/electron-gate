from ingestion.document_loader import *
from ingestion.chunker_and_summarizer import *
from ingestion.export_to_json import export_chunks_to_json
from embeddings.vector_store import *

def ingestion_pipeline(file_path, embeddings, client, llm):
    partitioned = partition_document(file_path)

    chunks_by_title = create_chunks_by_title(partitioned)

    summarized = summarise_chunks(chunks_by_title, llm)

    # export_chunks_to_json(summarized)
    vector_store = upload_vector_store(summarized, embeddings, client)

    return vector_store 