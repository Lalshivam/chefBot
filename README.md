# ChefBot Chatbot Project

ChefBot is a cooking-focused chatbot application with a React frontend and a Node.js backend powered by the Gemini API.

This repository currently contains:
- A modern frontend app (`frontend`) built with React + Vite.
- A new JavaScript backend (`backend2`) using Express and `@google/genai`.
- A legacy Python backend (`backend`) based on a local Qwen model.

## Project Structure

```text
chefBot/
	frontend/     # React UI (chat interface)
	backend2/     # New JS backend (Gemini API)
	backend/      # Older Python backend (local Qwen model)
	README.md
	DEPLOYMENT.md
	render.yaml
```

## Architecture Overview

1. User sends a message from the frontend chat UI.
2. Frontend calls `POST /chat` on the backend URL configured in `VITE_API_URL`.
3. `backend2` applies a chef persona prompt and conversation history.
4. Backend requests a response from Gemini.
5. Backend returns `{ "response": "..." }` to the frontend.

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express, CORS, dotenv
- LLM Provider: Google Gemini API via `@google/genai`

## Recommended Setup (Use `backend2`)

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- A Gemini API key from Google AI Studio

### 1) Configure Backend (`backend2`)

From the `backend2` folder:

```bash
npm install
```

Create `.env` in `backend2` (or copy from `.env.example`) and set values:

```env
GEMINI_API_KEY=your_api_key_here
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_MODEL=gemini-2.5-flash
```

Run backend:

```bash
npm run dev
```

Backend will run at `http://localhost:8000` by default.

### 2) Configure Frontend (`frontend`)

From the `frontend` folder:

```bash
npm install
```

Create `.env` in `frontend` (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## API Contract (Backend2)

### `POST /chat`

Request body:

```json
{
	"message": "Give me a quick pasta recipe",
	"history": [
		{ "role": "user", "content": "I want a vegetarian dinner" },
		{ "role": "assistant", "content": "Sure, how much time do you have?" }
	]
}
```

Success response:

```json
{
	"response": "...assistant reply..."
}
```

Possible error response:

```json
{
	"error": "Server is missing GEMINI_API_KEY"
}
```

### `GET /health`

Example response:

```json
{
	"status": "ok",
	"model": "gemini-2.5-flash",
	"provider": "gemini",
	"persona": "Chef Gourmet"
}
```

## Prompt Engineering in Backend2

The backend uses a chef persona prompt (`Chef Gourmet`) to keep responses:
- Cooking-focused
- Structured and practical
- Safety-aware
- Helpful for substitutions and beginner-friendly instructions

Conversation history is sanitized and truncated (recent messages only) before sending to Gemini to improve consistency and reduce noise.

## Legacy Backend (`backend`)

`backend` contains a separate Python/FastAPI implementation using a local Qwen model.

Use `backend2` when you want Gemini API integration.

## Troubleshooting

### `POST /chat` returns 500

- Ensure `GEMINI_API_KEY` is set in `backend2/.env`.
- Restart the backend after updating environment variables.

### CORS errors in browser

- Confirm `FRONTEND_ORIGIN` in `backend2/.env` matches your frontend URL.
- Default frontend URL is `http://localhost:5173`.

### Frontend cannot reach backend

- Verify backend is running on port `8000`.
- Verify `frontend/.env` has `VITE_API_URL=http://localhost:8000`.
- Check terminal logs for startup or runtime errors.

## Useful Commands

Backend (`backend2`):

```bash
npm run dev
npm run start
```

Frontend (`frontend`):

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- Keep `.env` files out of version control.
- Never expose `GEMINI_API_KEY` in frontend code.
- If deploying, set environment variables in your hosting platform dashboard.
