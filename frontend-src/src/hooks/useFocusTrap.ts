import { useCallback, useEffect, useRef } from "react";

/**
 * Focus-trap hook for dialogs / modals.
 *
 * When `active` flips to true it:
 *   1. records the currently-focused element (the trigger),
 *   2. moves focus to the first interactive element inside the container
 *      (or the container itself if none),
 *   3. keeps Tab / Shift+Tab cycling within the container (first ↔ last),
 *   4. restores focus to the recorded trigger when `active` flips to false
 *      or the component unmounts.
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(open);
 *   return <div ref={ref} role="dialog" aria-modal="true">…</div>;
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active: boolean) {
  const containerRef = useRef<T | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // The set of focusable descendants, in DOM order, that are currently visible.
  const getFocusable = useCallback((): HTMLElement[] => {
    const root = containerRef.current;
    if (!root) return [];
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-hidden") !== "true" &&
        // offsetParent is null for display:none; allow position:fixed which has
        // a null offsetParent too by also accepting non-zero client rects.
        (el.offsetParent !== null || el.getClientRects().length > 0),
    );
  }, []);

  useEffect(() => {
    if (!active) return;

    const root = containerRef.current;
    previousActiveRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus inside on open (skip if something inside already has focus,
    // e.g. an autoFocus input).
    if (root && !root.contains(document.activeElement)) {
      const focusable = getFocusable();
      (focusable[0] ?? root).focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        // Nothing to tab to — keep focus on the container.
        e.preventDefault();
        root?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (activeEl === first || !root?.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !root?.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Restore focus to the trigger that opened the trap.
      const prev = previousActiveRef.current;
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [active, getFocusable]);

  return containerRef;
}
