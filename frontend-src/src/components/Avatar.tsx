import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

// Round, neutral, one uniform treatment. Uses the official `.avatar` class
// (Aham UI v6.1 §9): --panel background, --ink-2 initial, pill radius, no brand
// color — every avatar in a list looks the same; identity meaning is carried by
// the status column, not the avatar. Size scale via modifiers: 20/24/32/40/56.
const SIZE_CLASS: Record<AvatarSize, string | undefined> = {
  xs: "avatar--xs",
  sm: "avatar--sm",
  md: undefined, // default 32px
  lg: "avatar--lg",
  xl: "avatar--xl",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <span className={cn("avatar", SIZE_CLASS[size], className)} aria-hidden>
      {initials(name)}
    </span>
  );
}
