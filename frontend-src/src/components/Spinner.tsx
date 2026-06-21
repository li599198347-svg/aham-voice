// The official `.spinner` (--line ring + --ink-3 head). A small spinner inline
// with text or in a button is fine for "this small piece is working". The size
// prop overrides the default 18px geometry while keeping the official styling.
export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-live="polite"
      style={{ width: size, height: size, display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
