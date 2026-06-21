import { useMemo } from "react";

interface Props {
  /** 0..1 fraction of the clip already played; bars up to here render in accent. */
  progress: number;
  /** Bar count. Defaults scale with width; 48 reads well in a card. */
  bars?: number;
  /** Deterministic seed so the same clip always draws the same shape. */
  seed?: string;
  className?: string;
}

// Cheap deterministic PRNG (mulberry32) seeded from a string, so a given
// recording/segment always renders the same grey bars — no flicker on re-render
// and no need to decode the actual audio just for a thumbnail.
function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Greyscale SVG waveform. Played portion is drawn in a single accent blue, the
 * rest in --ink-3 grey (DESIGN.md: "audio playback = greyscale waveform + one
 * blue"). No gradients / shadows. Purely presentational — seeking is handled by
 * the parent capturing clicks on the wrapping element.
 */
export function Waveform({ progress, bars = 48, seed = "wave", className }: Props) {
  const heights = useMemo(() => {
    const rnd = mulberry32(hashSeed(seed));
    return Array.from({ length: bars }, (_, i) => {
      // Smooth-ish envelope: blend neighbouring noise so it looks like audio,
      // not pure static. Min height keeps quiet sections visible.
      const base = 0.25 + 0.7 * rnd();
      const env = 0.55 + 0.45 * Math.sin((i / bars) * Math.PI);
      return Math.max(0.12, Math.min(1, base * env));
    });
  }, [bars, seed]);

  const clamped = Math.max(0, Math.min(1, progress));
  const gap = 2;
  const slot = 100 / bars; // % per bar slot

  return (
    <svg
      className={className}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {heights.map((h, i) => {
        const barH = h * 34 + 2;
        const y = (40 - barH) / 2;
        const x = i * slot + gap / 2;
        const w = Math.max(0.5, slot - gap);
        const played = (i + 0.5) / bars <= clamped;
        return (
          <rect
            key={i}
            className={played ? "b b--on" : "b"}
            x={x}
            y={y}
            width={w}
            height={barH}
            rx="0.6"
          />
        );
      })}
      {clamped > 0 && clamped < 1 && (
        <line className="ph" x1={clamped * 100} y1={0} x2={clamped * 100} y2={40} />
      )}
    </svg>
  );
}
