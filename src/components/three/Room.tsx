"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { PointLight } from "three";
import type { Mood } from "@/types";
import { MOOD_ACCENT, ROOM_THEMES, type RoomTheme } from "@/lib/archetype";

export function Room({
  mood,
  theme = ROOM_THEMES.medical,
}: {
  mood: Mood;
  theme?: RoomTheme;
}) {
  const accentRef = useRef<PointLight>(null);
  const accent = MOOD_ACCENT[mood];

  // Per-archetype palette (walls, floor, accent) — the scene changes per scenario.
  const WALL = theme.wall;
  const WALL_2 = theme.wallDk;
  const FLOOR = theme.floor;

  // Subtle mood-reactive accent (kept gentle so the room stays bright & calm)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!accentRef.current) return;
    switch (mood) {
      case "anxious": accentRef.current.intensity = 2.6 + Math.sin(t * 8) * 0.8; break;
      case "angry":   accentRef.current.intensity = 3.4 + Math.sin(t * 4.5) * 1.4; break;
      case "sad":     accentRef.current.intensity = 1.6 + Math.sin(t * 0.8) * 0.5; break;
      default:        accentRef.current.intensity = 2.2;
    }
  });

  return (
    <>
      {/* ── Bright, even lighting (base level set by the theme) ───────── */}
      <ambientLight intensity={theme.ambient} />
      <hemisphereLight args={["#fffaf0", "#d8cfc0", 0.9]} />

      {/* Key light (window daylight), casts soft shadow */}
      <directionalLight
        position={[-2.5, 4.5, 3]}
        intensity={1.5}
        color="#fff4e2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      {/* Soft fill from camera side */}
      <directionalLight position={[3, 3, 4]} intensity={0.5} color="#ffffff" />

      {/* Subtle mood accent */}
      <pointLight ref={accentRef} position={[2.5, 2.2, 1.5]} color={accent} distance={12} />

      {/* ── Floor (light wood) ───────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={FLOOR} roughness={0.85} />
      </mesh>

      {/* ── Area rug under the scene ─────────────────────────────────── */}
      <mesh position={[0.1, 0.008, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.6, 2.8]} />
        <meshStandardMaterial color="#b9a585" roughness={0.95} />
      </mesh>
      <mesh position={[0.1, 0.012, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 2.4]} />
        <meshStandardMaterial color="#c8b89c" roughness={0.95} />
      </mesh>

      {/* ── Ceiling ──────────────────────────────────────────────────── */}
      <mesh position={[0, 3.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 6] } />
        <meshStandardMaterial color="#f3ede2" roughness={1} />
      </mesh>

      {/* ── Back wall ────────────────────────────────────────────────── */}
      <mesh position={[0, 1.7, -2.6]} receiveShadow>
        <planeGeometry args={[7, 3.8]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* Skirting board */}
      <mesh position={[0, 0.06, -2.58]}>
        <planeGeometry args={[7, 0.12]} />
        <meshStandardMaterial color={WALL_2} roughness={0.9} />
      </mesh>

      {/* ── Left wall ────────────────────────────────────────────────── */}
      <mesh position={[-3.0, 1.7, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3.8]} />
        <meshStandardMaterial color={WALL_2} roughness={0.95} />
      </mesh>

      {/* ── Right wall ───────────────────────────────────────────────── */}
      <mesh position={[3.0, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3.8]} />
        <meshStandardMaterial color={WALL_2} roughness={0.95} />
      </mesh>

      {/* ── Window on left wall (bright daylight) ────────────────────── */}
      <group position={[-2.96, 1.85, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        {/* frame */}
        <mesh><planeGeometry args={[1.7, 1.35]} /><meshStandardMaterial color="#ffffff" roughness={0.7} /></mesh>
        {/* sky glow */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.55, 1.2]} />
          <meshStandardMaterial color="#dff1ff" emissive="#cfe8ff" emissiveIntensity={0.9} />
        </mesh>
        {/* mullions */}
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[0.02, 1.2]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[1.55, 0.02]} /><meshStandardMaterial color="#ffffff" /></mesh>
      </group>

      {/* ── Framed picture on back wall ──────────────────────────────── */}
      <mesh position={[1.6, 2.0, -2.57]}>
        <planeGeometry args={[0.9, 0.62]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      {/* Framed wall art — tinted with the scenario's accent colour */}
      <mesh position={[1.6, 2.0, -2.56]}>
        <planeGeometry args={[0.78, 0.5]} />
        <meshStandardMaterial color={theme.accent} roughness={0.7} />
      </mesh>

      {/* ── Wall clock ───────────────────────────────────────────────── */}
      <mesh position={[0, 2.4, -2.56]}>
        <circleGeometry args={[0.18, 28]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, -2.55]}>
        <ringGeometry args={[0.16, 0.18, 28]} />
        <meshStandardMaterial color="#33414f" />
      </mesh>

      {/* ── Bookshelf on back wall (left) ────────────────────────────── */}
      <group position={[-2.0, 0, -2.35]}>
        {/* cabinet body */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.9, 1.6, 0.32]} />
          <meshStandardMaterial color="#caa877" roughness={0.7} />
        </mesh>
        {/* shelf gaps (darker insets) */}
        {[0.45, 0.95, 1.45].map((y) => (
          <mesh key={y} position={[0, y, 0.13]}>
            <boxGeometry args={[0.78, 0.42, 0.08]} />
            <meshStandardMaterial color="#7e6240" roughness={0.85} />
          </mesh>
        ))}
        {/* book spines */}
        {[
          { x: -0.28, y: 0.45, h: 0.34, c: "#b5544a" },
          { x: -0.16, y: 0.45, h: 0.3,  c: "#3f6f8a" },
          { x: -0.05, y: 0.45, h: 0.36, c: "#4e8a4a" },
          { x: 0.07,  y: 0.45, h: 0.32, c: "#c98a3a" },
          { x: 0.19,  y: 0.45, h: 0.34, c: "#7a5c8a" },
          { x: -0.24, y: 0.95, h: 0.3,  c: "#4e8a4a" },
          { x: -0.12, y: 0.95, h: 0.34, c: "#c98a3a" },
          { x: 0.0,   y: 0.95, h: 0.32, c: "#b5544a" },
          { x: 0.14,  y: 0.95, h: 0.3,  c: "#3f6f8a" },
        ].map((b, i) => (
          <mesh key={i} position={[b.x, b.y, 0.15]} castShadow>
            <boxGeometry args={[0.09, b.h, 0.16]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </mesh>
        ))}
      </group>

      {/* ── Door on right wall ───────────────────────────────────────── */}
      <group position={[2.97, 0, 1.0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.05, 0]}>
          <planeGeometry args={[0.95, 2.1]} />
          <meshStandardMaterial color="#d8cab0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 0.01]}>
          <planeGeometry args={[0.8, 1.9]} />
          <meshStandardMaterial color="#cbb896" roughness={0.85} />
        </mesh>
        {/* handle */}
        <mesh position={[0.34, 1.0, 0.03]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#9a9a9a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Potted plant (corner) ────────────────────────────────────── */}
      <group position={[2.4, 0, -1.9]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.12, 0.36, 14]} />
          <meshStandardMaterial color="#c97f4a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#4e8a4a" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.72, 0.05]} castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#5a9a52" roughness={0.9} />
        </mesh>
        <mesh position={[-0.13, 0.66, -0.04]} castShadow>
          <sphereGeometry args={[0.16, 14, 14]} />
          <meshStandardMaterial color="#467e44" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Soft contact shadow under avatar ─────────────────────────── */}
      <ContactShadows position={[0, 0.001, 0]} opacity={0.32} scale={6} blur={2.8} far={3} />
    </>
  );
}
