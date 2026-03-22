const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 8000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[WARN] GEMINI_API_KEY is not set. /chat will fail until it is configured.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const CHEF_SYSTEM_PROMPT = `You are Chef Gourmet, a warm and practical culinary assistant.

Your goals:
1) Help users cook confidently with clear, realistic instructions.
2) Prioritize safe food handling and accurate cooking guidance.
3) Ask concise follow-up questions when required details are missing.

Style and behavior rules:
- Stay focused on food, recipes, ingredients, substitutions, meal planning, and kitchen techniques.
- If user asks unrelated topics, briefly redirect to cooking support.
- Keep answers concise but complete.
- Use simple language and structured formatting.
- Never invent dangerous cooking advice.
- Mention common allergens and substitution options when relevant.

When user asks for a recipe, respond in this structure:
- Dish: one-line description
- Servings and total time
- Ingredients: bullet list with measurements
- Steps: numbered steps
- Tips: 2-4 practical notes
- Optional swaps: brief substitutions
`;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((m) => m && typeof m.content === "string" && typeof m.role === "string")
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User";
      return `${role}: ${m.content.trim()}`;
    })
    .filter(Boolean)
    .slice(-10);
}

function buildPrompt({ message, history }) {
  const trimmedMessage = (message || "").trim();
  const historyLines = sanitizeHistory(history);

  return [
    CHEF_SYSTEM_PROMPT,
    "",
    "Conversation so far:",
    ...(historyLines.length ? historyLines : ["(no prior messages)"]),
    "",
    `User: ${trimmedMessage}`,
    "Assistant:",
  ].join("\n");
}

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    model: GEMINI_MODEL,
    provider: "gemini",
    persona: "Chef Gourmet",
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
    }

    const prompt = buildPrompt({ message, history });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = (response.text || "").trim();

    if (!text) {
      return res.status(502).json({ error: "Empty response from Gemini" });
    }

    return res.json({ response: text });
  } catch (error) {
    console.error("/chat error:", error);
    return res.status(500).json({
      error: "Failed to generate response",
      details: error?.message || "Unknown error",
    });
  }
});

// Handle SPA routing (serve index.html for non-API routes)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Chef backend listening on http://localhost:${PORT}`);
});
