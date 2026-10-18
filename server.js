
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const faqs = require("./faqs.json");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

// Health check
app.get("/", (req, res) => {
    res.send("AskNova AI Backend is running 🚀");
});

// Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body?.message;
        
        // Check whether a matching FAQ exists
       
        const normalizeText = (text) =>
            text.toLowerCase()
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, " ")
                .trim();

        const normalized = normalizeText(message);

        const stopWords = [
            "the", "and", "for", "what", "who", "whom",
            "how", "can", "you", "tell", "about",
            "explain", "please", "should", "i", "my",
            "me", "is", "are", "do", "does", "where",
            "when", "to", "a", "an", "of", "at", "in"
        ];

        const messageWords = normalized.split(" ")
            .filter(word => word.length > 2 &&
                !stopWords.includes(word));

        let bestFaq = null;
        let bestScore = 0;

        for (const faq of faqs) {
            const question = normalizeText(faq.question);
            const questionWords = question.split(" ")
                .filter(word => word.length > 2 &&
                    !stopWords.includes(word));

            const commonWords = messageWords.filter(word =>
                questionWords.includes(word)
            );

            const score = commonWords.length /
                Math.max(messageWords.length, questionWords.length, 1);

            if (score > bestScore) {
                bestScore = score;
                bestFaq = faq;
            }
        }
        const hostelFaq = faqs.find(faq =>
            faq.category === "hostel" &&
            normalizeText(faq.question) === normalized
        );
              const exactFaq = faqs.find(faq =>
    normalizeText(faq.question) === normalized
);

const matchedFaq = exactFaq ||
    hostelFaq ||
    (bestScore >= 0.7 ? bestFaq : null);
        console.log("FAQ match:", bestFaq?.question, "| Score:", bestScore);
        console.log("Matched FAQ:", matchedFaq?.question || "NO FAQ MATCH");

        if (matchedFaq) {
            return res.json({
                reply: matchedFaq.answer
            });
        }


        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                reply: "Please enter a valid question."
            });
        }

        const response = await axios.post(OLLAMA_URL, {
            model: "llama3.2:3b",
            messages: [
                {
                    role: "system",
                    content: "You are AskNova AI, a helpful university student support assistant. Answer students clearly and politely. Do not invent university-specific rules, fees, or schedules when verified information is unavailable."
                },
                {
                    role: "user",
                    content: message.trim()
                }
            ],
            stream: false
        });

        return res.json({
            reply: response.data.message.content
        });

    } catch (error) {
        console.error("Chat API error:", error.message);

        return res.status(500).json({
            reply: "Could not connect to the local AI. Please ensure Ollama is running."
        });
    }
});
console.log("Reached app.listen");
app.listen(PORT, () => {
    console.log(
        `AskNova AI server running on http://localhost:${PORT}`
    );
});
