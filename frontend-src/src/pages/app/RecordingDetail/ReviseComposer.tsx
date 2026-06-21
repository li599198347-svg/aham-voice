import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviseSummary } from "@/api/endpoints";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Field";
import { Diag } from "@/components/Diag";
import { readApiError } from "@/api/client";

interface Props {
  recordingId: string;
  disabled: boolean;
  disabledReason?: string;
}

// The always-visible revise composer at the bottom of the rail. Built from the
// official .composer (bordered white container: textarea + bottom send bar) with
// the official .textarea control. Enter sends (Shift+Enter for newline), guarded
// against IME composition.
export function ReviseComposer({ recordingId, disabled, disabledReason }: Props) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const revise = useMutation({
    mutationFn: () => reviseSummary(recordingId, text.trim()),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["recording", recordingId] });
    },
    onError: (err) => setError(readApiError(err)),
  });

  function submit(event: FormEvent | KeyboardEvent) {
    event.preventDefault();
    if (!text.trim() || disabled) return;
    setError(null);
    revise.mutate();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit(event);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <span className="label">修改纪要</span>
        {error && <Diag code="SUM_E_REVISE">{error}</Diag>}
        <div className="composer">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              disabled
                ? disabledReason ?? "等纪要生成完后可以在这里告诉 AI 怎么改"
                : "补一段商机分析、按客户重写第二节、删掉所有时间戳……"
            }
            rows={3}
            disabled={disabled || revise.isPending}
          />
          <div className="composer__bar">
            <Button
              type="submit"
              className="composer__send"
              variant="primary"
              size="sm"
              loading={revise.isPending}
              disabled={disabled || !text.trim()}
            >
              提交修改
            </Button>
          </div>
        </div>
        <span className="hint">每次修改会创建新版本，原版仍可翻到（Enter 提交 · Shift+Enter 换行）</span>
      </div>
    </form>
  );
}
