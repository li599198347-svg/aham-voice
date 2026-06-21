import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export interface SpeakerNameValue {
  name: string;
  note: string;
}

interface Props {
  open: boolean;
  title?: string;
  /** Pre-fill (e.g. existing speaker name / note). */
  initialName?: string;
  initialNote?: string;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (value: SpeakerNameValue) => void;
}

// Small naming dialog: 姓名 + 备注. Uses the official .modal (__head/__body/__foot)
// primitives, centered over a .scrim. ESC and scrim-click close. Saving is
// disabled until a non-empty name is present.
export function SpeakerNameModal({
  open,
  title = "命名说话人",
  initialName = "",
  initialNote = "",
  saving = false,
  error,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState(initialNote);
  // When closing with unsaved edits, route through a discard confirmation
  // instead of dropping the changes silently (§8.6).
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // The discard confirmation owns its own focus trap while open, so suspend this
  // modal's trap to avoid two capture-phase Tab handlers fighting.
  const trapRef = useFocusTrap<HTMLDivElement>(open && !confirmDiscard);
  const titleId = useId();
  const errorId = useId();

  // Reset the form whenever the dialog (re)opens with new initial values.
  useEffect(() => {
    if (open) {
      setName(initialName);
      setNote(initialNote);
      setConfirmDiscard(false);
    }
  }, [open, initialName, initialNote]);

  const dirty = name !== initialName || note !== initialNote;

  // Centralised close gate: blocked while saving; prompts when there are unsaved
  // edits. Scrim, Esc and the × button all funnel through here so the门槛 lives
  // in one place rather than each caller (#37).
  function requestClose() {
    if (saving) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      // While the discard confirmation is up it owns Esc (cancels back to
      // editing); don't double-handle here.
      if (confirmDiscard) return;
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // requestClose closes over saving/dirty; re-bind when those change.
  }, [open, saving, dirty, confirmDiscard]);

  if (!open) return null;

  const trimmed = name.trim();

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!trimmed || saving) return;
    onSave({ name: trimmed, note: note.trim() });
  }

  return createPortal(
    <>
      <div className="scrim" onClick={requestClose} aria-hidden />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: "var(--z-modal)" as unknown as number,
          display: "grid",
          placeItems: "center",
          padding: "var(--s4)",
          pointerEvents: "none",
        }}
      >
        <div
          ref={trapRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          style={{ width: "min(440px, 100%)", pointerEvents: "auto" }}
        >
          <header className="modal__head modal__head--split">
            <h3 className="modal__title" id={titleId} style={{ margin: 0 }}>{title}</h3>
            <button type="button" className="icon-btn" aria-label="关闭" onClick={requestClose}>
              <Icon name="x" size={16} />
            </button>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="modal__body modal__body--stack">
              {error && (
                <div className="field" id={errorId} role="alert">
                  <p className="err">{error}</p>
                </div>
              )}
              <label className="field">
                <span className="label">姓名</span>
                <input
                  className="input"
                  value={name}
                  autoFocus
                  placeholder="如：张三"
                  aria-describedby={error ? errorId : undefined}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="label">备注（可选）</span>
                <textarea
                  className="textarea"
                  value={note}
                  placeholder="如：销售部 / 客户方负责人"
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter saves (matches the name input / Aham's Enter
                    // convention); Shift+Enter keeps the newline for多行备注.
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      handleSubmit(e);
                    }
                  }}
                />
              </label>
            </div>

            <footer className="modal__foot">
              <button type="button" className="btn" onClick={requestClose} disabled={saving}>取消</button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!trimmed || saving}
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </footer>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        tone="danger"
        title="放弃未保存的更改"
        body="关闭后当前的姓名 / 备注修改将丢失。确定放弃？"
        confirmText="放弃"
        cancelText="继续编辑"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </>,
    document.body,
  );
}
