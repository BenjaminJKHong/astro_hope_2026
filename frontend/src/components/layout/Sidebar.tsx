'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster } from "@/hooks/useCrewRoster";

const navigationItems = [
  { label: "Mission Overview", icon: "◇", href: "/" },
  { label: "Crew Monitoring", icon: "◉", href: "/crew-profile" },
  { label: "Health Analytics", icon: "⌁", href: "/biometric-trends" },
  { label: "AI Flight Surgeon", icon: "✳", href: "/ai-surgeon" },
  { label: "Alert Center", icon: "⚑", href: "/alert-triage" },
  { label: "Radiation Monitoring", icon: "○", href: "/radiation" },
  { label: "System Settings", icon: "⚙", href: "/system-status" },
];

type AlertSummary = {
  baseCritical: boolean;
  criticalCrewCount: number;
  radiationCritical: boolean;
  isConnected: boolean;
};

function buildOperationAlerts({
  baseCritical,
  criticalCrewCount,
  radiationCritical,
  isConnected,
}: AlertSummary): Record<string, string | null> {
  const hasBiometricError = baseCritical || criticalCrewCount > 0;
  const hasAnyError = hasBiometricError || radiationCritical;
  const totalAlerts = Math.max(criticalCrewCount, hasAnyError ? 2 : 0);

  let crewBadge: string | null = null;
  if (criticalCrewCount > 0) crewBadge = String(criticalCrewCount);
  else if (baseCritical) crewBadge = "!";

  return {
    "Mission Overview": hasAnyError ? "!" : null,
    "Crew Monitoring": crewBadge,
    "Health Analytics": hasBiometricError ? "!" : null,
    "AI Flight Surgeon": hasBiometricError ? "1" : null,
    "Alert Center": totalAlerts > 0 ? String(totalAlerts) : null,
    "Radiation Monitoring": radiationCritical ? "!" : null,
    "System Settings": isConnected ? null : "!",
  };
}

export function Sidebar() {
  const pathname = usePathname();
  const { telemetry, isConnected } = useTelemetry();

  const baseCritical =
    telemetry?.system_status === "CRITICAL" ||
    telemetry?.system_status === "RED";

  const { crew } = useCrewRoster(telemetry, baseCritical);
  const activeCrew = crew.filter((m) => !m.isOffboarded);
  const criticalCrewCount = activeCrew.filter((m) => m.isCritical).length;

  const rawRad = (telemetry as Record<string, unknown> | null)?.radiation_msv;
  const radiationCritical =
    typeof rawRad === "number" ? rawRad >= 0.5 : baseCritical;

  const operationAlerts = buildOperationAlerts({
    baseCritical,
    criticalCrewCount,
    radiationCritical,
    isConnected,
  });

  return (
    <aside className="sidebar" aria-label="Mission navigation">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span className="brand-copy">
          <span className="brand-name">ASTROPULSE</span>
          <span className="brand-caption">MISSION CONTROL</span>
        </span>
      </div>
      <div className="sidebar-rule" />
      <nav className="sidebar-navigation" aria-label="Operations">
        <p className="navigation-heading">OPERATIONS</p>
        <ul className="navigation-list">
          {navigationItems.map((item) => {
            const isCurrent = pathname === item.href;
            const alertBadge = operationAlerts[item.label] ?? null;
            let itemStateClass = "text-gray-400 hover:text-white";
            if (isCurrent) {
              itemStateClass = "navigation-item-current";
            } else if (alertBadge) {
              itemStateClass = "text-red-300 hover:text-red-100";
            }

            return (
              <li key={item.label}>
                <Link
                  className={`navigation-item ${itemStateClass}`}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {alertBadge && (
                    <span
                      className="navigation-count !bg-red-500 !text-white font-extrabold animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.95)] ring-2 ring-red-300/80"
                      aria-label={`${alertBadge} alerts`}
                    >
                      {alertBadge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="connection-pill"><span className="status-dot status-dot-green" aria-hidden="true" />CONNECTED</div>
        <p className="sync-caption">DATA SYNC · LIVE</p>
        <div className="operator-profile">
          <span className="operator-avatar" aria-hidden="true">MC</span>
          <span>MC · FLIGHT SURGEON</span>
        </div>
      </div>
    </aside>
  );
}