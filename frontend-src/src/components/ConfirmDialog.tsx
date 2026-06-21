import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmText: string;
  /** "danger" renders the confirm button with .btn--danger (no blue default). */
  tone?: "danger";
  /** Optional override for the cancel label (defaults to 取消). */
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared confirmation dialog built on the official .dialog primitives
 * (.dlg-title / .dlg-body / .dlg-foot).
 *
 * Button order follows §8.6 / macOS: 取消 (.btn) comes first in the DOM, the
 * confirm action last. With .dlg-foot's justify-content:flex-end the trailing
 * confirm renders on the right; on narrow screens the official
 * @media stacks them column-reverse (confirm on top). A destructive confirm
 * uses .btn--danger and is never the blue default.
 *
 * Esc and scrim-click both cancel. Focus is trapped while open and returned to
 * the trigger on close.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmText,
  tone,
  cancelText = "取消",
  onConfirm,
  onCancel,
}: Props) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  const titleId = useId();
  const bodyId = useId();

  // Esc closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="scrim" onClick={onCancel} aria-hidden />
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
          className="dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          tabIndex={-1}
          style={{ width: "min(380px, 100%)", pointerEvents: "auto" }}
        >
          <div className="dlg-title" id={titleId}>
            {title}
          </div>
          <div className="dlg-body" id={bodyId}>
            {body}
          </div>
          <div className="dlg-foot">
            <button type="button" className="btn" onClick={onCancel}>
              {cancelText}
            </button>
            <button
              type="button"
              className={tone === "danger" ? "btn btn--danger" : "btn btn--primary"}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
