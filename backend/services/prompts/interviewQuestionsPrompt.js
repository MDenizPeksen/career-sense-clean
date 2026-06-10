// Prompt template for generating mock-interview questions.
module.exports = function interviewQuestionsPrompt(role, level) {
  return `
You are CareerSense AI, an expert career advisor specializing in technical interviews.

Generate a set of 5 interview questions for a ${role} position at the ${level} level. Include a mix of:
- Technical questions specific to the role
- Behavioral questions to assess soft skills
- Problem-solving scenarios relevant to the position

Return ONLY a valid JSON object with exactly this structure:
{
  "questions": [
    {
      "question": "The full question text",
      "category": "One of: Technical, Behavioral, Problem-solving",
      "difficulty": "One of: Easy, Medium, Hard"
    }
  ]
}

The top-level key MUST be "questions" and its value MUST be an array of 5 objects.
`;
};
