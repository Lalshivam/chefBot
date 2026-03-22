# Backend2 (Node.js + Gemini)

This is a JavaScript backend for the Chef chatbot frontend.

## Features
- `POST /chat` endpoint compatible with the frontend payload.
- Gemini API integration via `@google/genai`.
- Prompt-engineered chef persona (`Chef Gourmet`).
- `GET /health` endpoint for quick checks.

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and set your key:

```env
GEMINI_API_KEY=your_api_key_here
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_MODEL=gemini-2.5-flash
```

## 3) Run server

```bash
npm run dev
```

Server runs at `http://localhost:8000` by default.

## API

### POST /chat
Request body:

```json
{
  "message": "How do I make paneer butter masala?",
  "history": [
    { "role": "user", "content": "I want a quick dinner" },
    { "role": "assistant", "content": "Do you prefer vegetarian?" }
  ]
}
```

Response:

```json
{
  "response": "...Gemini output..."
}
```

### GET /health

```json
{
  "status": "ok",
  "model": "gemini-2.5-flash",
  "provider": "gemini",
  "persona": "Chef Gourmet"
}
```
