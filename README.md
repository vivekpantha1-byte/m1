# MIRA — Multimodal Interactive Rehearsal Assistant

> A web app where a student types a scenario, **rehearses a spoken conversation with a 3D
> virtual client** inside a virtual office, and gets an **AI communication-coaching report**
> afterward — with every score backed by a direct quote from the transcript.

Built for the **ACU IT Hackathon: Virtual Client Interaction Web App**. Runs entirely in the
browser on `localhost`, fully functional on deterministic mock data (no cloud account required
to demo), with a clean upgrade path to real AWS AI.

---

## ✨ What it does (mapped to the brief)

| Brief requirement | How MIRA delivers it |
|---|---|
| Accept a user-defined scenario via text | Scenario screen: free-text box + example chips |
| Generate a virtual space with a client figure | Procedural 3D avatar in a light, furnished office (React Three Fiber) |
| Student sees themselves via camera | Live webcam feed rendered on a **monitor inside the 3D scene** — you and the client share one room |
| Speak to the client and practise | Push-to-talk (browser speech) → client replies aloud (TTS) with a mouth + facial-expression reaction |
| Client responds naturally | Mood-aware dialogue; the avatar's face and the room's lighting shift with emotion |
| Record the session + download | `MediaRecorder` captures audio+video; one-click download of the `.webm` |
| *(beyond the brief)* Feedback for reflection | A full **coaching report**: overall score, skills radar, measured signals, evidence quotes, and two concrete tips — exportable to PDF |

---

## 🧱 Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript (strict)**
- **Tailwind CSS v4** + **shadcn/ui** (design tokens: clinical navy/teal + AWS orange)
- **3D:** React Three Fiber v9 + drei v10 (procedural primitives — **zero external 3D assets**)
- **Browser APIs:** Web Speech (dictation), Web Audio (waveform), MediaRecorder (capture), Canvas 2D (confetti)
- **Testing:** Vitest (deterministic metrics are tested first)
- **Cloud (optional):** Amazon Bedrock · Polly · Transcribe · S3 — see [`docs/AWS_SETUP.md`](docs/AWS_SETUP.md)

Everything external sits behind a **Mock / Real switch** (`USE_MOCKS`), so the whole app runs
and demos with no credentials.

---

## 🚀 Quick start

```bash
git clone https://github.com/vivekpantha1-byte/m1.git
cd m1
npm install
npm run dev            # → http://localhost:3000
```

That's it — the full flow works on mocks. To wire real AWS AI later, follow
[`docs/AWS_SETUP.md`](docs/AWS_SETUP.md).

### Scripts
| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (must always pass) |
| `npm run typecheck` | `tsc --noEmit` — strict type check |
| `npm run test` | Run the Vitest metrics suite |

---

## 🗺️ The flow

```
Scenario  ──►  Rehearsal  ──►  Report
 (type)        (speak +         (score + radar +
               3D client)        evidence + tips + PDF)
```

1. **Scenario** — describe a client/patient (or pick an example). MIRA builds a persona with a
   *hidden concern* and three learning objectives.
2. **Rehearsal** — you and the 3D client face each other in an office. Push-to-talk; the client
   replies aloud and reacts. Live coaching (talk-ratio, fillers, interruptions) updates each turn.
   The session is recorded.
3. **Report** — an evidence-grounded coaching report. Download it as a PDF or grab the recording.

---

## 📁 Project structure

```
src/
  app/
    page.tsx                 # shell + step router (Scenario→Rehearse→Report)
    api/
      scenario/route.ts      # POST text  -> Persona
      converse/route.ts      # POST turn  -> { replyText, audioUrl, mood }
      analyze/route.ts       # POST turns -> Report
  components/
    screens/                 # ScenarioScreen, RehearsalScreen, ReportScreen
    ui/                      # PersonaCard, LiveTranscript, ScoreDial, MetricChips, LiveCoach…
    three/                   # AvatarStage, Avatar, Room  (all R3F, 'use client')
  services/                  # bedrock, polly, … — each has a Mock + Real impl (USE_MOCKS)
  fixtures/                  # canned persona / conversation / report for the mock path
  lib/                       # useSession (context), metrics (deterministic scoring), speak…
  types.ts                   # FROZEN contracts — shapes don't change without agreement
```

**Architecture rules (full detail in [`CLAUDE.md`](CLAUDE.md)):**
- Client code never holds AWS keys or imports a service — only `app/api/*` routes do.
- Every `/api` route accepts `?demo=1` to return a fixture regardless of `USE_MOCKS`.
- The 3D avatar is built from primitives — no `.glb`/`.gltf` (zero load-time failure risk).

---

## 🔌 Mock vs Real

`USE_MOCKS` (in `.env.local`, defaults to `true`) is the master switch:

- **`true`** — deterministic fixtures, instant, no account. **Use this for the live demo.**
- **`false`** — real AWS calls. Wire one service at a time per [`docs/AWS_SETUP.md`](docs/AWS_SETUP.md).

---

## 🧪 Status & roadmap

**Working now (on mocks):** full Scenario→Rehearsal→Report flow, 3D office + expressive avatar,
camera-in-scene, voiced replies, session recording + download, live coaching, evidence-grounded
report, PDF export.

**Known limitation / next up:**
- The mock persona generator currently returns one fixed patient regardless of input. A
  **keyword router** (medical / IT-client / difficult-conversation archetypes) is the top
  priority so *"scenario drives the environment"* is true without needing AWS. *(See issues.)*

**Optional upgrades:** real Bedrock dialogue, Polly voice, Transcribe STT, S3 storage.

---

## 👥 Team & contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to run the project, the branch workflow, the
Mock/Real service pattern, coding standards, and a list of pick-up-able tasks.

---

## 📦 Deliverables checklist (hackathon)

- [x] Functioning prototype (web, localhost)
- [x] Scenario input → virtual environment
- [x] Camera self-view in the environment
- [x] Speak to client + natural reply
- [x] Record + download session
- [ ] Scenario **meaningfully** drives the environment *(keyword router — in progress)*
- [ ] 3-minute demonstration video
- [x] Technical explanation of how scenario drives the environment → this README + `CLAUDE.md`
- [ ] Reflection on student-learning impact *(draft in `docs/`)*
