// OpenAI configuration
// Values come from the environment where provided, with sensible defaults.
const num = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  maxTokens: {
    cv: 2500,
    archetype: 1500,
    test: 10
  },
  temperature: {
    cv: num(process.env.OPENAI_TEMPERATURE, 0.5), // More deterministic for CV analysis
    archetype: 0.7,    // Slightly more creative for archetype classification
    test: 0.0          // Completely deterministic for connection testing
  },
  timeout: 60000        // 60 seconds timeout for API calls
};
