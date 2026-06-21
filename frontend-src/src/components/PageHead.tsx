import { cn } from "@/utils/cn";

// Official Aham v6.0 .page-header — the first of the three page-shell layers
// (header / toolbar / content). Breadcrumb lives in the AppShell top navbar
// (.crumb), NOT here, so it is never duplicated. The actions slot is ALWAYS
// rendered (even empty) so titles align across pages; the page-level primary
// action is the single trailing item. The subtitle, if present, must be a fact
// about this page's data, not a description of the feature.
export function PageHead({
  title,
  subtitle,
  actions,
  readonly,
  readonlyReason,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  readonly?: boolean;
  readonlyReason?: string;
  className?: string;
}) {
  return (
    <header
      className={cn("page-header", "page-header--divider", className)}
      data-readonly={readonly ? "" : undefined}
    >
      <div className="page-header__main">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__sub">{subtitle}</p>}
      </div>
      <div className="page-header__actions">
        {readonly ? (
          <span className="status status--muted">
            只读 · {readonlyReason ?? "外部维护"}
          </span>
        ) : (
          actions
        )}
      </div>
    </header>
  );
}
