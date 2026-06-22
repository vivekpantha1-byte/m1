# MIRA — Wiring Real AWS AI (replacing the mocks)

This is the step-by-step process to switch MIRA from deterministic mock data to **real AWS
AI services**. The app was built mock-first (see `CLAUDE.md` §0–§3), so every cloud call
already sits behind a `Mock` / `Real` switch. Going live = implement the `real*` functions
and flip `USE_MOCKS=false`.

> **Golden rule:** keep `USE_MOCKS=true` on a known-good branch for the live demo. Wire real
> AWS on a separate branch and only merge once each service is verified. Never let an
> unverified cloud call be the thing a judge sees.

---

## 1. The tech stack (what each AWS service does here)

| Concern | AWS service | npm package | Replaces mock in |
|---|---|---|---|
| Persona generation + in-character dialogue + report scoring | **Amazon Bedrock** (Claude) | `@aws-sdk/client-bedrock-runtime` | `services/bedrock.ts` |
| Text-to-speech (the client's voice) | **Amazon Polly** (neural) | `@aws-sdk/client-polly` | `services/polly.ts` |
| Speech-to-text (student's words) | **Amazon Transcribe** *(optional)* | `@aws-sdk/client-transcribe-streaming` | browser Web Speech today |
| Store session recordings + report JSON | **Amazon S3** *(optional)* | `@aws-sdk/client-s3` | `services/s3.ts` |
| Sentiment / emotion *(optional, Tier 3)* | **Comprehend** / **Rekognition** | `@aws-sdk/client-comprehend` | `lib/metrics.ts` eyeContact/sentiment |

**Priority order (CLAUDE.md §3):** Bedrock → Polly → Transcribe → S3 → Comprehend/Rekognition.
Wire one tier, verify it in the demo, then move to the next. STT can stay on the browser's
free Web Speech API — Transcribe is only worth it for accuracy or non-Chrome browsers.

---

## 2. One-time AWS account setup

1. **Create / sign in to an AWS account.** New accounts get free-tier + credits.
2. **Set a budget alarm FIRST.** AWS Console → *Billing → Budgets* → create a **$1** alert.
   Do this before step 5 so a runaway loop can't surprise you.
3. **Request Bedrock model access.** Console → *Amazon Bedrock → Model access* → enable an
   Anthropic **Claude** model in **`us-east-1`**. Approval is usually instant. Copy the exact
   **Model ID** shown (e.g. `anthropic.claude-3-5-haiku-20241022-v1:0`) — you'll paste it into
   `BEDROCK_MODEL_ID`. Pick a small/cheap model for dialogue.
4. **Create an IAM user** (Console → *IAM → Users → Create user*) with **programmatic access**.
   Attach the least-privilege policy below. Then create an **access key** and save the
   `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`.

### Least-privilege IAM policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "Bedrock",    "Effect": "Allow", "Action": ["bedrock:InvokeModel"], "Resource": "*" },
    { "Sid": "Polly",      "Effect": "Allow", "Action": ["polly:SynthesizeSpeech"], "Resource": "*" },
    { "Sid": "Transcribe", "Effect": "Allow", "Action": ["transcribe:StartStreamTranscription"], "Resource": "*" },
    { "Sid": "S3",         "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::YOUR_BUCKET/*" }
  ]
}
```
Drop the `Transcribe` / `S3` statements if you're not wiring those tiers.

---

## 3. Local configuration

```bash
cp .env.example .env.local        # .env.local is gitignored — never commit it
```

Edit `.env.local`:
```ini
USE_MOCKS=false                   # the master switch
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0   # paste your console value
POLLY_VOICE_ID=Joanna
S3_BUCKET=                        # leave empty to keep local-blob download
```

> **Tip:** `USE_MOCKS` is read per service. You can wire Bedrock only and still let Polly fall
> back to the browser voice — keep the others mocked by returning `null`/throwing until ready.

---

## 4. Install the SDKs

> CLAUDE.md §0.5 says no new deps without asking — going live is that explicit ask.

```bash
npm i @aws-sdk/client-bedrock-runtime          # Tier 1
npm i @aws-sdk/client-polly                     # Tier 2
npm i @aws-sdk/client-transcribe-streaming      # Tier 3 (optional)
npm i @aws-sdk/client-s3                         # optional
```

---

## 5. Implement the `real*` functions

All of these live in **server-only** files under `src/services/` and are only ever called by
`src/app/api/*` routes — **never import them in a client component** (CLAUDE.md §3).

### 5a. Bedrock — `src/services/bedrock.ts`

Replace the three `throw new Error(...)` stubs (`realParseScenario`, `realConverse`,
`realAnalyze`). Skeleton:

```ts
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const MODEL = process.env.BEDROCK_MODEL_ID!;

async function invokeClaude(system: string, user: string): Promise<string> {
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: [{ type: "text", text: user }] }],
      }),
    }),
  );
  const json = JSON.parse(new TextDecoder().decode(res.body));
  return json.content[0].text as string;
}

async function realParseScenario(text: string): Promise<Persona> {
  // Ask Claude to return STRICT JSON matching the Persona shape (types.ts is frozen).
  const raw = await invokeClaude(
    "You generate a clinical role-play patient. Reply with ONLY valid JSON matching: " +
      "{ role, scene, emotion, difficulty, hiddenConcern, objectives[3], avatarMood }.",
    `Scenario: ${text}`,
  );
  return JSON.parse(raw) as Persona;          // validate before trusting in real code
}
```
Do the same pattern for `realConverse` (pass the transcript, ask for `{ replyText, mood }`)
and `realAnalyze` (pass the transcript, ask for the `Report` shape). **Always** keep
`lib/metrics.ts` as the source of truth for the numeric metrics — let Claude write the prose
(evidence/tips) and overlay the deterministic numbers (see `app/api/analyze/route.ts`).

### 5b. Polly — `src/services/polly.ts`

`synthesize(text)` currently returns `null` (→ browser TTS). Make it return a playable URL:

```ts
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const polly = new PollyClient({ region: process.env.AWS_REGION });

export async function synthesize(text: string): Promise<string | null> {
  if (process.env.USE_MOCKS !== "false") return null;
  const out = await polly.send(
    new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: (process.env.POLLY_VOICE_ID ?? "Joanna") as never,
      Engine: "neural",
    }),
  );
  const bytes = await out.AudioStream!.transformToByteArray();
  const b64 = Buffer.from(bytes).toString("base64");
  return `data:audio/mpeg;base64,${b64}`;   // the client <Audio> already plays audioUrl
}
```
Wire it in `app/api/converse/route.ts`: after getting `replyText`, call `synthesize` and put
the result on `ConverseResult.audioUrl`. The Rehearsal screen already prefers `audioUrl` and
falls back to `speakText` if it's `null` — no client change needed.

### 5c. Transcribe (optional) — `src/services/transcribe.ts`

Only do this if browser Web Speech isn't good enough. It's a streaming API — open a mic
`MediaStream`, pipe PCM chunks to `StartStreamTranscriptionCommand`, read partial transcripts
back. Higher effort; keep the browser dictation as the fallback.

### 5d. S3 (optional) — `src/services/s3.ts`

`PutObject` the recorded `.webm` blob + the report JSON, return a presigned `GetObject` URL for
the download button. Without this, the existing local blob-URL download already satisfies the
brief's "download the recording" requirement.

---

## 6. Verify each tier (don't trust, test)

```bash
npm run typecheck        # no type breaks
npm run build            # compiles
npm run dev              # then exercise the flow in the browser
```
1. **Bedrock:** type 3 different scenarios → confirm 3 genuinely different personas.
2. **Polly:** start rehearsal → the reply should play in a natural neural voice, not the robotic
   browser one.
3. Watch the AWS **Billing** page after a few runs — confirm cents, not dollars.
4. If anything is flaky, set that service's path back to mock and **say so in the pitch**
   ("computed locally to stay in free tier") — never fake a live claim (CLAUDE.md §3).

---

## 7. Cost guardrails

- Claude Haiku-class dialogue is fractions of a cent per turn; a full demo is well under $1.
- Polly neural free tier = 1M chars/mo. Transcribe free tier = 60 min/mo.
- The **$1 budget alert** from step 2 is your safety net. Keep `max_tokens` modest (≤1024).
