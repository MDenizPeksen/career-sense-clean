import { apiClient } from '../lib/apiClient';
import type {
  FeedbackInput,
  ContactInput,
  WaitlistInput,
  StatusResponse,
} from '../types/engagement';

// These endpoints are public (anonymous visitors can submit). A Clerk token is
// passed when present so the backend can attribute a signed-in submitter.

export async function submitFeedback(input: FeedbackInput, token?: string): Promise<void> {
  await apiClient.post<StatusResponse>('/api/feedback', input, token);
}

export async function submitContact(input: ContactInput, token?: string): Promise<void> {
  await apiClient.post<StatusResponse>('/api/contact', input, token);
}

export async function joinWaitlist(input: WaitlistInput, token?: string): Promise<void> {
  await apiClient.post<StatusResponse>('/api/waitlist', input, token);
}
