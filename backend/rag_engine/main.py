import json
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

from embeddings.vector_store import create_supabase_client, get_vector_store, SupabaseKeywordRetriever
from retrieval_and_answer.retrieve_chunks import retrieve_chunks_multi
from retrieval_and_answer.generate_answer import generate_final_answer
from retrieval_and_answer.reciprocal_rank_fusion import reciprocal_rank_fusion

load_dotenv()

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
client = create_supabase_client()

query = "What percentage of Apple's deferred revenue is expected to be realized within one year?"
vector_store = get_vector_store(embeddings, client=client)
keyword_retriever = SupabaseKeywordRetriever(client=client, k=15)
chunks = retrieve_chunks_multi(llm, query, vector_store, bm25_retriever=keyword_retriever)
final_chunks = reciprocal_rank_fusion(chunks)

print(generate_final_answer(final_chunks, query, llm))

