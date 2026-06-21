import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon, type IconName } from "@/components/Icon";
import { cn } from "@/utils/cn";

interface NavItemDef {
  to: string;
  icon: IconName;
  label: string;
  count?: number | string;
  badge?: string;
  end?: boolean;
  // Custom active matcher. When provided, overrides NavLink's default/`end`
  // matching — used so 录音库 lights up on the list + detail pages but NOT on
  // /app/recordings/new (which 新增录音 owns exclusively).
  isActive?: (pathname: string) => boolean;
}

interface NavSectionDef {
  title: string;
  items: NavItemDef[];
}

function memberSections(): NavSectionDef[] {
  return [
    {
      title: "AI 工作台",
      items: [
        { to: "/app/recordings/new", icon: "plus", label: "新增录音", end: true },
        {
          to: "/app/recordings",
          icon: "audio-lines",
          label: "录音库",
          // List + detail (/app/recordings, /app/recordings/:id) but never /new.
          isActive: (pathname) =>
            pathname === "/app/recordings" ||
            (pathname.startsWith("/app/recordings/") &&
              pathname !== "/app/recordings/new"),
          // end → 内置 aria-current 仅精确匹配 /app/recordings；视觉高亮仍由
          // 上面的 isActive 控制（详情页照常点亮，/new 不再重复 aria-current）。
          end: true,
        },
      ],
    },
    {
      title: "知识与样本",
      items: [
        { to: "/app/hotwords", icon: "spell-check", label: "热词" },
        { to: "/app/voiceprints", icon: "mic", label: "声纹" },
      ],
    },
  ];
}

function buildBreadcrumb(pathname: string): { href?: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  const labelMap: Record<string, string> = {
    app: "工作台",
    admin: "管理控制台",
    recordings: "录音库",
    new: "上传录音",
    hotwords: "热词",
    voiceprints: "声纹",
    settings: "设置",
    overview: "总览",
    users: "用户",
    teams: "团队",
    permissions: "角色映射",
    wecom: "企业微信",
    hotword: "热词总览",
    "hotword-sources": "热词来源",
    audit: "审计日志",
    asr: "ASR 配置",
    llm: "大模型",
    storage: "存储",
    "storage-queue": "队列",
    export: "导出",
    "export-templates": "导出模板",
  };
  // UUID-looking segments are record IDs — replace with a friendly tail label
  // based on the preceding segment (e.g. /recordings/<uuid> → "录音详情").
  const tailFor: Record<string, string> = {
    recordings: "录音详情",
    users: "用户详情",
    teams: "团队详情",
  };
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  const crumbs: { href?: string; label: string }[] = [];
  let acc = "";
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    let label = labelMap[seg] ?? seg;
    if (isUuid(seg)) {
      const parent = segments[i - 1] ?? "";
      label = tailFor[parent] ?? "详情";
    }
    if (i === 0 && segments.length === 1) {
      // Just "/app" — no crumb shown on landing.
      return [];
    }
    crumbs.push({ href: isLast ? undefined : acc, label });
  }
  return crumbs;
}

export function AppShell() {
  const location = useLocation();
  const sections = memberSections();
  const crumbs = buildBreadcrumb(location.pathname);

  // Mobile drawer state: on narrow viewports the sidebar collapses off-canvas
  // and is toggled by the navbar hamburger. CSS (.sidebar.is-open) handles the
  // slide-in; the scrim only renders while open. The drawer auto-closes on
  // route change so navigating from within it dismisses the overlay.
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Esc closes the drawer when it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        跳到主内容
      </a>

      {drawerOpen && (
        <div
          className="sidebar-scrim"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn("sidebar", drawerOpen && "is-open")}
        aria-label="主导航"
      >
        <div className="lockup sidebar__brand">
          <img
            src="/favicon.svg"
            alt="Aham Voice"
            width={30}
            height={30}
            className="lk-icon"
            // favicon.svg already carries its own rounded-square gradient, so
            // clear the .lk-icon accent fill and let the artwork show through.
            style={{ background: "transparent", borderRadius: "var(--r-md)" }}
          />
          <div className="lk-body">
            <span className="lk-title">Aham Voice</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {sections.map((section) => (
            <div className="nav-group" key={section.title}>
              <div className="nav-grouptitle">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "nav-item",
                      (item.isActive ? item.isActive(location.pathname) : isActive) &&
                        "nav-item--on",
                    )
                  }
                >
                  <Icon name={item.icon} size={18} className="ico" />
                  <span className="nav-item__label">{item.label}</span>
                  {item.count != null && <span className="badge">{item.count}</span>}
                  {item.badge && <span className="badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__foot" style={{ marginBlockStart: "auto" }}>
          <NavLink
            to="/app/settings"
            className={({ isActive }) => cn("nav-item", "app-settings-link", isActive && "nav-item--on")}
          >
            <Icon name="settings" size={18} className="ico" />
            <span className="nav-item__label">设置</span>
          </NavLink>
        </div>
      </aside>

      <div className="col">
        <header className="navbar">
          <div className="container container--content navbar__inner">
            <button
              type="button"
              className="icon-btn navbar__menu"
              aria-label="打开导航菜单"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <Icon name="menu" size={18} />
            </button>
            <nav className="crumb" aria-label="位置">
              {crumbs.map((crumb, idx) => (
                <span key={`${crumb.label}-${idx}`} className="row" style={{ gap: "var(--s2)" }}>
                  {idx > 0 && <span className="sep">/</span>}
                  {crumb.href ? (
                    <NavLink to={crumb.href}>{crumb.label}</NavLink>
                  ) : (
                    <span className="here">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="nav-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="主题"
              onClick={() => {
                const root = document.documentElement;
                // Resolve the currently-effective theme: explicit data-theme wins,
                // otherwise fall back to the system preference.
                const current =
                  root.getAttribute("data-theme") ??
                  (window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light");
                root.setAttribute("data-theme", current === "dark" ? "light" : "dark");
              }}
            >
              <Icon name="sun" size={18} />
            </button>
            </div>
          </div>
        </header>

        <main className="fill track-web" id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
