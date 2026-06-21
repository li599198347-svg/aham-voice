import { cn } from "@/utils/cn";

// 统一空状态:全站只用官方 .page-state 结构(__icon/__title/__desc/__actions),
// 与列表/声纹/任务页一致。组件内可不带图标(卡片内联场景),但字号/间距/颜色
// 与页面级空态同源,避免 .empty-state 与 .page-state 两套并行(审计 #42)。
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-state", className)}>
      {title && <div className="page-state__title">{title}</div>}
      <p className="page-state__desc">{description}</p>
      {action && <div className="page-state__actions">{action}</div>}
    </div>
  );
}
