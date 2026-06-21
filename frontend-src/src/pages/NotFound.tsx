import { Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

export function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
      }}
    >
      <div className="container container--content">
        <div className="page-shell">
          <div className="page-state">
            <Icon name="compass" size={48} className="page-state__icon" />
            <div className="page-state__title">找不到这一页</div>
            <p className="page-state__desc">地址可能已变更，或权限范围不再包含。</p>
            <div className="page-state__actions">
              <Link to="/">
                <Button variant="primary">回到起点</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
