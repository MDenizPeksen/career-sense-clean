// Contract for the Career Paths feature (/api/career-paths).
// The backend computes data-grounded role-shift options + skill gaps from the
// user's saved analysis (and discovery profile), grounded in O*NET when configured.

export type CareerPathSource = 'onet' | 'analysis' | 'none';

export interface CareerTransition {
  title: string;
  code: string | null; // O*NET-SOC code when grounded
  matchPercentage: number | null;
  difficulty: string | null;
  description: string;
  salaryRange: string | null;
  requiredSkills: string[];
  sharedSkills: string[]; // skills the user already has
  skillGap: string[]; // skills the user still needs
}

export interface CourseLink {
  provider: string;
  title: string;
  url: string;
}

export interface LearningLink {
  skill: string;
  courses: CourseLink[];
}

export interface CareerPathsResult {
  source: CareerPathSource;
  onetConfigured: boolean;
  currentRole: string | null;
  transitions: CareerTransition[];
  topSkillGaps: string[];
  learningLinks?: LearningLink[]; // optional: absent in older cached responses
  generatedAt: string;
  message?: string;
}
