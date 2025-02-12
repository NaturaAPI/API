const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",  // 모든 도메인 허용
    "Access-Control-Allow-Methods": "POST, OPTIONS", // 허용할 메소드
    "Access-Control-Allow-Headers": "Content-Type, Authorization", // 허용할 헤더
    "Content-Type": "application/json"
  };

  // OPTIONS 요청 처리 (Preflight 대응)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "CORS Preflight OK"
    };
  }

  const API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API 키가 설정되지 않았습니다." })
    };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "입력 값이 없습니다. 'text' 필드가 필요합니다." })
      };
    }

    const user_input = body.text;

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
          max_tokens: 50,
          temperature: 0.3,
          top_p: 0.8,
          repetition_penalty: 1.1
        }
      })
    });

    // 응답이 올바른지 확인
    if (!response.ok) {
      const errorMessage = `API 요청 실패: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // 응답 본문 텍스트로 확인
    const text = await response.text();
    if (text.trim() === "") {
      throw new Error("빈 응답이 반환되었습니다.");
    }

    const data = JSON.parse(text);

    return {
      statusCode: 200,
      headers,  // CORS 설정 유지
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
