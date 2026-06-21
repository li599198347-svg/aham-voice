import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadRecording } from "@/api/endpoints";
import { PageHead } from "@/components/PageHead";
import { Field, FormRow } from "@/components/Field";
import { Button } from "@/components/Button";
import { Diag } from "@/components/Diag";
import { readApiError } from "@/api/client";
import { formatBytes } from "@/utils/format";
import { cn } from "@/utils/cn";

const MEETING_TYPES = ["内部会议", "客户调研", "方案汇报", "销售电话"];
const ACCEPTED = ".m4a,.mp3,.wav,.aac,.flac,.amr,.opus,.mp4,.wma";

export function RecordingNew() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [autoProcess, setAutoProcess] = useState(true);
  const [expectedSpeakers, setExpectedSpeakers] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Field-level validation messages, rendered under their own controls so the
  // user is pointed at the exact field to fix rather than a page-level banner.
  const [fileError, setFileError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: uploadRecording,
    onSuccess: (rec) => {
      qc.invalidateQueries({ queryKey: ["recordings"] });
      navigate(`/app/recordings/${rec.id}`, { replace: true });
    },
    onError: (err) => {
      setError(readApiError(err));
      setUploadPct(null);
    },
  });

  function onFile(f: File | null) {
    setFile(f);
    if (f) setFileError(null);
    if (f && !title.trim()) {
      const stem = f.name.replace(/\.[^.]+$/, "");
      setTitle(stem);
      setTitleError(null);
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  }

  function onPickInput(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    onFile(picked);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFileError(null);
    setTitleError(null);
    let invalid = false;
    if (!file) {
      setFileError("先选择一个音频文件。");
      invalid = true;
    }
    if (!title.trim()) {
      setTitleError("给录音起一个标题。");
      invalid = true;
    }
    if (invalid || !file) return;
    setUploadPct(0);
    mutation.mutate({
      file,
      title: title.trim(),
      meeting_type: meetingType,
      auto_process: autoProcess,
      expected_speakers: expectedSpeakers ? Number(expectedSpeakers) : null,
      onProgress: (p) => setUploadPct(p),
    });
  }

  return (
    <div className="container container--content">
      <div className="page-shell">
        <PageHead
          title="上传录音"
          subtitle="文件大小最多 2GB。上传完成后默认自动转写并生成纪要。"
        />

        <div className="page-content">
          <form onSubmit={handleSubmit} className="form-section">
        <label
          className={cn("upload", dragOver && "dragover")}
          style={{ position: "relative", display: "block" }}
          role="button"
          tabIndex={0}
          aria-label="选择或拖拽音频文件上传"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={onPickInput}
            className="sr-only"
            tabIndex={-1}
          />
          {file ? (
            <>
              <p className="up-t">{file.name}</p>
              <p className="up-h">{formatBytes(file.size)} · 点击替换或拖拽新的文件</p>
            </>
          ) : (
            <>
              <p className="up-t">拖拽音频到这里 · 或点击选择</p>
              <p className="up-h">
                支持 <span className="text-mono">.m4a .mp3 .wav .aac .flac .amr .opus .mp4 .wma</span>
              </p>
            </>
          )}
        </label>
        {fileError && (
          <div className="field">
            <p className="err">{fileError}</p>
          </div>
        )}

        <FormRow label="标题" required htmlFor="rec-title" error={titleError ?? undefined}>
          <Field
            id="rec-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError(null);
            }}
            maxLength={120}
            required
            invalid={!!titleError}
          />
        </FormRow>

        <FormRow label="会议类型" htmlFor="rec-type">
          <select
            id="rec-type"
            className="select"
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
          >
            {MEETING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label="预计说话人数" optional htmlFor="rec-spk" hint="填了能让说话人分离更准、避免一个人被拆成好几个。不确定就留空（自动判断）。">
          <input
            id="rec-spk"
            className="input"
            type="number"
            min={2}
            max={50}
            value={expectedSpeakers}
            onChange={(e) => setExpectedSpeakers(e.target.value)}
            placeholder="如：7"
            style={{ maxWidth: 160 }}
          />
        </FormRow>

        <FormRow label="自动处理" hint="上传后自动转写并调用 DeepSeek 生成纪要。关闭后可手动触发。">
          <label className="ctl-row">
            <input
              type="checkbox"
              className="check"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
            />
            <span>上传后立即开始转写</span>
          </label>
        </FormRow>

        {error && <Diag code="REC_E_UPLOAD">{error}</Diag>}

        {mutation.isPending && uploadPct !== null && (
          <div className="field">
            <div className="progress-field__row">
              <span>{uploadPct < 100 ? "正在上传…" : "上传完成，正在准备处理…"}</span>
              <span className="text-mono t-2">{uploadPct}%</span>
            </div>
            <div className="progress">
              <span className="progress__bar" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}

        <div className="form-foot">
          <Button variant="ghost" onClick={() => navigate("/app/recordings")} type="button" disabled={mutation.isPending}>
            取消
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
              {mutation.isPending
                ? uploadPct !== null && uploadPct < 100
                  ? `上传中 ${uploadPct}%`
                  : "处理中…"
                : "上传并开始"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
