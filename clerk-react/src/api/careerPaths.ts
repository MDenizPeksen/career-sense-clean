import { apiClient } from '../lib/apiClient';
import type { CareerPathsResult } from '../types/careerPaths';

// Fetch the user's career-path / skill-gap analysis.
// The /api/career-paths route is protected, so a Clerk token is passed when present.
export async function getCareerPaths(token?: string): Promise<CareerPathsResult> {
  return apiClient.get<CareerPathsResult>('/api/career-paths', token);
}
