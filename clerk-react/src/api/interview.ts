import { apiClient } from '../lib/apiClient';
import type { InterviewQuestion, InterviewQuestionsResponse } from '../types/interview';

const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

// Coerce a single raw model item into our InterviewQuestion shape.
// The model returns the data; we only reconcile key-name variants — never invent it.
function normalizeQuestion(raw: Record<string, unknown>): InterviewQuestion | null {
  const question = raw.question ?? raw.text ?? raw.prompt ?? '';
  if (typeof question !== 'string' || !question.trim()) return null;
  return {
    question: question.trim(),
    category: asString(raw.category ?? raw.type),
    difficulty: asString(raw.difficulty ?? raw.level),
  };
}

// Request a set of interview questions for a role + experience level.
// The /api/interview/questions route is protected, so a Clerk token is passed when present.
export async function getInterviewQuestions(
  role: string,
  level: string,
  token?: string
): Promise<InterviewQuestion[]> {
  const res = await apiClient.post<InterviewQuestionsResponse>(
    '/api/interview/questions',
    { role, level },
    token
  );
  const list = Array.isArray(res?.questions) ? res.questions : [];
  return list
    .map((q) => normalizeQuestion(q as unknown as Record<string, unknown>))
    .filter((q): q is InterviewQuestion => q !== null);
}
