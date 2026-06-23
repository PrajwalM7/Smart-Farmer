const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateAIResponse(prompt) {
  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

  return completion.choices[0].message.content;
}
async function generateAIResponse(prompt) {
  try {
    const completion =
      await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error.message);

    return JSON.stringify({
      message: "AI service temporarily unavailable"
    });
  }
}

module.exports = {
  generateAIResponse,
};