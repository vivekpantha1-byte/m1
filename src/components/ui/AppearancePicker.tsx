"use client";

// Lets the student override the auto-selected avatar and room. The 3D preview
// updates live because AvatarStage reads the same useAppearance() selection.

import {
  ARCHETYPES,
  ARCHETYPE_META,
  ROOM_THEMES,
  type Archetype,
} from "@/lib/archetype";
import { useAppearance } from "@/lib/useAppearance";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-all " +
        (active
          ? "border-teal bg-teal/15 text-teal"
          : "border-navy2/15 bg-white text-navy hover:border-teal/50")
      }
    >
      {children}
    </button>
  );
}

export function AppearancePicker() {
  const { lookKey, themeKey, setLookKey, setThemeKey } = useAppearance();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-navy2/10 bg-white p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-dim">
        Customise the scene
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-dim">Avatar</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={lookKey === null} onClick={() => setLookKey(null)}>
            ✨ Auto
          </Chip>
          {ARCHETYPES.map((a: Archetype) => (
            <Chip key={a} active={lookKey === a} onClick={() => setLookKey(a)}>
              {ARCHETYPE_META[a].emoji} {ARCHETYPE_META[a].label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-dim">Room</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={themeKey === null} onClick={() => setThemeKey(null)}>
            ✨ Auto
          </Chip>
          {ARCHETYPES.map((a: Archetype) => (
            <Chip key={a} active={themeKey === a} onClick={() => setThemeKey(a)}>
              {ROOM_THEMES[a].label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
