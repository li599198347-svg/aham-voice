import { cn } from "@/utils/cn";

// .status — 6px dot + label, the system's one shape for a state.
// Tones map to the canonical status vocabulary documented in the README.
export type StatusTone =
  | "neutral"
  | "accent"
  | "moss"
  | "amber"
  | "rust"
  | "slate"
  | "muted"
  | "faint";

export function Status({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "status",
        // tone → official status vocabulary
        tone === "accent" && "status--active",
        tone === "slate" && "status--active",
        tone === "moss" && "status--ok",
        tone === "amber" && "status--warn",
        tone === "rust" && "status--risk",
        tone === "muted" && "status--muted",
        tone === "faint" && "status--muted",
        // neutral → no modifier (default --ink-3 dot)
        className,
      )}
    >
      {children}
    </span>
  );
}
