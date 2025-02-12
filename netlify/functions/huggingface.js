const fetch = require('node-fetch');

exports.handler = async (event) => {
  // CORS 설정 추가
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // OPTIONS 요청에 대한 CORS 처리 (Preflight 대응)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "CORS Preflight OK"
    };
  }

  // 환경 변수에서 Hugging Face API 키 가져오기
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

    const user_input = body.text; // 입력된 메시지

    // Hugging Face API 호출
    const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: user_input, // "text"가 아닌 "inputs" 필드 사용
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
      headers,
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
