import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/Icon";
import type { TranscriptSegment } from "@/api/types";

interface Props {
  segments: TranscriptSegment[];
  /** Current playhead in seconds — the sentence containing it is highlighted. */
  currentSec?: number;
  /** Click a sentence to seek there (seconds). */
  onSeek?: (sec: number) => void;
  /** Auto-scroll the highlighted sentence into view as playback advances. */
  followPlayback?: boolean;
}

// Assign each distinct speaker a stable marker variant (shape, not pure colour),
// so the transcript stays readable in greyscale per the single-blue rule.
function useSpeakerMarkers(segments: TranscriptSegment[]): Map<string, number> {
  return useMemo(() => {
    const m = new Map<string, number>();
    let next = 0;
    for (const s of segments) {
      if (!m.has(s.speaker)) m.set(s.speaker, next++ % 6);
    }
    return m;
  }, [segments]);
}

/**
 * Per-sentence transcript view (self-authored — official CSS has no equivalent).
 * Each row = time (mono) + speaker label/marker + text. The currently-playing
 * sentence is highlighted with a flat grey fill (--fill-active), never blue.
 */
export function TranscriptView({ segments, currentSec, onSeek, followPlayback }: Props) {
  const markers = useSpeakerMarkers(segments);
  const listRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = useMemo(() => {
    if (currentSec == null) return -1;
    // Last segment whose start is <= playhead and that contains it (or the next
    // hasn't started yet). Linear scan is fine for transcript-sized lists.
    let idx = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start_sec <= currentSec + 0.001) idx = i;
      else break;
    }
    if (idx >= 0 && segments[idx].end_sec != null && currentSec > segments[idx].end_sec + 0.5) {
      // Playhead is in a gap after this segment but before the next — keep the
      // last spoken sentence highlighted rather than nothing.
    }
    return idx;
  }, [segments, currentSec]);

  useEffect(() => {
    if (!followPlayback || currentIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[currentIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentIndex, followPlayback]);

  if (segments.length === 0) {
    return (
      <p className="text-caption" style={{ color: "var(--ink-2)", padding: "var(--s4)" }}>
        还没有转写。
      </p>
    );
  }

  return (
    <div className="transcript" ref={listRef}>
      {segments.map((seg, i) => {
        const speaker = seg.speaker_name || `Speaker ${seg.speaker}`;
        const marker = markers.get(seg.speaker) ?? 0;
        const isCurrent = i === currentIndex;
        const seekable = !!onSeek;
        return (
          <div
            key={seg.id}
            className={cn("transcript__row", isCurrent && "is-current")}
            role={seekable ? "button" : undefined}
            tabIndex={seekable ? 0 : undefined}
            aria-current={isCurrent ? "true" : undefined}
            onClick={seekable ? () => onSeek!(seg.start_sec) : undefined}
            onKeyDown={
              seekable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSeek!(seg.start_sec);
                    }
                  }
                : undefined
            }
          >
            <span className="transcript__time">{seg.start_label}</span>
            <span className="transcript__speaker">
              <span
                className={cn("speaker-marker", `speaker-marker--s${marker}`)}
                aria-hidden
              />
              {speaker}
              {isCurrent && (
                <span aria-label="正在播放">
                  <Icon name="volume-2" size={12} />
                </span>
              )}
            </span>
            <span className="transcript__text" style={{ gridColumn: 2 }}>
              {seg.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
