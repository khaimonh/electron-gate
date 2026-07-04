from pydantic import BaseModel

from typing import List
from langchain_community.callbacks.manager import get_openai_callback


def retrieve_chunks(query, vector_store):
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    chunks = retriever.invoke(query)
    return chunks

# Pydantic model for structured output
# class QueryVariations(BaseModel):
#     queries: List[str]
    
def retrieve_chunks_multi(llm, query, vector_store):
    with get_openai_callback() as cb:

    # llm_with_tools = llm.with_structured_output(QueryVariations)

        prompt = f"""Generate 3 different variations of this query that would help retrieve relevant documents:

        Original query: {query}

        Return 3 alternative queries that rephrase or approach the same question from different but similar angles.

        Return only the 3 queries, one per line, with no numbering or extra text."""
        #TODO: delete last line when using openAI models

        response = llm.invoke(prompt)
        text = response.content if hasattr(response, "content") else str(response)

        query_variations = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ][:3]

        print("Generated Query Variations:")
        for i, variation in enumerate(query_variations, 1):
            print(f"{i}. {variation}")

        retriever = vector_store.as_retriever(search_type = "mmr", search_kwargs={"k": 15, "fetch_k": 70, "lambda_mult": 0.55})  
        all_retrieval_results = []  

        for i, query in enumerate(query_variations, 1):
            print(f"\n=== RESULTS FOR QUERY {i}: {query} ===")
            
            docs = retriever.invoke(query)
            # print(docs)
            all_retrieval_results.append(docs)  
            
            print(f"Retrieved {len(docs)} documents:\n")
            
        print("Multi-Query Retrieval Complete!")
        print(f"Total Tokens: {cb.total_tokens}")
        print(f"Prompt Tokens: {cb.prompt_tokens}")
        print(f"Completion Tokens: {cb.completion_tokens}")
        print(f"Total Cost: ${cb.total_cost}")
        return all_retrieval_results

