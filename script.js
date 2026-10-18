
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const clearChatBtn = document.getElementById("clearChatBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");
const themeBtn = document.getElementById("themeBtn");

let conversations = [];

// CHAT HISTORY
function addToHistory(message) {
    conversations = conversations.filter(item => item !== message);
    conversations.unshift(message);

    if (conversations.length > 5) {
        conversations.pop();
    }

    renderHistory();
}

function renderHistory() {
    chatHistory.innerHTML = "";

    conversations.forEach(function (chat) {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = "💬 " + chat;

        item.addEventListener("click", function () {
            userInput.value = chat;
            userInput.focus();
        });

        chatHistory.appendChild(item);
    });
}

// SEND MESSAGE
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message || sendBtn.disabled) {
        return;
    }

    addUserMessage(message);
    addToHistory(message);
    userInput.value = "";

    showTyping();
    sendBtn.disabled = true;

    try {
        const response = await fetch("https://asknova-backend-28q5.onrender.com/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        removeTyping();

        if (!response.ok) {
            addBotMessage(data.reply || "Sorry, something went wrong.");
        } else {
            addBotMessage(data.reply || "I couldn't generate a response.");
        }
    } catch (error) {
        removeTyping();
        addBotMessage(
            "Sorry, I could not connect to the server. Please ensure the AskNova backend and Ollama are running. ❌"
        );
        console.error("Chat error:", error);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// SAFELY DISPLAY USER MESSAGE
function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");
    title.textContent = "You";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    const time = document.createElement("small");
    time.textContent = getCurrentTime();

    content.append(title, paragraph, time);
    messageDiv.appendChild(content);
    chatBox.appendChild(messageDiv);

    scrollToBottom();
}

// BOT MESSAGE WITH CLICKABLE LINKS

function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "🤖";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");
    title.textContent = "AskNova AI";

    const answer = document.createElement("div");
    answer.className = "bot-answer";

    // Safely format text, headings, bullets, and links
    const lines = String(message).split("\n");

    lines.forEach(function (line) {
        const trimmed = line.trim();

        if (!trimmed) {
            answer.appendChild(document.createElement("br"));
            return;
        }

        // Headings: # Heading, ## Heading, ### Heading
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);

        if (headingMatch) {
            const heading = document.createElement(
                "h" + (headingMatch[1].length + 2)
            );
            addTextWithLinks(heading, headingMatch[2]);
            answer.appendChild(heading);
            return;
        }

        // Bullet points: - item, * item, or • item
        if (/^[-*•]\s+/.test(trimmed)) {
            const bullet = document.createElement("div");
            bullet.className = "bot-bullet";
            bullet.textContent = "• ";

            const bulletText = document.createElement("span");
            addTextWithLinks(bulletText, trimmed.replace(/^[-*•]\s+/, ""));

            bullet.appendChild(bulletText);
            answer.appendChild(bullet);
            return;
        }

        // Numbered lists: 1. item, 2. item, etc.
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);

        if (numberMatch) {
            const item = document.createElement("div");
            item.className = "bot-bullet";

            const number = document.createElement("strong");
            number.textContent = numberMatch[1] + ". ";

            const text = document.createElement("span");
            addTextWithLinks(text, numberMatch[2]);

            item.append(number, text);
            answer.appendChild(item);
            return;
        }

        const paragraph = document.createElement("p");
        addTextWithLinks(paragraph, trimmed);
        answer.appendChild(paragraph);
    });

    const time = document.createElement("small");
    time.textContent = getCurrentTime();

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "📋 Copy";

    copyBtn.addEventListener("click", function () {
        copyAnswer(copyBtn);
    });

    content.append(title, answer, time, copyBtn);
    messageDiv.append(avatar, content);
    chatBox.appendChild(messageDiv);

    scrollToBottom();
}

// Safely display clickable HTTP/HTTPS links
function addTextWithLinks(container, text) {
    const parts = String(text).split(/(https?:\/\/[^\s<]+)/gi);

    parts.forEach(function (part) {
        if (/^https?:\/\//i.test(part)) {
            const match = part.match(/^(.*?)([.,!?;:]*)$/);
            const urlText = match[1];
            const punctuation = match[2];

            const link = document.createElement("a");
            link.href = urlText;
            link.textContent = urlText;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            container.appendChild(link);

            if (punctuation) {
                container.appendChild(document.createTextNode(punctuation));
            }
        } else {
            container.appendChild(document.createTextNode(part));
        }
    });
}


// CURRENT TIME
function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// TYPING ANIMATION
function showTyping() {
    removeTyping();

    const typing = document.createElement("div");
    typing.id = "typing";
    typing.className = "message bot-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "🤖";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");
    title.textContent = "AskNova AI";

    const dots = document.createElement("p");
    dots.className = "typing-dots";
    dots.textContent = "...";

    content.append(title, dots);
    typing.append(avatar, content);
    chatBox.appendChild(typing);

    scrollToBottom();
}

function removeTyping() {
    const typing = document.getElementById("typing");

    if (typing) {
        typing.remove();
    }
}

// SUGGESTION QUESTIONS
function askQuestion(question) {
    userInput.value = question;
    sendMessage();
}

// CLEAR CHAT
function clearChat() {
    chatBox.innerHTML = "";
    conversations = [];
    renderHistory();

    addWelcomeMessage();
    userInput.value = "";
    userInput.focus();
}

// NEW CHAT
function newChat() {
    chatBox.innerHTML = "";
    addWelcomeMessage();

    userInput.value = "";
    userInput.focus();
}

// WELCOME MESSAGE
function addWelcomeMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "🤖";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");
    title.textContent = "AskNova AI";

    const paragraph = document.createElement("p");
    paragraph.textContent =
        "👋 Hello! I'm AskNova AI. How can I help you today?";

    content.append(title, paragraph);
    messageDiv.append(avatar, content);
    chatBox.appendChild(messageDiv);
}

// BUTTON EVENTS
if (clearChatBtn) {
    clearChatBtn.addEventListener("click", clearChat);
}

if (newChatBtn) {
    newChatBtn.addEventListener("click", newChat);
}

if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

// ENTER KEY
if (userInput) {
    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

// AUTO SCROLL
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// DARK MODE
if (themeBtn) {
    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            themeBtn.textContent = "☀️ Light Mode";
        } else {
            themeBtn.textContent = "🌙 Dark Mode";
        }
    });
}

// COPY BOT ANSWER
async function copyAnswer(button) {
    const paragraph = button.parentElement.querySelector("p");
    const answer = paragraph ? paragraph.innerText : "";

    try {
        await navigator.clipboard.writeText(answer);
        button.textContent = "✅ Copied!";

        setTimeout(function () {
            button.textContent = "📋 Copy";
        }, 1500);
    } catch (error) {
        console.error("Copy failed:", error);
        button.textContent = "Copy failed";
    }
}
