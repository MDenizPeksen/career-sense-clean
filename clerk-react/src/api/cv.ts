import { apiClient } from '../lib/apiClient';
import type { CvAnalysis, RoleMatch } from '../types/analysis';

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateCvFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` };
  }
  return { valid: true };
}

type Loose = Record<string, unknown>;

const asArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

// Treat a value as a loose object (model JSON), defaulting to {} when it isn't.
const asObject = (value: unknown): Loose =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : {};

// First non-empty string among the candidates, else ''.
const firstString = (...values: unknown[]): string => {
  for (const v of values) if (typeof v === 'string' && v) return v;
  return '';
};

// Normalize the backend response into the CvAnalysis shape the UI expects.
// This only reconciles snake_case/camelCase key variants from the model —
// it never invents data (no fabricated roles, salaries, or skills).
function normalize(raw: Loose): CvAnalysis {
  const up = asObject(raw.user_profile ?? raw.userProfile);
  const ps = asObject(raw.profile_strengths);
  const an = asObject(raw.analysis);

  const roleMatching: RoleMatch[] = Array.isArray(raw.role_matching)
    ? (raw.role_matching as RoleMatch[])
    : Array.isArray(raw.roleMatching)
    ? (raw.roleMatching as RoleMatch[])
    : [];

  return {
    ...raw,
    user_profile: {
      name: firstString(up.name, raw.name),
      current_role: firstString(up.current_role, up.title, up.role, raw.current_role),
      sector: firstString(up.sector, up.industry, up.field, raw.sector, raw.industry),
      location: firstString(up.location, up.city, raw.location),
      years_experience: up.years_experience || up.experience || raw.years_experience || 0,
      education: asArray(up.education ?? raw.education),
      email: firstString(up.email, raw.email),
      linkedin: firstString(up.linkedin, up.linkedIn, raw.linkedin),
      portfolio_url: firstString(up.portfolio_url, up.portfolio, raw.portfolio_url),
      industries: asArray(up.industries ?? raw.industries),
    },
    profile_strengths: {
      skills: asArray(ps.skills ?? up.skills ?? raw.skills),
      core_competencies: asArray(ps.core_competencies ?? raw.core_competencies ?? an.strengths),
      achievements: asArray(ps.achievements ?? raw.achievements),
    },
    analysis: {
      strengths: asArray(an.strengths ?? raw.strengths),
      improvement_areas: asArray(an.improvement_areas ?? an.improvementAreas ?? raw.improvement_areas),
      missing_elements: asArray(an.missing_elements ?? an.missingElements ?? raw.missing_elements),
      keyword_optimization: asArray(an.keyword_optimization ?? an.keywordOptimization ?? raw.keyword_optimization),
      ...an,
    },
    role_matching: roleMatching,
    archetype: raw.archetype ?? null,
  } as CvAnalysis;
}

// Upload and analyze a CV. Requires a Clerk session token (the /analyze route is protected).
export async function uploadCV(file: File, token?: string): Promise<CvAnalysis> {
  const formData = new FormData();
  formData.append('file', file);
  const raw = await apiClient.postFormData<Record<string, unknown>>('/analyze', formData, token);
  return normalize(raw);
}

// Fetch the signed-in user's most recent persisted analysis (or null if none).
// The /analyses/latest route is protected, so a Clerk token is passed when present.
export async function getLatestAnalysis(token?: string): Promise<CvAnalysis | null> {
  const res = await apiClient.get<{ analysis: Record<string, unknown> | null }>('/analyses/latest', token);
  return res?.analysis ? normalize(res.analysis) : null;
}

// Health check — true when the backend is reachable.
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const res = await apiClient.get<{ status: string }>('/health');
    return res.status === 'ok';
  } catch {
    return false;
  }
}
