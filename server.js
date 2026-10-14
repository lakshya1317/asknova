const express = require("express");

const app = express();
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("AskNova AI Backend is running 🚀");
});
app.post("/api/chat", (req, res) => {
    const message = req.body.message;

    res.json({
        reply: `You asked: ${message}`
    });
});

app.listen(PORT, () => {
    console.log(`AskNova AI server running on http://localhost:${PORT}`);
});
