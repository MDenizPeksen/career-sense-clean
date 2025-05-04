/**
 * Represents an interview question with optional difficulty level and category
 */
export interface InterviewQuestion {
  id: string;
  question: string;
  role: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tips?: string;
}

/**
 * Represents a mock interview session
 */
export interface MockInterview {
  id: string;
  role: string;
  questions: InterviewQuestion[];
  date: string;
  duration?: number;
  feedback?: string;
}
