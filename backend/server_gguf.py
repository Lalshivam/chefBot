from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama

app = FastAPI(title="Qwen2.5 Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load GGUF model (you'll need to download a GGUF version)
MODEL_PATH = "./models/qwen2.5-0.5b-instruct-q4_k_m.gguf"

print("Loading model...")
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=4,
    verbose=False
)
print("Model loaded successfully!")

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    prompt = f"""<|im_start|>system
You are Qwen, a helpful assistant.<|im_end|>
<|im_start|>user
{request.message}<|im_end|>
<|im_start|>assistant
"""

    output = llm(prompt, max_tokens=150, stop=["<|im_end|>"])
    response = output["choices"][0]["text"].strip()

    return {"response": response}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
