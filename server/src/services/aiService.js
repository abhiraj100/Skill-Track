export async function runAI(prompt, fallback) {
  const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_API_URL || !AI_API_KEY || !AI_MODEL) return fallback;

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a concise career and learning assistant. Return practical JSON only when requested." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || fallback;
  } catch {
    return fallback;
  }
}
