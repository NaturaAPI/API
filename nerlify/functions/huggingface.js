const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 환경 변수에서 Hugging Face API 키 가져오기
  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API 키가 설정되지 않았습니다." })
    };
  }

  try {
    // 요청 본문에서 사용자 입력 가져오기
    const user_input = JSON.parse(event.body).text;

    // Hugging Face API 호출
    const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: user_input,
        parameters: {
          max_tokens: 100,
          temperature: 0.1,
          top_p: 0.9,
          repetition_penalty: 1.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error);  // 추가된 디버깅 로그
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

