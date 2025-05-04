import API from '../index';

export const getArchetype = async (resumeText: string) => {
  try {
    const response = await API.post('/api/archetype', { resumeText });
    return response.data;
  } catch (error) {
    console.error('Error getting archetype:', error);
    throw error;
  }
};
