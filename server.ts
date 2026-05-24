import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  // ── Config endpoint ── tells the client whether a real server key is set
  app.get("/api/config", (_req, res) => {
    const key = process.env.GEMINI_API_KEY || "";
    const hasServerKey = key.startsWith("AIza") && key.length > 20;
    res.json({ hasServerKey });
  });

  // ── Server-side Gemini transcription proxy ────────────────────────────────
  app.post("/api/transcribe", async (req, res) => {
    const serverKey = process.env.GEMINI_API_KEY;
    const { audioBase64, mimeType, clientKey } = req.body as {
      audioBase64: string;
      mimeType: string;
      clientKey?: string;
    };

    const apiKey = serverKey || clientKey || "";
    if (!apiKey) {
      return res.status(400).json({ error: "No API key available. Please add your Gemini API key in Settings." });
    }
    if (!audioBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing audioBase64 or mimeType" });
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: audioBase64 } },
              {
                text: `Transcribe this audio. Return ONLY a valid JSON object in this exact format:
{"bangla": "<Bangla/Bengali script transcription>", "english": "<English translation>"}
Rules:
- If the audio is in Bengali, transcribe in Bangla script and translate to English.
- If the audio is in English, put it in both fields.
- Return ONLY the JSON object — no markdown fences, no extra text.`,
              },
            ],
          },
        ],
      });

      const raw = (response.text || "").trim();
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      const match = cleaned.match(/\{[\s\S]*?"bangla"[\s\S]*?"english"[\s\S]*?\}/);
      if (match) {
        return res.json(JSON.parse(match[0]));
      }
      if (cleaned.startsWith("{")) {
        return res.json(JSON.parse(cleaned));
      }
      // Fallback: return raw as bangla
      return res.json({ bangla: raw, english: "" });
    } catch (err: any) {
      console.error("Gemini error:", err?.message);
      return res.status(500).json({ error: err?.message || "AI processing failed" });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
