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
  text: string,
  voiceId?: string,
): Promise<string | null> {
  try {
    // Lazy import so mock mode never loads the AWS SDK.
    const { PollyClient, SynthesizeSpeechCommand } = await import(
      "@aws-sdk/client-polly"
    );
    const client = new PollyClient({ region: process.env.AWS_REGION });
    const out = await client.send(
      new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: "mp3",
        Engine: "neural",
        VoiceId: (voiceId ?? process.env.POLLY_VOICE_ID ?? "Joanna") as never,
      }),
    );
    if (!out.AudioStream) return null;
    const bytes = await out.AudioStream.transformToByteArray();
    const b64 = Buffer.from(bytes).toString("base64");
    // The client <Audio> already plays a data: URL via ConverseResult.audioUrl.
    return `data:audio/mpeg;base64,${b64}`;
  } catch {
    // Any Polly failure → null so the client falls back to browser TTS.
    return null;
  }
}
