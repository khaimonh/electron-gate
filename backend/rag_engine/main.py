from ingestion.chunk_loader import *
from pipelines.ingestion import *
from embeddings.vector_store import create_supabase_client, get_vector_store
from dotenv import load_dotenv
# from langchain_ollama import OllamaEmbeddings
from retrieval_and_answer.retrieve_chunks import *
from retrieval_and_answer.generate_answer import *
from retrieval_and_answer.reciprocal_rank_fusion import *
# from langchain_ollama import OllamaLLM
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI

import json

load_dotenv()

# embeddings = OllamaEmbeddings(model="nomic-embed-text")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# llm = OllamaLLM(model="gemma3:4b", temperature=0)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

client = create_supabase_client()

# ingestion_pipeline("NASDAQ_AAPL_2025.pdf", embeddings, client, llm)

# query = "How many full-time equivalent employees did Apple have as of September 27, 2025?"
# query2 = "What was the average price paid per share during each monthly repurchase period in Q4 2025?"
# query2 = "How does the decline in Greater China net sales relate to the product category performance discussed elsewhere in the filing?"
query2 = "What percentage of Apple's deferred revenue is expected to be realized within one year?"
vector_store = get_vector_store(embeddings, client=client)

# vector_store = upload_vector_store(docs, embeddings, client=client)

chunks = retrieve_chunks_multi(llm, query2, vector_store)
final_chunks = reciprocal_rank_fusion(chunks)
# export_chunks_to_json(chunks)


print(generate_final_answer(final_chunks, query2, llm))
# print(context)

