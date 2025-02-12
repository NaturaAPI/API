const fetch = require('node-fetch');

exports.handler = async (event) => {
  // CORS 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",  // 모든 도메인에서 접근 허용
    "Access-Control-Allow-Methods": "POST, OPTIONS",  // 허용된 메서드
    "Access-Control-Allow-Headers": "Content-Type, Authorization",  // 허용된 헤더
    "Content-Type": "application/json"  // JSON 응답
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
    // 요청 본문 파싱
    const body = JSON.parse(event.body);
    if (!body.text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "'text' 필드가 필요합니다." })
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

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,  // CORS 헤더 포함
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
