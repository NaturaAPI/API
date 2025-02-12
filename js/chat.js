document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 챗봇 스크립트 로드 완료!");

    const API_ENDPOINT = "https://beamish-melba-ba4300.netlify.app/api/huggingface"; // Netlify Functions URL

    const chatlogs = document.getElementById("chatlogs");
    const userInput = document.getElementById("userInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");

    if (!sendMessageBtn) return;

    // 로컬 저장된 대화 기록 로드
    function loadChatHistory() {
        const savedChat = JSON.parse(localStorage.getItem("chatCache")) || [];
        savedChat.forEach(({ role, message }) => {
            addMessage(role, message, false);
        });
    }

    // 채팅 메시지 추가
    function addMessage(role, message, animate = true) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-bubble", role === "user" ? "user-message" : "ai-message");
        msgDiv.textContent = message;

        if (animate) msgDiv.style.animation = "fadeIn 0.3s ease-in-out";
        
        chatlogs.appendChild(msgDiv);
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }

    // 메시지 전송
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage("user", message);
        saveChatHistory("user", message);
        userInput.value = "";

        addMessage("ai", "🧠 생각 중...", false);

        try {
            const cachedResponse = getCachedResponse(message);
            if (cachedResponse) {
                chatlogs.lastChild.remove();
                addMessage("ai", cachedResponse);
            } else {
                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: message }),
                });

                const data = await response.json();
                chatlogs.lastChild.remove();
                const aiResponse = data.generated_text || "⚠️ 응답을 가져올 수 없습니다.";

                addMessage("ai", aiResponse);
                saveChatHistory("ai", aiResponse, message);
            }
        } catch (error) {
            chatlogs.lastChild.remove();
            addMessage("ai", "⚠️ 네트워크 오류 발생! 다시 시도해주세요.");
        }
    }

    // 대화 기록 저장
    function saveChatHistory(role, message, input = "") {
        const chatHistory = JSON.parse(localStorage.getItem("chatCache")) || [];
        chatHistory.push({ role, message, input });

        if (chatHistory.length > 50) chatHistory.shift();
        
        localStorage.setItem("chatCache", JSON.stringify(chatHistory));
    }

    // 캐시된 응답 가져오기
    function getCachedResponse(input) {
        const cache = JSON.parse(localStorage.getItem("chatCache")) || [];
        const cachedEntry = cache.find(entry => entry.role === "ai" && entry.input === input);
        return cachedEntry ? cachedEntry.message : null;
    }

    // 대화 기록 지우기
    function clearChatHistory() {
        localStorage.removeItem("chatCache");
        chatlogs.innerHTML = "";
        console.log("🗑️ 대화 기록이 삭제되었습니다.");
    }

    sendMessageBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener("click", clearChatHistory);
    }

    loadChatHistory();
});
