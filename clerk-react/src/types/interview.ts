// Response contract for the mock-interview feature.
// Mirrors what the backend (/api/interview/questions) returns from gpt-4o-mini.

export type QuestionCategory = 'Technical' | 'Behavioral' | 'Problem-solving' | string;
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | string;

export interface InterviewQuestion {
  question: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
}

export interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
  timestamp: string;
}

// Experience levels offered in the UI. Sent verbatim to the backend as `level`.
export const EXPERIENCE_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
