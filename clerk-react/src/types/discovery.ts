// Contract for the Conversational Discovery feature.
// Mirrors what the backend (/api/discovery/*) returns. The agent drives a
// multi-turn chat and, when complete, attaches an enriched profile.

export type DiscoveryRole = 'user' | 'assistant';
export type DiscoveryStatus = 'active' | 'completed';

export interface DiscoveryMessage {
  role: DiscoveryRole;
  content: string;
  createdAt?: string;
}

// Free-form-ish profile the agent emits on completion. All fields are optional
// because the agent leaves genuinely-unknown fields null/empty (never invented).
export interface EnrichedProfile {
  headline?: string;
  motivation?: string;
  current_situation?: string;
  target_roles?: string[];
  target_industries?: string[];
  constraints?: {
    location?: string | null;
    timeline?: string | null;
    compensation?: string | null;
  };
  risk_tolerance?: string | null;
  learning_preferences?: string | null;
  strengths_to_leverage?: string[];
  open_questions?: string[];
}

export interface DiscoverySession {
  id: string;
  status: DiscoveryStatus;
  enrichedProfile: EnrichedProfile | null;
  createdAt?: string;
  updatedAt?: string;
  messages: DiscoveryMessage[];
}

export interface DiscoverySessionResponse {
  session: DiscoverySession | null;
}
