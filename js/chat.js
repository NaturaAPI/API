async function sendMessage() {
    const userMessage = document.getElementById("userInput").value;
    if (!userMessage) {
        alert("메시지를 입력하세요!");
        return;
    }

    try {
        const response = await fetch('https://beamish-melba-ba4300.netlify.app/api/huggingface', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: userMessage })
        });

        const data = await response.json();
        document.getElementById("response").textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('오류 발생:', error);
        document.getElementById("response").textContent = "API 요청 실패!";
    }
}
