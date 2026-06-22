# Contributing to MIRA

Welcome, teammate! 👋 This guide gets you running and shipping in ~5 minutes. The golden rule
of this project: **the demo must always work on mocks.** Never leave `main` in a state where
`npm run build` fails or the Scenario→Rehearsal→Report flow breaks.

---

## 1. Get it running

```bash
git clone https://github.com/vivekpantha1-byte/m1.git
cd m1
npm install
npm run dev            # → http://localhost:3000
```
No `.env.local` needed — it runs on deterministic mocks out of the box.

> Use a recent **Node 20+** and **Chrome** (the speech + camera APIs are best supported there).

---

## 2. How we work (branch + PR flow)

We don't commit straight to `main`.

```bash
git checkout main
git pull
git checkout -b feat/<short-name>      # e.g. feat/scenario-router
# …make small, compiling changes…
npm run typecheck && npm run build      # both MUST pass
git add -A
git commit -m "feat: clear, present-tense summary"
git push -u origin feat/<short-name>
# open a Pull Request on GitHub; another teammate reviews + merges
```

**Before every PR:** `npm run typecheck` ✔ `npm run build` ✔ `npm run test` ✔ (and click
through the 3 screens once).

---

## 3. The one pattern you must follow: Mock / Real services

Every external/AWS call lives in `src/services/` behind a switch. **Client code never imports a
service and never holds keys** — only `src/app/api/*` routes call services.

```ts
const USE_MOCKS = process.env.USE_MOCKS !== "false";

export async function parseScenario(text: string): Promise<Persona> {
  if (USE_MOCKS) return mockParseScenario(text);   // deterministic, instant
  return realParseScenario(text);                  // real AWS (see docs/AWS_SETUP.md)
}
```

- Adding a feature that needs data? Add a **mock first** so the demo keeps working.
- Wiring real AWS? That's [`docs/AWS_SETUP.md`](docs/AWS_SETUP.md) — do it on a branch, verify, then merge.

---

## 4. Coding standards (short version)

Full rules live in [`CLAUDE.md`](CLAUDE.md) / [`.cursorrules`](.cursorrules). The essentials:

- **TypeScript strict, no `any`.** Use `unknown` + narrow. `src/types.ts` shapes are **frozen** —
  don't change a shape without team agreement.
- **Small diffs, always compiling.** Prefer editing a file over regenerating it. One thing at a time.
- **No new npm dependencies without asking the team.** (Going live with AWS is the agreed exception.)
- **Components < ~150 lines, one job each.** Tailwind for layout, shadcn/ui for primitives.
- **Accessibility:** keyboard-reachable controls, visible focus rings, captions on, loading/empty states.
- **3D (`src/components/three/`):** procedural primitives only — **no `.glb`/`.gltf` assets**.
  Animate via `useFrame`. Files start with `'use client'`; the stage is loaded with
  `dynamic(import, { ssr: false })`.
- **Metrics (`src/lib/metrics.ts`):** write the Vitest test first, then make it pass.

---

## 5. Good first tasks (pick one, open an issue/PR)

| Area | Task | Files |
|---|---|---|
| 🥇 **Core** | **Scenario keyword router** — make medical / IT-client / difficult-conversation scenarios produce *different* personas | `services/bedrock.ts` (`mockParseScenario`), `fixtures/persona.ts` |
| Content | Add 2–3 more example scenario chips + matching mock personas | `screens/ScenarioScreen.tsx`, `fixtures/` |
| 3D | A second simple "student" figurine beside the camera monitor | `three/AvatarStage.tsx` |
| UX | Mobile / narrow-screen layout pass for all 3 screens | `screens/*` |
| Feature | 30-minute session auto-stop (brief caps sessions at 30 min) | `screens/RehearsalScreen.tsx` |
| Cloud | Wire real Bedrock dialogue | `services/bedrock.ts` + `docs/AWS_SETUP.md` |
| Cloud | Wire real Polly voice | `services/polly.ts` |
| Docs | Draft the "reflection on student learning" deliverable | `docs/` |

---

## 6. Project map (where things live)

```
src/app/          step router + API routes (the only place services are called)
src/components/screens   the 3 screens
src/components/ui        DOM widgets (cards, dials, transcript, coach panel)
src/components/three     R3F scene (AvatarStage, Avatar, Room)
src/services      Mock+Real external calls (bedrock, polly…)
src/fixtures      canned demo data (persona, conversation, report)
src/lib           useSession context, deterministic metrics, speak helpers
src/types.ts      FROZEN contracts
docs/AWS_SETUP.md how to go live on AWS
```

---

## 7. Communication

- Keep PRs small and described. Say what changed and how you verified it.
- If you're unsure about a shape or an architecture call — **ask in the team chat before coding.**
  Re-deriving a wrong assumption is more expensive than a 1-minute question.

Thanks for keeping MIRA stable and shippable. 🚀
