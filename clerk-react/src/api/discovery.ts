import { apiClient } from '../lib/apiClient';
import type { DiscoverySession, DiscoverySessionResponse } from '../types/discovery';

// All /api/discovery routes are protected, so a Clerk token is passed when present.

/**
 * Start a new discovery session. The backend creates the session and returns it
 * with the agent's opening message already in place.
 */
export async function startDiscoverySession(token?: string): Promise<DiscoverySession> {
  const res = await apiClient.post<DiscoverySessionResponse>('/api/discovery/sessions', {}, token);
  if (!res.session) {
    throw new Error('Failed to start a discovery session.');
  }
  return res.session;
}

/**
 * Send the user's message to a session and get back the updated session (with the
 * agent's reply appended, and the enriched profile attached once complete).
 */
export async function sendDiscoveryMessage(
  sessionId: string,
  content: string,
  token?: string
): Promise<DiscoverySession> {
  const res = await apiClient.post<DiscoverySessionResponse>(
    `/api/discovery/sessions/${sessionId}/messages`,
    { content },
    token
  );
  if (!res.session) {
    throw new Error('The discovery session could not be updated.');
  }
  return res.session;
}

/**
 * Fetch the user's in-progress session so the chat can be resumed, or null.
 */
export async function getActiveDiscoverySession(token?: string): Promise<DiscoverySession | null> {
  const res = await apiClient.get<DiscoverySessionResponse>('/api/discovery/sessions/latest', token);
  return res?.session ?? null;
}
