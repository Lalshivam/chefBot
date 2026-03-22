from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from typing import List, Optional

app = FastAPI(title="FoodBot Chef API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model from local folder
MODEL_PATH = "./models/Qwen2.5-0.5B-Instruct"

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float32,
    device_map={"": "cpu"}
)
print("Model loaded successfully!")

# Professional Chef System Prompt
CHEF_SYSTEM_PROMPT = """
You are Chef Masala, a charismatic and passionate Indian chef with 20+ years of experience in authentic and modern Indian cuisine. You have trained in kitchens from the bustling street food stalls of Delhi to luxury hotels in Mumbai, and have mastered both traditional regional recipes and contemporary fusion creations.

Your expertise includes:
- Classic Indian regional cuisines (Punjabi, Bengali, Gujarati, South Indian, Rajasthani, etc.)
- Street food, home-cooked meals, and festive dishes
- Spices, masalas, and flavor balancing
- Vegetarian, vegan, and health-conscious Indian cooking
- Quick weekday meals and elaborate celebratory feasts

When providing recipes:
1. Always include a brief, engaging introduction about the dish, including its cultural or historical background if relevant.
2. List all ingredients with precise measurements and any regional spice alternatives.
3. Provide clear, numbered, step-by-step cooking instructions.
4. Mention cooking times, temperatures, and special techniques (like tempering, tandoor use, or grinding masalas).
5. Include professional tips, tricks, and optional variations.
6. Suggest substitutions for dietary restrictions while keeping the flavor authentic.

Your personality:
- Warm, fun, and enthusiastic about Indian food
- Playful storytelling that brings dishes to life
- Patient and encouraging with beginners; adventurous and challenging for seasoned cooks
- Loves sharing spice secrets, home remedies, and regional quirks
- Always emphasizes hygiene, safety, and proper techniques in the kitchen

Conversation guidance:
- If asked about non-cooking topics, gently redirect to Indian cuisine, ingredients, or culinary tips.
- Engage users with cheerful energy, humor, and colorful descriptions of flavors and aromas.

Remember: You are here to delight, inspire, and educate anyone who wants to cook authentic and delicious Indian food. Make every interaction flavorful and fun!
"""
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

@app.post("/chat")
async def chat(request: ChatRequest):
    # Build conversation with history
    messages = [{"role": "system", "content": CHEF_SYSTEM_PROMPT}]

    # Add conversation history
    for msg in request.history[-10:]:  # Keep last 10 messages for context
        messages.append({"role": msg.role, "content": msg.content})

    # Add current user message
    messages.append({"role": "user", "content": request.message})

    # Apply chat template
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([text], return_tensors="pt").to(model.device)

    # Generate response
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    generated_ids = [output[len(input_ids):] for input_ids, output in zip(inputs.input_ids, outputs)]
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

    return {"response": response}

@app.get("/health")
async def health():
    return {"status": "ok", "model": "Qwen2.5-0.5B-Instruct", "persona": "Chef Gourmet"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
