import { cn } from "@/utils/cn";
import { Icon } from "@/components/Icon";

// Tone → leading icon + matching token colour. Gives every diagnostic a triple
// cue (icon + colour + text) so it doesn't rely on colour alone (#36).
const TONE_ICON: Record<"danger" | "warning" | "info", { name: string; color: string; label: string }> = {
  danger: { name: "triangle-alert", color: "var(--danger)", label: "错误" },
  warning: { name: "triangle-alert", color: "var(--warning)", label: "警告" },
  info: { name: "info", color: "var(--accent)", label: "提示" },
};

// Inline diagnostic row mapped onto the official `.alert` (left 1.5px rule +
// tinted bg). Tone maps danger→risk · warning→warn · info→info.
//
// 文案规则（§1.9）:`children` 是「人话」标题/说明(发生了什么 + 怎么办);
// 技术性的内部 `code` 与原始 `detail`(后端 message)收进折叠的「诊断详情」,
// 只给需要排查的技术用户,不平铺给普通用户。`actions` 放重试等可操作按钮。
//
// 可访问性:danger → role="alert"(立即播报);info/warning → aria-live="polite"。
export function Diag({
  code,
  tone = "danger",
  children,
  detail,
  actions,
  className,
}: {
  code?: string;
  tone?: "danger" | "warning" | "info";
  children: React.ReactNode;
  detail?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const cue = TONE_ICON[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        "alert",
        tone === "danger" && "alert--risk",
        tone === "warning" && "alert--warn",
        tone === "info" && "alert--info",
        className,
      )}
    >
      <span className="alert__icon" aria-hidden style={{ color: cue.color }}>
        <Icon name={cue.name} size={16} aria-label={cue.label} />
      </span>
      <span className="alert__body">
        {children}
        {(code || detail) && (
          <details className="diag-detail">
            <summary>诊断详情</summary>
            <div className="diag-detail__body">
              {code && <span className="at">{code}</span>}
              {detail && <span className="diag-detail__msg">{detail}</span>}
            </div>
          </details>
        )}
      </span>
      {actions && <span className="alert__actions">{actions}</span>}
    </div>
  );
}
