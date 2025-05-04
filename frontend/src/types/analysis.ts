// Shared type definitions for CV analysis

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

// Union type for different archetype formats
export type ArchetypeData = SimpleArchetype | ComplexArchetype;

// User profile information
export interface UserProfile {
  name: string;
  current_role: string;
  sector: string;
  industries?: string[];  // Added industries field
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
  [key: string]: any; // Allow for additional fields
}

export interface CvAnalysis {
  user_profile?: UserProfile;
  profile_strengths?: ProfileStrengths;
  analysis?: AnalysisDetails;
  archetype?: ArchetypeData;
  improvement_areas?: {
    skills_gap: string[];
    experience_gaps: string[];
    presentation_structure: string;
  };
  role_matching?: {
    role: string;
    match_percentage: number;
    transition_difficulty: string;
    required_skills: string[];
    role_description?: string;
    salary_range?: string;
  }[];
  resume_optimization?: {
    bullet_rewrites: {
      original: string;
      optimized: string;
    }[];
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
  [key: string]: any; // Allow for additional fields from the backend
}
