import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  exportEmotionUrl,
  exportSummaryVersionUrl,
  exportTranscriptUrl,
  recordingAudioUrl,
} from "@/api/endpoints";
import { Icon } from "@/components/Icon";
import { AudioPlayer } from "@/components/voice/AudioPlayer";
import { TranscriptView } from "@/components/voice/TranscriptView";
import type { EmotionAnalysis, Summary, TranscriptSegment } from "@/api/types";

export type ArtifactKey = string;
// "summary:<id>" | "transcript"
export function summaryArtifactKey(summary: Summary): ArtifactKey {
  return `summary:${summary.id}`;
}
export const TRANSCRIPT_KEY: ArtifactKey = "transcript";
export const EMOTION_KEY: ArtifactKey = "emotion";

interface Props {
  recordingId: string;
  summaries: Summary[];
  segments: TranscriptSegment[];
  emotion: EmotionAnalysis | null;
  /** Which artifact is being previewed. Caller hides the rail entirely when
   *  null (via .is-closed), so this component always renders something. */
  selected: ArtifactKey;
  onSelect: (key: ArtifactKey) => void;
  onClose: () => void;
}

// Build the transcript markdown from segments on the client — saves a fetch
// and keeps the rail responsive while the user is reading.
function transcriptMarkdown(segments: TranscriptSegment[]): string {
  if (segments.length === 0) return "_还没有转写。_";
  const lines: string[] = ["# 逐字稿", ""];
  for (const seg of segments) {
    const speaker = seg.speaker_name || `Speaker ${seg.speaker}`;
    lines.push(`### \`${seg.start_label}\` · ${speaker}`);
    lines.push("");
    lines.push(seg.text);
    lines.push("");
  }
  return lines.join("\n");
}

export function Preview({ recordingId, summaries, segments, emotion, selected, onSelect, onClose }: Props) {
  // Playhead + seek coordination for the per-sentence transcript view.
  const [currentSec, setCurrentSec] = useState(0);
  const [seekReq, setSeekReq] = useState<{ sec: number; nonce: number } | null>(null);
  const seekNonce = useRef(0);
  const currentSummary = useMemo(() => {
    if (!selected.startsWith("summary:")) return null;
    const id = selected.slice("summary:".length);
    return summaries.find((s) => s.id === id) ?? null;
  }, [selected, summaries]);
  const isTranscript = selected === TRANSCRIPT_KEY;
  const isEmotion = selected === EMOTION_KEY;

  const markdown = useMemo(() => {
    if (currentSummary) return currentSummary.content;
    if (isTranscript) return transcriptMarkdown(segments);
    if (isEmotion) return emotion?.content ?? "_还没有情绪分析。_";
    return "";
  }, [currentSummary, isTranscript, isEmotion, emotion, segments]);

  const displayName = currentSummary
    ? `会议纪要 v${currentSummary.version}`
    : isTranscript
      ? "逐字稿"
      : isEmotion
        ? "对话情绪分析"
        : "";

  const downloadHref = currentSummary
    ? exportSummaryVersionUrl(recordingId, currentSummary.id)
    : isTranscript
      ? exportTranscriptUrl(recordingId)
      : isEmotion
        ? exportEmotionUrl(recordingId)
        : null;

  const metaText = currentSummary
    ? `${currentSummary.model}${currentSummary.is_current ? " · 当前版本" : ""}`
    : isTranscript
      ? `${segments.length} 段发言`
      : isEmotion
        ? emotion?.model ?? ""
        : "";

  async function handleDownload() {
    if (!downloadHref) return;
    const filename = `${displayName || "导出"}.md`.replace(/[\\/:*?"<>|]/g, "_");
    const api = (window as unknown as {
      pywebview?: { api?: { save_file?: (u: string, f: string) => Promise<boolean> } };
    }).pywebview?.api;
    // Desktop (pywebview/WKWebView) has no <a download>; route through the native
    // Save dialog. In a real browser (dev) fall back to a download link.
    if (api?.save_file) {
      await api.save_file(downloadHref, filename);
      return;
    }
    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="window window--flush">
      <header className="window__bar">
        <span className="ftype">MD</span>
        <span className="window__title">{displayName}</span>
        <span className="text-caption">{metaText}</span>
        <div className="window__actions">
          {summaries.length + (segments.length > 0 ? 1 : 0) + (emotion ? 1 : 0) > 1 && (
            <select
              className="select select--sm"
              value={selected}
              onChange={(e) => onSelect(e.target.value)}
              aria-label="切换产物"
            >
              {summaries.map((s) => (
                <option key={s.id} value={summaryArtifactKey(s)}>
                  会议纪要 v{s.version}
                  {s.is_current ? " · 当前" : ""}
                </option>
              ))}
              {emotion && <option value={EMOTION_KEY}>对话情绪分析</option>}
              {segments.length > 0 && (
                <option value={TRANSCRIPT_KEY}>逐字稿</option>
              )}
            </select>
          )}
          {downloadHref && (
            <button type="button" onClick={handleDownload} className="icon-btn" aria-label="下载">
              <Icon name="download" size={14} />
            </button>
          )}
          <button type="button" className="icon-btn" aria-label="关闭预览" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>
      </header>

      {isTranscript ? (
        <>
          <div
            style={{
              padding: "var(--s3) var(--s4)",
              borderBottom: "1px solid var(--line)",
              flex: "none",
            }}
          >
            <AudioPlayer
              src={recordingAudioUrl(recordingId)}
              seed={recordingId}
              ariaLabel="录音"
              onTime={setCurrentSec}
              seekRequest={seekReq}
            />
          </div>
          <div className="window__body fill" style={{ padding: "var(--s2) var(--s3)" }}>
            <TranscriptView
              segments={segments}
              currentSec={currentSec}
              followPlayback
              onSeek={(sec) => {
                seekNonce.current += 1;
                setSeekReq({ sec, nonce: seekNonce.current });
              }}
            />
          </div>
        </>
      ) : (
        <div className="window__body fill">
          <article className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
