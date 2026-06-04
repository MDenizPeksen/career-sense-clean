// OpenAI configuration
// Values come from the environment where provided, with sensible defaults.
const num = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  // Only gpt-4o-mini is enabled on the current OpenAI project. To upgrade (e.g.
  // gpt-4.1-mini — better JSON/instruction-following at a similar low price),
  // enable the model in the OpenAI dashboard (Project -> Limits -> model access)
  // and set OPENAI_MODEL accordingly. No code change needed.
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  maxTokens: {
    cv: 2500,
    archetype: 1500,
    interview: 1000,
    discovery: 900,    // one adaptive turn (a question) or the final enriched profile
    test: 10
  },
  temperature: {
    cv: num(process.env.OPENAI_TEMPERATURE, 0.5), // More deterministic for CV analysis
    archetype: 0.7,    // Slightly more creative for archetype classification
    interview: 0.7,    // Some variety across generated question sets
    discovery: 0.6,    // Conversational but focused — adaptive yet on-task
    test: 0.0          // Completely deterministic for connection testing
  },
  timeout: 60000        // 60 seconds timeout for API calls
};
