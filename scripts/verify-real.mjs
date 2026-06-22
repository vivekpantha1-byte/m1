// Throwaway end-to-end check of the REAL path (Bedrock + Polly) using .env.local.
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
const { PollyClient, SynthesizeSpeechCommand } = await import("@aws-sdk/client-polly");

const region = process.env.AWS_REGION;
const MODEL = process.env.BEDROCK_MODEL_ID;
const bedrock = new BedrockRuntimeClient({ region });

async function invoke(system, user) {
  const res = await bedrock.send(new InvokeModelCommand({
    modelId: MODEL, contentType: "application/json", accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31", max_tokens: 1024, system,
      messages: [{ role: "user", content: [{ type: "text", text: user }] }],
    }),
  }));
  return JSON.parse(new TextDecoder().decode(res.body)).content[0].text;
}

const scenarios = [
  "An angry operations director escalating after a payroll system outage",
  "A grieving relative discussing end-of-life care for her husband",
];
for (const s of scenarios) {
  const raw = await invoke(
    'Reply ONLY minified JSON: {"role":string,"emotion":string,"avatarMood":"anxious"|"angry"|"sad"|"neutral"}.',
    `Scenario: ${s}`);
  console.log(`\nScenario: ${s}\n  Bedrock → ${raw.trim().slice(0, 160)}`);
}

// Polly
const polly = new PollyClient({ region });
const out = await polly.send(new SynthesizeSpeechCommand({
  Text: "Hello, this is a test of the Polly neural voice.",
  OutputFormat: "mp3", Engine: "neural", VoiceId: "Joanna",
}));
const bytes = await out.AudioStream.transformToByteArray();
console.log(`\n✅ Polly OK → ${bytes.length} bytes of mp3 audio`);
