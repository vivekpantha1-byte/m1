import type { Persona } from "@/types";

/**
 * Canned persona for the demo / mock path. Parsed (in real mode) from a free-text
 * scenario by /api/scenario. Drives the PersonaCard and the 3D avatar's mood.
 */
export const mockPersona: Persona = {
  role: "Patient — Margaret, 58",
  scene: "Presenting to the clinic with two days of intermittent chest pain",
  emotion: "Anxious, guarded — downplays symptoms, deflects with small talk",
  difficulty: "Hard",
  hiddenConcern:
    "Privately terrified she is having a heart attack like her late father, but afraid that saying it out loud will make it real.",
  objectives: [
    "Build rapport and create psychological safety before probing symptoms",
    "Use open questions to surface the hidden cardiac fear without leading",
    "Summarise and agree a clear, shared next step (ECG + bloods today)",
  ],
  avatarMood: "anxious",
  voiceId: "Joanna",
};
