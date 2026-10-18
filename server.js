require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const faqs = require("./faqs.json");




const app = express();
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 5000;



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

       
const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
        model: "openrouter/free",
        messages: [
            {
                role: "system",
                content: "You are AskNova AI, a helpful university student support assistant. Answer students clearly and politely. Do not invent university-specific rules, fees, or schedules when verified information is unavailable."
            },
            {
                role: "user",
                content: message.trim()
            }
        ]
    },
    {
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        timeout: 60000
    }
);


        
return res.json({
    reply: response.data.choices?.[0]?.message?.content
        || "Sorry, I could not generate an answer. Please try again."
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
