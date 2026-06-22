// services/polly.ts — Amazon Polly voice synthesis behind a Mock/Real switch.
// Client code NEVER imports this; only /api routes do (CLAUDE.md §3).

const USE_MOCKS = process.env.USE_MOCKS !== "false";

/**
 * Returns an audio URL for the spoken reply, or null. Null is a valid contract
 * (ConverseResult.audioUrl) → the client falls back to browser speechSynthesis.
 */
export async function synthesize(
  text: string,
  voiceId?: string,
): Promise<string | null> {
  if (USE_MOCKS) return mockSynthesize(text, voiceId);
  return realSynthesize(text, voiceId);
}

async function mockSynthesize(
  _text: string,
  _voiceId?: string,
): Promise<string | null> {
  // No Polly in mock mode → null signals the client to use speechSynthesis.
  return null;
}

async function realSynthesize(
  _text: string,
  _voiceId?: string,
): Promise<string | null> {
  throw new Error("realSynthesize: Polly not wired yet");
}
