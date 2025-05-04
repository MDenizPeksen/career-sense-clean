import apiClient from './apiClient';

export interface ArchetypeResult {
  archetype: string;
  description: string;
  strengths: string[];
  career_paths: string[];
  growth_opportunities: string[];
  work_environment_preferences: string[];
}

/**
 * Service for career archetype related API calls
 */
export const archetypeService = {
  /**
   * Get career archetype based on CV analysis
   * @param cvText The extracted text from the CV
   * @returns The archetype analysis result
   */
  async getArchetype(cvText: string): Promise<ArchetypeResult> {
    return await apiClient.post<ArchetypeResult>('/api/archetype', { cvText });
  },
  
  /**
   * Get all available archetypes
   * @returns List of all career archetypes
   */
  async getAllArchetypes(): Promise<ArchetypeResult[]> {
    return await apiClient.get<ArchetypeResult[]>('/api/archetypes');
  }
};
