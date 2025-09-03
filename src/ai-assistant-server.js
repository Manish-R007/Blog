import dotenv from "dotenv";
dotenv.config();
console.log("🔑 OpenAI Key Loaded?", process.env.OPENAI_API_KEY ? "Yes" : "No");


import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.send("AI Assistant Server is running 🚀");
});

// Generate blog content
app.post("/generate", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a blog writer assistant." },
        { role: "user", content: `Write a blog post about: ${title}` },
      ],
      max_tokens: 300,
    });

    res.json({ content: completion.choices[0].message.content });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate content" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
