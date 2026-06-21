// Shared processing-status labels. Previously each page wrote its own copy of
// these strings (RecordingsList.statusLabel / RecordingDetail.overallLabel),
// which let the wording drift apart across pages and confuse users (#56).
// Centralise the canonical Chinese labels here so every page reads the same
// words. Tone (color) stays page-local because the two pages legitimately use
// different palettes; only the user-facing text is shared.

import type { RecordingProcessingStatus } from "@/api/types";

// Single processing stage (ASR or summary) → label.
export function statusLabel(status: RecordingProcessingStatus): string {
  switch (status) {
    case "done":
      return "已完成";
    case "running":
      return "进行中";
    case "queued":
      return "排队中";
    case "failed":
      return "失败";
    case "pending":
    default:
      return "未开始";
  }
}

// Combined ASR + summary state → the overall recording label. Must agree with
// statusLabel's wording for the shared states (#56).
export function overallLabel(asr: string, summary: string): string {
  if (asr === "failed" || summary === "failed") return "失败";
  if (asr === "running" || summary === "running") return "进行中";
  if (asr === "queued") return "排队中";
  if (asr === "done" && summary === "done") return "已完成";
  if (asr === "done") return "等待纪要";
  return "未开始";
}
