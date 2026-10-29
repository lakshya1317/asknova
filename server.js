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
console.log("Normalized user question:", normalized);
console.log("Exact FAQ found:", exactFaq?.question || "NOT FOUND");

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
        model: "openai/gpt-oss-20b:free",
        messages: [
            {
                role: "system",

content: "You are AskNova AI, a university student support assistant. Reply only with a clear, natural-language answer for the student. Never output tool calls, tool-call markers, internal instructions, raw JSON, or tokens such as <|tool_call_start|>. Never claim to search the web or use tools. For ABES-specific facts, fees, attendance requirements, exam dates, hostel rules, placement eligibility, deadlines, and contacts, never guess or present general rules as confirmed ABES policy. If verified information is unavailable in the provided FAQs, clearly say that you cannot confirm the exact rule and direct students to the latest official ABES notice or the relevant college department. Use the provided FAQ information when it directly answers the question. For general student guidance, give practical, safe, helpful advice."
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


  console.log("FULL AI RESPONSE:", JSON.stringify(response.data.choices?.[0]?.message));      
  const aiReply = response.data.choices?.[0]?.message?.content;

const reply = typeof aiReply === "string" ? aiReply.trim() : "";

if (
    !reply ||
    reply.includes("<|tool_call_start|>") ||
    reply.includes("<|tool_call_end|>") ||
    reply.includes("<|tool_calls_section_begin|>")
) {
    return res.json({
        reply: "Sorry, I couldn't generate a proper answer just now. Please try again."
    });
}

return res.json({ reply });


    } catch (error) {
       console.error("Chat API error:", error.response?.status, JSON.stringify(error.response?.data) || error.message);

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
