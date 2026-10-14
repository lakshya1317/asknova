const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const clearChatBtn = document.getElementById("clearChatBtn");
const newChatBtn = document.getElementById("newChatBtn");

const chatHistory = document.getElementById("chatHistory");

let conversations = [];

function addToHistory(message) {

    conversations.unshift(message);

    if (conversations.length > 5) {
        conversations.pop();
    }

    renderHistory();
}

function renderHistory() {

    chatHistory.innerHTML = "";

    conversations.forEach(function(chat) {

        const item = document.createElement("div");

        item.className = "history-item";

        item.innerHTML = `💬 ${chat}`;

        chatHistory.appendChild(item);

    });
}

// SEND MESSAGE

async function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    addUserMessage(message);
    addToHistory(message);
    userInput.value = "";

 showTyping();

try {
    const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    });

    const data = await response.json();

    removeTyping();
    addBotMessage(data.reply);

} catch (error) {
    removeTyping();
    addBotMessage("Sorry, I could not connect to the server. ❌");
}

}


// USER MESSAGE

function addUserMessage(message) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message user-message";

    messageDiv.innerHTML = `
        <div class="message-content">

            <strong>You</strong>

            <p>${message}</p>
            <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</small>

        </div>
    `;

    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


// BOT MESSAGE

function addBotMessage(message) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message bot-message";

    messageDiv.innerHTML = `
        <div class="avatar">
            🤖
        </div>

        <div class="message-content">

            <strong>Ask nova AI</strong>

           <p>${message}</p>
           <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</small>
<button class="copy-btn" onclick="copyAnswer(this)">📋 Copy</button>

        </div>
    `;

    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


// TYPING ANIMATION

function showTyping() {

    const typing = document.createElement("div");

    typing.id = "typing";

    typing.className = "message bot-message";

    typing.innerHTML = `
        <div class="avatar">
            🤖
        </div>

        <div class="message-content">

            <strong>Ask nova AI</strong>

            <p class="typing-dots">
    <span>.</span>
    <span>.</span>
    <span>.</span>
</p>

        </div>
    `;

    chatBox.appendChild(typing);

    scrollToBottom();
}


function removeTyping() {

    const typing = document.getElementById("typing");

    if (typing) {
        typing.remove();
    }
}


// TEMPORARY BOT LOGIC

function getBotResponse(message) {

    const text = message.toLowerCase();


    if (text.includes("hello") || text.includes("hi")) {

        return "Hello! 👋 How can I help you with your university-related questions?";

    }


    if (text.includes("exam")) {

        return "I can help you with exam-related information such as schedules, syllabus and examination guidelines. 📅";

    }


    if (text.includes("hostel")) {

        return "I can provide information about hostel facilities, rules, mess and other hostel-related services. 🏠";

    }


    if (text.includes("fee")) {

        return "I can help you understand tuition fees, hostel fees and other university-related fee information. 💰";

    }


    if (text.includes("attendance")) {

        return "I can provide information about attendance requirements and attendance-related university rules. 📚";

    }


    return "That's a good question! 🤖 Once my AI model is connected, I'll be able to provide a detailed answer based on university information.";
}


// SUGGESTION QUESTIONS

function askQuestion(question) {

    userInput.value = question;

    sendMessage();
}


// CLEAR CHAT

clearChatBtn.addEventListener("click", function() {

    chatBox.innerHTML = `
        <div class="message bot-message">

            <div class="avatar">
                🤖
            </div>

            <div class="message-content">

                <strong>UniAssist AI</strong>

                <p>
                    👋 Hello! I'm UniAssist AI.
                    How can I help you today?
                </p>

            </div>

        </div>
    `;

});


// NEW CHAT
newChatBtn.addEventListener("click", function() {

    chatBox.innerHTML = `
        <div class="message bot-message">

            <div class="avatar">
                🤖
            </div>

            <div class="message-content">

                <strong>AskNova AI</strong>

                <p>
                    👋 Hello! I'm AskNova AI.
                    How can I help you today?
                </p>

            </div>

        </div>
    `;

    userInput.value = "";

    userInput.focus();

});


// SEND BUTTON

sendBtn.addEventListener("click", sendMessage);


// ENTER KEY

userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});


// AUTO SCROLL

function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;

}
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeBtn.innerHTML = "☀️ Light Mode";

    } else {

        themeBtn.innerHTML = "🌙 Dark Mode";

    }

});
function copyAnswer(button) {
    const answer = button.previousElementSibling.innerText;

    navigator.clipboard.writeText(answer);

    button.innerHTML = "✅ Copied!";

    setTimeout(function () {
        button.innerHTML = "📋 Copy";
    }, 1500);
}