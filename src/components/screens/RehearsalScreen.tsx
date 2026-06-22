"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ConverseResult, Mood, Report, Turn } from "@/types";
import { useSession } from "@/lib/useSession";
import { useAppearance } from "@/lib/useAppearance";
import { useCamera } from "@/lib/useCamera";
import { useDictation } from "@/lib/useDictation";
import { playAudio, speakText } from "@/lib/speak";
import { LiveTranscript } from "@/components/ui/LiveTranscript";
import { LiveCoach }     from "@/components/ui/LiveCoach";
import { Button } from "@/components/ui/button";
import { MicControl } from "@/components/ui/MicControl";

const AvatarStage = dynamic(
  () => import("@/components/three/AvatarStage").then((m) => m.AvatarStage),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#19102b]">
        <div className="shimmer h-24 w-24 rounded-full" />
      </div>
    ),
  },
);

export function RehearsalScreen() {
  const { persona, turns, addTurn, setReport, setRecordingUrl, goToStep } =
    useSession();
  const { lookKey, themeKey } = useAppearance();
  const { videoRef, streamRef, stopRecording } = useCamera();

  const [mood, setMood] = useState<Mood>(persona?.avatarMood ?? "neutral");
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [moodToast, setMoodToast] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  // Session timer.
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const handleStudentUtterance = useCallback(
    async (text: string) => {
      if (!text.trim() || thinking || speaking) return;
      const tMs = Date.now() - startedAt.current;
      const studentTurn: Turn = { speaker: "student", text, tMs };
      addTurn(studentTurn);

      setThinking(true);
      try {
        const res = await fetch("/api/converse", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            turns: [...turns, studentTurn],
            studentText: text,
            persona,
          }),
        });
        const data: ConverseResult = await res.json();
        setThinking(false);

        addTurn({
          speaker: "client",
          text: data.replyText,
          tMs: Date.now() - startedAt.current,
        });
        if (data.mood !== mood) {
          const who =
            persona?.role.split("—")[1]?.split(",")[0]?.trim() ?? "The client";
          const TOAST: Record<Mood, string> = {
            neutral: `${who} seems more at ease`,
            anxious: `${who} is becoming more anxious`,
            angry:   `${who} is getting frustrated`,
            sad:     `${who} appears distressed`,
          };
          setMoodToast(TOAST[data.mood]);
          setTimeout(() => setMoodToast(null), 3200);
        }
        setMood(data.mood);

        // W2: speak the reply (Polly mp3 if present, else browser TTS).
        setSpeaking(true);
        if (data.audioUrl) await playAudio(data.audioUrl);
        else await speakText(data.replyText);
        setSpeaking(false);
      } catch {
        setThinking(false);
        setSpeaking(false);
      }
    },
    [addTurn, turns, thinking, speaking, mood, persona],
  );

  const { supported, listening, interim, start, stop } =
    useDictation(handleStudentUtterance);

  async function endSession() {
    if (ending) return;
    setEnding(true);
    const recordingUrl = await stopRecording();
    if (recordingUrl) setRecordingUrl(recordingUrl);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ turns }),
      });
      const report: Report = await res.json();
      setReport(report);
      goToStep(3);
    } catch {
      setEnding(false);
    }
  }

  // Hidden video element keeps the browser stream alive for MediaRecorder.
  // The actual self-view is rendered as a VideoTexture inside the 3D scene.
  const hiddenVideo = (
    <video ref={videoRef} autoPlay muted playsInline className="hidden" aria-hidden />
  );

  if (!persona) return <>{hiddenVideo}</>;


  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <>
    {hiddenVideo}
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-6 py-6 lg:grid-cols-[2fr_1fr]">
      {/* Left: 3D stage — sticky so avatar never drifts when transcript grows */}
      <section className="sticky top-0 flex flex-col gap-4 self-start">
        <div className="relative h-[60vh] overflow-hidden rounded-2xl bg-[#19102b] ring-1 ring-navy2/10">
          <AvatarStage
            persona={persona}
            mood={mood}
            speaking={speaking}
            videoStream={streamRef.current}
            lookKey={lookKey}
            themeKey={themeKey}
          />

          {/* Persona name badge */}
          <div className="absolute left-4 top-4 rounded-full bg-navy/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {persona.role}
          </div>

          {/* Mood shift toast */}
          {moodToast && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 reveal rounded-full bg-navy/90 px-4 py-1.5 text-xs font-semibold text-teal backdrop-blur-md ring-1 ring-teal/30 whitespace-nowrap">
              ◈ {moodToast}
            </div>
          )}

          {/* Session timer */}
          <div className="absolute right-4 top-4 rounded-full bg-navy/80 px-3 py-1 font-mono text-xs text-white backdrop-blur">
            ● {mm}:{ss}
          </div>

          {/* "MIRA is thinking" overlay */}
          {thinking && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gradient-to-t from-navy/90 to-transparent py-5">
              <span className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-teal" />
              <span className="ml-2 text-xs font-medium text-white/80 tracking-wide">MIRA is thinking…</span>
            </div>
          )}

          {/* Speaking indicator */}
          {speaking && !thinking && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gradient-to-t from-navy/90 to-transparent py-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
              </span>
              <span className="ml-1 text-xs font-medium text-teal tracking-wide">Speaking</span>
            </div>
          )}
        </div>

        <MicControl
          supported={supported}
          listening={listening}
          interim={interim}
          disabled={thinking || speaking || ending}
          stream={streamRef.current}
          onStart={start}
          onStop={stop}
          onSubmitText={handleStudentUtterance}
        />
      </section>

      {/* Right: self-view + live coach + transcript + end */}
      <section className="flex flex-col gap-3 min-h-0 overflow-y-auto">
        {/* Live coaching signals */}
        <LiveCoach turns={turns} />

        <div className="min-h-0 flex-1">
          <LiveTranscript
            turns={turns}
            isThinking={thinking}
            clientName={persona.role.split("—")[1]?.trim() ?? "Client"}
          />
        </div>

        <div className="sticky bottom-0 pt-1 pb-1 bg-paper">
          <Button
            onClick={endSession}
            disabled={ending || turns.length === 0}
            className="w-full bg-orange text-white hover:opacity-90"
          >
            {ending ? "Scoring your session…" : "End session & get report"}
          </Button>
        </div>
      </section>
    </div>
    </>
  );
}
