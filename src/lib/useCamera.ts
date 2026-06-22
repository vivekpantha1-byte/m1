"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Camera self-view + guarded session recording (MediaRecorder). Everything is
 * wrapped in try/catch so a denied permission never breaks the rehearsal flow
 * (CLAUDE.md §4 — keep capture minimal and guarded).
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Start recording the session (best-effort).
        try {
          const rec = new MediaRecorder(stream);
          rec.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          rec.start();
          recorderRef.current = rec;
        } catch {
          /* recording unsupported — non-fatal */
        }
        setReady(true);
      } catch {
        setError("Camera unavailable — rehearsing without self-view.");
      }
    }
    void init();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /** Stops recording and resolves with an object URL for the recording, if any. */
  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const rec = recorderRef.current;
      if (!rec || rec.state === "inactive") {
        resolve(null);
        return;
      }
      rec.onstop = () => {
        if (chunksRef.current.length === 0) {
          resolve(null);
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };
      rec.stop();
    });
  }, []);

  return { videoRef, streamRef, ready, error, stopRecording };
}
