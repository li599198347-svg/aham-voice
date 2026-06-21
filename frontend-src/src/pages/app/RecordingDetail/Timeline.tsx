import { useMemo } from "react";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";
import type { Recording, RecordingTask, Summary, TranscriptSegment, EmotionAnalysis } from "@/api/types";
import { EMOTION_KEY } from "./Preview";

type Tone = "moss" | "accent" | "rust" | "amber" | "muted";

// Timeline dot semantics use the AA-aligned --ok/--warn/--risk naming; the
// event model still speaks the legacy tone vocabulary, so map at render time.
const TONE_CLASS: Record<Tone, string> = {
  moss: "ok",
  rust: "risk",
  amber: "warn",
  accent: "accent",
  muted: "muted",
};

interface ArtifactRef {
  type: string;      // "MD"
  filename: string;  // e.g. "summary-v1.md", "transcript.md"
  meta: string;      // e.g. "v1 · deepseek-v4-pro" / "168 段 · 2 位说话人"
}

interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
  tone: Tone;
  /** When set, renders as a clickable .attachment doc card instead of
   *  plain text. The card lets the user "open" the artifact in the rail. */
  artifact?: ArtifactRef;
  /** Inline progress bar for tasks that are currently running. */
  task?: {
    progress: number;
    elapsedLabel: string;
    isStale: boolean;
    state: "running" | "done" | "failed";
  };
  onClick?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
}

interface Props {
  recording: Recording;
  tasks: RecordingTask[];
  summaries: Summary[];
  segments: TranscriptSegment[];
  emotion: EmotionAnalysis | null;
  onPreviewSummary: (summaryId: string) => void;
  onPreviewTranscript: () => void;
  onPreviewEmotion: () => void;
  onGenerateEmotion: () => void;
  emotionPending: boolean;
}

function taskTone(status: RecordingTask["status"]): Tone {
  switch (status) {
    case "done":
      return "moss";
    case "running":
      return "accent";
    case "queued":
      return "amber";
    case "failed":
      return "rust";
    default:
      return "muted";
  }
}

function isTranscribeStep(step: string): boolean {
  return /VAD|转写/.test(step);
}

function buildEvents(props: Props): TimelineEvent[] {
  const { recording: rec, tasks, summaries, segments, emotion, onPreviewSummary, onPreviewTranscript, onPreviewEmotion, onGenerateEmotion, emotionPending } = props;
  const events: TimelineEvent[] = [];

  events.push({
    id: `created:${rec.id}`,
    at: rec.created_at,
    title: "已新增录音",
    detail: `原始文件 ${rec.filename} · 已保存到本机`,
    tone: "moss",
  });

  events.push({
    id: `analysis:${rec.id}`,
    at: rec.created_at,
    title: "音频分析",
    detail: `读取音频时长 ${rec.duration_label}，准备本地模型处理`,
    tone: "moss",
  });

  for (const t of tasks) {
    events.push({
      id: `task:${t.id}`,
      at: t.started_at || t.created_at,
      title: t.step,
      detail:
        t.status === "failed"
          ? t.error || "失败"
          : t.status === "done"
            ? `耗时 ${t.elapsed_label}`
            : `进度 ${t.progress}% · 已耗时 ${t.elapsed_label}${t.eta_label ? ` · 预计 ${t.eta_label}` : ""}`,
      tone: taskTone(t.status),
      task:
        t.status === "running" || t.status === "queued"
          ? {
              progress: t.progress,
              elapsedLabel: t.elapsed_label,
              isStale: t.is_stale,
              state: "running",
            }
          : t.status === "failed"
            ? { progress: t.progress, elapsedLabel: t.elapsed_label, isStale: false, state: "failed" }
            : { progress: 100, elapsedLabel: t.elapsed_label, isStale: false, state: "done" },
    });
  }

  // Synthetic "transcript ready" doc card right after the transcribe task
  // finishes — so the user can preview the逐字稿 from the timeline. Only one
  // such card per recording even if transcribe was retried multiple times.
  const lastDoneTranscribe = [...tasks]
    .filter((t) => isTranscribeStep(t.step) && t.status === "done")
    .sort((a, b) => (a.finished_at || a.updated_at).localeCompare(b.finished_at || b.updated_at))
    .at(-1);
  if (lastDoneTranscribe && segments.length > 0) {
    const uniqueSpeakers = new Set(segments.map((s) => s.speaker)).size;
    events.push({
      id: `transcript:ready`,
      at: lastDoneTranscribe.finished_at || lastDoneTranscribe.updated_at,
      title: "逐字稿就绪",
      tone: "moss",
      artifact: {
        type: "MD",
        filename: "逐字稿",
        meta: `${segments.length} 段发言 · ${uniqueSpeakers} 位说话人`,
      },
      onClick: onPreviewTranscript,
    });
  }

  for (const s of summaries) {
    const headline = s.instruction ? `按要求修改纪要 v${s.version}` : `生成纪要 v${s.version}`;
    events.push({
      id: `summary:${s.id}`,
      at: s.created_at,
      title: headline,
      detail: s.instruction
        ? `「${s.instruction.length > 50 ? s.instruction.slice(0, 50) + "…" : s.instruction}」`
        : undefined,
      tone: "moss",
      artifact: {
        type: "MD",
        filename: `会议纪要 v${s.version}`,
        meta: `${s.model}${s.is_current ? " · 当前版本" : ""}`,
      },
      onClick: () => onPreviewSummary(s.id),
    });
  }

  // 对话情绪分析：已生成 → 文档卡；未生成且转写完成 → 按需生成入口。
  if (emotion) {
    events.push({
      id: `emotion:${emotion.id}`,
      at: emotion.created_at,
      title: "对话情绪分析",
      tone: "moss",
      artifact: {
        type: "MD",
        filename: "对话情绪分析",
        meta: emotion.model,
      },
      onClick: onPreviewEmotion,
    });
  } else if (rec.asr_status === "done") {
    events.push({
      id: "emotion:gen",
      at: rec.updated_at,
      title: "对话情绪分析",
      detail: emotionPending
        ? "正在分析说话情绪、客户意向与异议…"
        : "识别说话情绪、客户意向与异议（独立于纪要，可单独下载）",
      tone: emotionPending ? "accent" : "muted",
      onClick: onGenerateEmotion,
      actionLabel: emotionPending ? "分析中…" : "生成对话情绪分析",
      actionDisabled: emotionPending,
    });
  }

  // Stable timestamp sort with a type-priority tiebreaker so events sharing
  // the same second still render in the canonical pipeline order.
  const TYPE_ORDER: Record<string, number> = {
    created: 0,
    analysis: 1,
    task: 2,
    transcript: 3,
    summary: 4,
    emotion: 5,
  };
  events.sort((a, b) => {
    const t = a.at.localeCompare(b.at);
    if (t !== 0) return t;
    const ta = TYPE_ORDER[a.id.split(":")[0]] ?? 99;
    const tb = TYPE_ORDER[b.id.split(":")[0]] ?? 99;
    return ta - tb;
  });
  return events;
}

function overallProgress(rec: Recording, tasks: RecordingTask[]): number {
  const asrDone = rec.asr_status === "done";
  const sumDone = rec.summary_status === "done";
  if (asrDone && sumDone) return 100;
  const runningProgress = (re: RegExp): number => {
    const t = [...tasks].reverse().find((x) => re.test(x.step) && (x.status === "running" || x.status === "queued"));
    return t ? Math.max(0, Math.min(100, t.progress)) : 0;
  };
  // 转写占整体 70%、纪要占 30%；瞬时的「新增录音/音频分析」不计入，开局接近 0。
  let asrPct = 0;
  if (asrDone) asrPct = 100;
  else if (rec.asr_status === "running") asrPct = runningProgress(/VAD|转写/) || 5;
  else if (rec.asr_status === "queued") asrPct = 2;
  else if (rec.asr_status === "failed") asrPct = runningProgress(/VAD|转写/);
  let sumPct = 0;
  if (sumDone) sumPct = 100;
  else if (rec.summary_status === "running") sumPct = runningProgress(/纪要/) || 5;
  return Math.max(0, Math.min(99, Math.round(asrPct * 0.7 + sumPct * 0.3)));
}

interface TimelineProps extends Props {
  /** Key of the artifact currently visible in the rail; we highlight the
   *  matching doc card on the timeline. */
  activePreviewKey: string | null;
}

export function Timeline(props: TimelineProps) {
  const events = useMemo(() => buildEvents(props), [props]);
  const donePct = overallProgress(props.recording, props.tasks);
  const stagesDone =
    (props.recording.asr_status === "done" ? 1 : 0) + (props.recording.summary_status === "done" ? 1 : 0);
  const currentEvent = events.find((e) => e.tone === "accent" || e.tone === "amber" || e.tone === "rust");
  const currentLabel = donePct >= 100 ? "已完成" : currentEvent ? currentEvent.title : "处理中";

  return (
    <section className="card stack-card">
      <header className="card__head" style={{ marginBottom: 0 }}>
        <span className="ttl" style={{ fontSize: "var(--text-base)" }}>录音处理时间线</span>
        <span className="kind text-mono">{stagesDone}/2 阶段 · {donePct}%</span>
      </header>

      <div className="field">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="text-caption">整体进度</span>
          <span className="text-caption text-mono">{donePct}%</span>
        </div>
        <div className="progress">
          <span className="progress__bar" style={{ width: `${donePct}%` }} />
        </div>
      </div>

      <p className="text-caption" style={{ margin: 0 }}>
        当前：{currentLabel}
      </p>

      <ol className="timeline" style={{ listStyle: "none", margin: 0 }}>
        {events.map((event) => {
          const isActive = !!event.artifact && !!props.activePreviewKey && (
            (event.id.startsWith("summary:") && event.id === `summary:${props.activePreviewKey.split(":")[1]}`) ||
            (event.id === "transcript:ready" && props.activePreviewKey === "transcript") ||
            (event.id.startsWith("emotion:") && props.activePreviewKey === EMOTION_KEY)
          );
          return (
            <li
              key={event.id}
              className={cn("tl-item", `tl-item--${TONE_CLASS[event.tone]}`)}
            >
              <p className="tl-title">{event.title}</p>
              <p className="tl-time">{formatRelative(event.at)}</p>
              {event.detail && <p className="tl-detail">{event.detail}</p>}
              {event.task && event.task.state === "running" && (
                <div
                  className={cn("progress", event.task.isStale && "is-indeterminate")}
                  style={{ marginTop: "var(--s2)" }}
                >
                  <span className="progress__bar" style={{ width: `${event.task.progress}%` }} />
                </div>
              )}
              {event.artifact && (
                <button
                  type="button"
                  className={cn("attachment", "attachment--button", isActive && "is-active")}
                  onClick={event.onClick}
                  style={{ marginTop: "var(--s2)" }}
                >
                  <span className="attachment__type">{event.artifact.type}</span>
                  <span className="attachment__body">
                    <span className="attachment__name">{event.artifact.filename}</span>
                    <span className="attachment__meta">
                      <span>{event.artifact.meta}</span>
                    </span>
                  </span>
                  <span className="attachment__actions">
                    <span>{isActive ? "正在预览" : "预览 →"}</span>
                  </span>
                </button>
              )}
              {!event.artifact && event.onClick && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={event.actionDisabled}
                  onClick={event.actionDisabled ? undefined : event.onClick}
                  style={{ marginTop: "var(--s2)" }}
                >
                  {event.actionLabel ?? "打开 →"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
