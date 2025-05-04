import API from '../index';

export const getInterviewQuestions = async (role: string, level: string) => {
  try {
    const response = await API.post('/api/interview/questions', { role, level });
    return response.data;
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    throw error;
  }
};
