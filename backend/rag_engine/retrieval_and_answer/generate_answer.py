from langchain_core.messages import HumanMessage
import json
from langchain_community.callbacks.manager import get_openai_callback

def generate_final_answer(chunks, query, llm, json=json):
    with get_openai_callback() as cb:

        # for i,item in enumerate(chunks,1): doc = item[0] if isinstance(item, tuple) else item; print(i, (doc.page_content or "")[:200], len(doc.metadata.get("tables_html", [])), len(doc.metadata.get("images_base64", [])))
        prompt_text = f"""Based on the following documents, answer this question: {query}

CONTENT TO ANALYZE:
"""
        
        for i, item in enumerate(chunks):
            chunk = item[0] if isinstance(item, tuple) else item
            prompt_text += f"--- Document {i+1} ---\n"
            
            if "original_content" in chunk.metadata:
                original_data = json.loads(chunk.metadata["original_content"])
                
                # Add raw text
                raw_text = original_data.get("raw_text", "")

                if raw_text:
                    prompt_text += f"TEXT:\n{raw_text}\n\n"
                
                # Add tables as HTML
                tables_html = original_data.get("tables_html", [])
                if tables_html:
                    prompt_text += "TABLES:\n"
                    for j, table in enumerate(tables_html):
                        prompt_text += f"Table {j+1}:\n{table}\n\n"
            
            prompt_text += "\n"
        
        prompt_text += """
Answer the user's question using only the provided documents.

Rules:
1. Use information from the documents only.
2. Do not perform calculations unless explicitly requested.
3. If exact values are present, quote them directly.
4. For comparison or relationship questions, synthesize information across documents.
5. Keep the answer clear.
6. If the answer cannot be supported by the documents, respond with only: "I don't have enough information to answer that question based on the provided documents."

ANSWER:"""

        # Build message content starting with text
        message_content = [{"type": "text", "text": prompt_text}]
        
        # Add all images from all chunks
        for item in chunks:
            chunk = item[0] if isinstance(item, tuple) else item
            if "original_content" in chunk.metadata:
                original_data = json.loads(chunk.metadata["original_content"])
                images_base64 = original_data.get("images_base64", [])
                
                for image_base64 in images_base64:
                    if len(images_base64) > 0 and any(keyword in query.lower() for keyword in ["chart", "graph", "figure", "image", "diagram"]):
                        message_content.append({
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                        })
        
        # Send to AI and get response
        try:
            message = HumanMessage(content=message_content)
            response = llm.invoke([message])

            print(f"Total Tokens: {cb.total_tokens}")
            print(f"Prompt Tokens: {cb.prompt_tokens}")
            print(f"Completion Tokens: {cb.completion_tokens}")
            print(f"Total Cost: ${cb.total_cost}")
            
            return response if isinstance(response, str) else response.content        
        except Exception as e:
            print(f"❌ Answer generation failed: {e}")
            return "Sorry, I encountered an error while generating the answer."
        

