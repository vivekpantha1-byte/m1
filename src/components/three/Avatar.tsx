"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";
import type { Mood } from "@/types";
import { AVATAR_LOOKS, type AvatarLook } from "@/lib/archetype";

// Eye colour is shared across looks; skin/hair/clothing come from the AvatarLook.
const EYE_IRIS = "#5b3a24";

// ─── Per-mood expression + posture ────────────────────────────────────────────
// browInner > 0 raises the inner brow (sad); < 0 lowers it (angry/frown).
// mouthCurve > 0 = smile, < 0 = frown. headTilt/hunch set body language.
const EXPRESSION: Record<
  Mood,
  { browY: number; browInner: number; mouthCurve: number; hunch: number; headTilt: number; headNod: number }
> = {
  neutral: { browY:  0.000, browInner:  0.00, mouthCurve:  0.04, hunch:  0.02, headTilt:  0.00, headNod:  0.00 },
  anxious: { browY:  0.012, browInner:  0.16, mouthCurve: -0.05, hunch:  0.12, headTilt:  0.07, headNod:  0.06 },
  angry:   { browY: -0.014, browInner: -0.30, mouthCurve: -0.12, hunch: -0.06, headTilt: -0.05, headNod: -0.03 },
  sad:     { browY:  0.008, browInner:  0.34, mouthCurve: -0.18, hunch:  0.22, headTilt:  0.17, headNod:  0.12 },
};

/**
 * Procedural, realistic-styled patient (CLAUDE.md §4 — zero external assets).
 * Soft PBR materials, articulated facial features (brows + mouth) that animate
 * per mood for readable emotion, idle breathing, and a speaking mouth.
 */
export function Avatar({
  mood,
  speaking,
  look = AVATAR_LOOKS.medical,
}: {
  mood: Mood;
  speaking: boolean;
  look?: AvatarLook;
}) {
  // Per-archetype palette (skin / hair / clothing) drives the whole figure.
  const SKIN = look.skin;
  const SKIN_DK = look.skinDk;
  const LIP = look.lip;
  const HAIR = look.hair;
  const CARDIGAN = look.top;
  const SHIRT = look.topAccent;

  const root      = useRef<Group>(null);
  const head      = useRef<Group>(null);
  const leftArm   = useRef<Group>(null);
  const rightArm  = useRef<Group>(null);
  const chestMesh = useRef<Mesh>(null);
  const leftBrow  = useRef<Mesh>(null);
  const rightBrow = useRef<Mesh>(null);
  const mouth     = useRef<Group>(null);
  const mouthOpen = useRef<Mesh>(null);

  // Gaze tracking: subtle glance toward the user's cursor.
  const gazeRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      gazeRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const ex = EXPRESSION[mood];

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Idle breathing: gentle bob + lean into posture
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.3) * 0.014;
      root.current.rotation.x = MathUtils.lerp(root.current.rotation.x, ex.hunch, 0.04);
    }
    if (chestMesh.current) {
      chestMesh.current.scale.z = 1 + Math.sin(t * 1.3) * 0.04;
    }

    // Head: mood tilt + gaze + slow sway + talking nod
    if (head.current) {
      const talkNod = speaking ? Math.sin(t * 7.5) * 0.06 : 0;
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, ex.headTilt, 0.05);
      head.current.rotation.x = MathUtils.lerp(
        head.current.rotation.x,
        talkNod + ex.headNod + Math.sin(t * 0.8) * 0.02,
        0.12,
      );
      head.current.rotation.y = MathUtils.lerp(
        head.current.rotation.y,
        gazeRef.current.x * 0.22,
        0.05,
      );
    }

    // Eyebrows: vertical offset + inner-corner tilt (mirrored)
    if (leftBrow.current) {
      leftBrow.current.position.y  = MathUtils.lerp(leftBrow.current.position.y, 0.052 + ex.browY, 0.1);
      leftBrow.current.rotation.z  = MathUtils.lerp(leftBrow.current.rotation.z,  ex.browInner, 0.1);
    }
    if (rightBrow.current) {
      rightBrow.current.position.y = MathUtils.lerp(rightBrow.current.position.y, 0.052 + ex.browY, 0.1);
      rightBrow.current.rotation.z = MathUtils.lerp(rightBrow.current.rotation.z, -ex.browInner, 0.1);
    }

    // Mouth: curve from frown(∩, rot 0) to smile(∪, rot π); deeper = stronger
    if (mouth.current) {
      const targetRot = ex.mouthCurve >= 0 ? Math.PI : 0;
      mouth.current.rotation.z = MathUtils.lerp(mouth.current.rotation.z, targetRot, 0.1);
      const depth = 0.35 + Math.abs(ex.mouthCurve) * 3.2;
      mouth.current.scale.y = MathUtils.lerp(mouth.current.scale.y, depth, 0.1);
    }
    // Talking: open mouth gap pulses while speaking
    if (mouthOpen.current) {
      const open = speaking ? 0.5 + Math.abs(Math.sin(t * 9)) * 1.6 : 0.0;
      mouthOpen.current.scale.y = MathUtils.lerp(mouthOpen.current.scale.y, open, 0.3);
    }

    // Arms: subtle gesture during speech
    const gesture = speaking ? Math.sin(t * 5) * 0.12 : 0;
    if (leftArm.current)  leftArm.current.rotation.z  = MathUtils.lerp(leftArm.current.rotation.z,  0.26 + gesture, 0.1);
    if (rightArm.current) rightArm.current.rotation.z = MathUtils.lerp(rightArm.current.rotation.z, -0.26 - gesture, 0.1);
  });

  return (
    <group ref={root}>
      {/* ── HEAD ─────────────────────────────────────────────────────── */}
      <group ref={head} position={[0, 1.53, 0]}>
        {/* Skull */}
        <mesh castShadow>
          <sphereGeometry args={[0.155, 32, 28]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        {/* Jaw / chin fill */}
        <mesh position={[0, -0.085, 0.018]}>
          <sphereGeometry args={[0.118, 24, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        {/* Hair — style varies by archetype (bob / short / ponytail / bald) */}
        {look.hairStyle !== "bald" && (
          <mesh
            position={[0, look.hairStyle === "short" ? 0.04 : 0.028, -0.008]}
          >
            <sphereGeometry
              args={[
                look.hairStyle === "short" ? 0.16 : 0.166,
                28,
                20,
                0,
                Math.PI * 2,
                0,
                look.hairStyle === "short" ? Math.PI * 0.46 : Math.PI * 0.56,
              ]}
            />
            <meshStandardMaterial color={HAIR} roughness={0.95} />
          </mesh>
        )}
        {/* Fuller side hair only for the bob */}
        {look.hairStyle === "bob" && (
          <>
            <mesh position={[-0.13, -0.01, -0.02]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={HAIR} roughness={0.95} />
            </mesh>
            <mesh position={[0.13, -0.01, -0.02]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial color={HAIR} roughness={0.95} />
            </mesh>
          </>
        )}
        {/* Tied-back ponytail bun */}
        {look.hairStyle === "ponytail" && (
          <mesh position={[0, 0.02, -0.16]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.95} />
          </mesh>
        )}

        {/* Ears */}
        <mesh position={[-0.153, -0.005, 0.01]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={SKIN_DK} roughness={0.6} />
        </mesh>
        <mesh position={[0.153, -0.005, 0.01]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={SKIN_DK} roughness={0.6} />
        </mesh>

        {/* Eye sockets (subtle) + eyes */}
        <group position={[0, 0.012, 0]}>
          {/* Left eye white */}
          <mesh position={[-0.058, 0.0, 0.137]}>
            <sphereGeometry args={[0.0235, 16, 16]} />
            <meshStandardMaterial color="#f4f1ec" roughness={0.3} />
          </mesh>
          {/* Left iris */}
          <mesh position={[-0.058, 0.0, 0.158]}>
            <sphereGeometry args={[0.0115, 14, 14]} />
            <meshStandardMaterial color={EYE_IRIS} roughness={0.25} />
          </mesh>
          {/* Left pupil */}
          <mesh position={[-0.058, 0.0, 0.167]}>
            <sphereGeometry args={[0.005, 10, 10]} />
            <meshStandardMaterial color="#120a06" />
          </mesh>
          {/* Right eye white */}
          <mesh position={[0.058, 0.0, 0.137]}>
            <sphereGeometry args={[0.0235, 16, 16]} />
            <meshStandardMaterial color="#f4f1ec" roughness={0.3} />
          </mesh>
          {/* Right iris */}
          <mesh position={[0.058, 0.0, 0.158]}>
            <sphereGeometry args={[0.0115, 14, 14]} />
            <meshStandardMaterial color={EYE_IRIS} roughness={0.25} />
          </mesh>
          {/* Right pupil */}
          <mesh position={[0.058, 0.0, 0.167]}>
            <sphereGeometry args={[0.005, 10, 10]} />
            <meshStandardMaterial color="#120a06" />
          </mesh>
        </group>

        {/* Upper eyelids (skin hoods, sit just above eyes) */}
        <mesh position={[-0.058, 0.03, 0.142]} rotation={[0.35, 0, 0]}>
          <sphereGeometry args={[0.026, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0.058, 0.03, 0.142]} rotation={[0.35, 0, 0]}>
          <sphereGeometry args={[0.026, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>

        {/* Eyebrows (animated) */}
        <mesh ref={leftBrow} position={[-0.058, 0.052, 0.15]}>
          <boxGeometry args={[0.05, 0.01, 0.012]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        <mesh ref={rightBrow} position={[0.058, 0.052, 0.15]}>
          <boxGeometry args={[0.05, 0.01, 0.012]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.012, 0.156]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.026, 0.075, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.04, 0.158]}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>

        {/* Mouth: lips arc (animated curve) + dark opening for talking */}
        <group ref={mouth} position={[0, -0.082, 0.142]}>
          <mesh>
            <torusGeometry args={[0.032, 0.0085, 8, 18, Math.PI]} />
            <meshStandardMaterial color={LIP} roughness={0.5} />
          </mesh>
        </group>
        <mesh ref={mouthOpen} position={[0, -0.086, 0.146]} scale={[1, 0, 1]}>
          <sphereGeometry args={[0.022, 12, 10]} />
          <meshStandardMaterial color="#3a1a18" roughness={0.7} />
        </mesh>

        {/* Cheeks (soft) */}
        <mesh position={[-0.082, -0.04, 0.11]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0.082, -0.04, 0.11]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
      </group>

      {/* ── NECK ─────────────────────────────────────────────────────── */}
      <mesh position={[0, 1.375, 0]} castShadow>
        <cylinderGeometry args={[0.056, 0.07, 0.13, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>

      {/* ── COLLAR / SHIRT ───────────────────────────────────────────── */}
      <mesh position={[0, 1.285, 0.02]}>
        <sphereGeometry args={[0.1, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={SHIRT} roughness={0.8} />
      </mesh>

      {/* ── SHOULDERS (cardigan) ─────────────────────────────────────── */}
      <mesh position={[-0.26, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.088, 18, 16]} />
        <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
      </mesh>
      <mesh position={[0.26, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.088, 18, 16]} />
        <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
      </mesh>

      {/* ── CHEST ────────────────────────────────────────────────────── */}
      <mesh ref={chestMesh} position={[0, 1.02, 0]} castShadow>
        <capsuleGeometry args={[0.175, 0.38, 8, 18]} />
        <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
      </mesh>
      {/* Cardigan front opening (shirt strip) */}
      <mesh position={[0, 1.04, 0.165]}>
        <boxGeometry args={[0.07, 0.42, 0.02]} />
        <meshStandardMaterial color={SHIRT} roughness={0.8} />
      </mesh>

      {/* ── WAIST ────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.17, 8, 16]} />
        <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
      </mesh>

      {/* ── LEFT ARM ─────────────────────────────────────────────────── */}
      <group ref={leftArm} position={[-0.28, 1.18, 0]}>
        <mesh position={[0, -0.21, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.30, 8, 12]} />
          <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
        </mesh>
        <mesh position={[-0.04, -0.48, 0.04]} castShadow>
          <capsuleGeometry args={[0.05, 0.24, 8, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[-0.05, -0.67, 0.06]}>
          <sphereGeometry args={[0.052, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ────────────────────────────────────────────────── */}
      <group ref={rightArm} position={[0.28, 1.18, 0]}>
        <mesh position={[0, -0.21, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.30, 8, 12]} />
          <meshStandardMaterial color={CARDIGAN} roughness={0.85} />
        </mesh>
        <mesh position={[0.04, -0.48, 0.04]} castShadow>
          <capsuleGeometry args={[0.05, 0.24, 8, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0.05, -0.67, 0.06]}>
          <sphereGeometry args={[0.052, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* ── PELVIS / LOWER ───────────────────────────────────────────── */}
      <mesh position={[0, 0.57, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.08, 8, 16]} />
        <meshStandardMaterial color="#3c4654" roughness={0.85} />
      </mesh>
    </group>
  );
}
