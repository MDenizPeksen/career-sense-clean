// OpenAI configuration
module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  maxTokens: {
    cv: 2500,
    archetype: 1500,
    test: 10
  },
  temperature: {
    cv: 0.5,           // More deterministic for CV analysis
    archetype: 0.7,     // Slightly more creative for archetype classification
    test: 0.0           // Completely deterministic for connection testing
  },
  timeout: 60000        // 60 seconds timeout for API calls
};
