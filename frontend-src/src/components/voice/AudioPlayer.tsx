import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Waveform } from "./Waveform";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";

interface Props {
  src: string;
  /** Stable seed for the waveform shape (recording / segment id). */
  seed?: string;
  /** "full" = card player (40px wave); "mini" = inline clip player (24px). */
  variant?: "full" | "mini";
  /** Bar count override. */
  bars?: number;
  className?: string;
  /** Fired on every timeupdate with the current playhead in seconds. Lets a
   *  transcript view highlight the currently-spoken sentence. */
  onTime?: (currentSec: number) => void;
  /** External seek request: change this object (e.g. { sec, nonce }) to jump
   *  the playhead and start playing — used when a transcript sentence is
   *  clicked. The nonce lets repeated clicks on the same sentence re-trigger. */
  seekRequest?: { sec: number; nonce: number } | null;
  ariaLabel?: string;
}

// Player time read-out reuses the site-wide duration format (HH:MM:SS via
// formatDuration) so the player, list and detail all show时长 the same way
// (#41). formatDuration returns "00:00:00" for 0/negative/non-finite, which is
// exactly the zero-state we want here.
function fmt(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return formatDuration(0);
  return formatDuration(sec);
}

/**
 * Self-authored audio player replacing the native <audio controls> bar.
 *   · play / pause via .icon-btn
 *   · greyscale SVG waveform with the played portion in a single accent blue
 *   · mono time read-out (current / total)
 *   · click / drag on the waveform to seek
 * Built only on official tokens — no gradients, 3D or shadows.
 */
export function AudioPlayer({
  src,
  seed,
  variant = "full",
  bars,
  className,
  onTime,
  seekRequest,
  ariaLabel = "音频播放",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  // Reset transient state when the source changes (reused mini players swap src).
  useEffect(() => {
    setPlaying(false);
    setCur(0);
    setDur(0);
  }, [src]);

  // External seek (transcript sentence click): jump + play.
  const lastNonce = useRef<number | null>(null);
  useEffect(() => {
    if (!seekRequest) return;
    if (lastNonce.current === seekRequest.nonce) return;
    lastNonce.current = seekRequest.nonce;
    const el = audioRef.current;
    if (!el) return;
    const apply = () => {
      el.currentTime = seekRequest.sec;
      setCur(seekRequest.sec);
      el.play().catch(() => {});
    };
    if (isFinite(el.duration) && el.duration > 0) apply();
    else el.addEventListener("loadedmetadata", apply, { once: true });
  }, [seekRequest]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, []);

  const seekToClientX = useCallback((clientX: number) => {
    const el = audioRef.current;
    const wrap = waveRef.current;
    if (!el || !wrap || !isFinite(el.duration) || el.duration <= 0) return;
    const rect = wrap.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    el.currentTime = frac * el.duration;
    setCur(el.currentTime);
  }, []);

  const onWavePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      seekToClientX(e.clientX);
      const move = (ev: PointerEvent) => seekToClientX(ev.clientX);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [seekToClientX],
  );

  const progress = dur > 0 ? cur / dur : 0;
  const waveBars = bars ?? (variant === "mini" ? 32 : 56);

  return (
    <div className={cn("player", variant === "mini" && "player--mini", className)}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCur(0);
        }}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onDurationChange={(e) => setDur(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setCur(t);
          onTime?.(t);
        }}
      />
      <button
        type="button"
        className="icon-btn"
        aria-label={playing ? "暂停" : "播放"}
        aria-pressed={playing}
        onClick={toggle}
      >
        <Icon name={playing ? "pause" : "play"} size={variant === "mini" ? 14 : 16} />
      </button>
      <div
        ref={waveRef}
        className="player__wave"
        role="slider"
        aria-label={`${ariaLabel}进度`}
        aria-valuemin={0}
        aria-valuemax={Math.round(dur)}
        aria-valuenow={Math.round(cur)}
        aria-valuetext={`${fmt(cur)} / ${fmt(dur)}`}
        tabIndex={0}
        onPointerDown={onWavePointerDown}
        onKeyDown={(e) => {
          const el = audioRef.current;
          if (!el || !isFinite(el.duration)) return;
          if (e.key === "ArrowRight") {
            el.currentTime = Math.min(el.duration, el.currentTime + 5);
            setCur(el.currentTime);
            e.preventDefault();
          } else if (e.key === "ArrowLeft") {
            el.currentTime = Math.max(0, el.currentTime - 5);
            setCur(el.currentTime);
            e.preventDefault();
          } else if (e.key === " " || e.key === "Enter") {
            toggle();
            e.preventDefault();
          }
        }}
      >
        <Waveform progress={progress} bars={waveBars} seed={seed ?? id} />
      </div>
      <span className="player__time">
        {fmt(cur)}
        <span className="sep">/</span>
        {fmt(dur)}
      </span>
    </div>
  );
}
