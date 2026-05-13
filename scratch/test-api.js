import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('Testing OpenRouter with key starting with:', apiKey?.substring(0, 10));

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SpendLens Audit"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [
          {"role": "user", "content": "Say 'Connection Successful' if you can read this."}
        ]
      })
    });

    const data = await response.json();
    console.log('OpenRouter response:', data.choices?.[0]?.message?.content || data);
  } catch (err) {
    console.error('OpenRouter test failed:', err);
  }
}

test();
