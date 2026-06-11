// Shared type definitions for CV analysis (ported from the original frontend).

// Simple archetype format
export interface SimpleArchetype {
  archetype: string;
  short_description: string;
  reasoning: string;
}

// Complex archetype format
export interface ArchetypeDetails {
  archetype: string;
  confidence?: string;
  description: string;
  strengths?: string[];
  challenges?: string[];
  careerPaths?: string[];
  developmentAreas?: string[];
}

export interface ComplexArchetype {
  primary: ArchetypeDetails;
  secondary?: ArchetypeDetails;
  explanation: string;
}

// Inline format produced by the /analyze prompt: primary/secondary are plain strings.
export interface InlineArchetype {
  primary: string;
  secondary?: string;
  description: string;
  strengths?: string[];
  growthAreas?: string[];
}

// Union type for the different archetype formats the backend may return.
export type ArchetypeData = SimpleArchetype | ComplexArchetype | InlineArchetype;

// User profile information
export interface UserProfile {
  name: string;
  current_role: string;
  sector: string;
  industries?: string[];
  location?: string;
  years_experience?: number;
  education?: string[];
  email?: string;
  linkedin?: string;
  portfolio_url?: string;
}

// Profile strengths information
export interface ProfileStrengths {
  skills: string[];
  core_competencies: string[];
  achievements: string[];
}

// Analysis sections
export interface AnalysisDetails {
  strengths: string[];
  improvement_areas: string[];
  missing_elements: string[];
  keyword_optimization: string[];
  [key: string]: unknown;
}

export interface RoleMatch {
  role: string;
  match_percentage: number;
  transition_difficulty: string;
  required_skills: string[];
  role_description?: string;
  salary_range?: string;
}

export interface CvAnalysis {
  user_profile?: UserProfile;
  profile_strengths?: ProfileStrengths;
  analysis?: AnalysisDetails;
  next_actions?: { action: string; why: string; points_to: string }[];
  archetype?: ArchetypeData | null;
  role_matching?: RoleMatch[];
  resume_optimization?: {
    bullet_rewrites: { original: string; optimized: string }[];
    ats_keywords_missing: string[];
    formatting_feedback: string;
    general_recommendations?: string[];
  };
  star_interview_stories?: {
    title?: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    confidence?: 'high' | 'medium' | 'draft';
    evidence_basis?: string;
  }[];
  future_growth_potential?: {
    career_growth_trajectory: string;
    skills_forecast: string[];
    industry_insights: string[];
  };
  personalized_learning_roadmap?: {
    course: string;
    platform: string;
    impact: string;
    difficulty?: string;
    duration?: string;
    learningLinks?: { provider: string; title: string; url: string }[];
  }[];
  recruiter_friendly_summary?: string;
  dashboard_scores?: {
    overall_score: number;
    ats_readiness_score: number;
    skills_relevance_score?: number;
    experience_impact_score?: number;
    career_readiness_score?: number;
    score_explanation: string;
  };
  career_development_insights?: {
    strengths_leverage: string;
    networking_strategy: string;
    personal_branding_tips: string;
  };
  [key: string]: unknown;
}
