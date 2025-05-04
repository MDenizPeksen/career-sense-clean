import API from './index';
import { logError } from '../utils/errorHandling';
import { InterviewQuestion } from '../types';

/**
 * Get interview questions for a specific role
 * @param role The job role to get interview questions for
 * @returns Array of interview questions
 */
export const getInterviewQuestions = async (role: string): Promise<InterviewQuestion[]> => {
  try {
    const response = await API.get(`/api/interviews/questions?role=${encodeURIComponent(role)}`);
    return response.data.questions;
  } catch (error: any) {
    logError('Failed to fetch interview questions', error);
    return [];
  }
};
