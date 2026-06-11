import { describe, it, expect } from 'vitest';
import {
  ApiError,
  NetworkError,
  formatErrorMessage,
  handleApiResponse,
} from './errorHandling';

describe('errorHandling', () => {
  it('formatErrorMessage unwraps known error types and falls back for unknowns', () => {
    expect(formatErrorMessage(new ApiError('bad request', 400))).toBe('bad request');
    expect(formatErrorMessage(new NetworkError('offline'))).toBe('offline');
    expect(formatErrorMessage(new Error('boom'))).toBe('boom');
    expect(formatErrorMessage('weird')).toBe('An unknown error occurred');
  });

  it('handleApiResponse throws a typed ApiError on non-2xx using the server message', async () => {
    const res = new Response(JSON.stringify({ error: 'nope' }), { status: 422 });
    await expect(handleApiResponse(res)).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'nope',
    });
  });

  it('handleApiResponse returns parsed JSON on success', async () => {
    const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
    await expect(handleApiResponse<{ ok: boolean }>(res)).resolves.toEqual({ ok: true });
  });
});
