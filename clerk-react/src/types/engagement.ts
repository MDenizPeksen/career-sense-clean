// Contracts for the public engagement endpoints (/api/feedback, /api/contact,
// /api/waitlist). All three are write-only and return a simple status envelope.

export type FeedbackCategory = 'Bug' | 'Idea' | 'Other';

export interface FeedbackInput {
  message: string;
  category?: FeedbackCategory;
  email?: string;
  pageUrl?: string;
  company?: string; // honeypot — always left empty by real users
}

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  company?: string; // honeypot
}

export interface WaitlistInput {
  email: string;
  source?: string;
  company?: string; // honeypot
}

export interface StatusResponse {
  status: string;
}
