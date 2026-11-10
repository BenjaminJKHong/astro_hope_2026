'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Mission Overview", icon: "◇", href: "/" },
  { label: "Crew Monitoring", icon: "◉", href: "/crew-profile" },
  { label: "Health Analytics", icon: "⌁", href: "/biometric-trends" },
  { label: "AI Flight Surgeon", icon: "✳", href: "/ai-surgeon" },
  { label: "Alert Center", icon: "⚑", href: "/alert-triage", alerts: "2" },
  { label: "Radiation Monitoring", icon: "○", href: "/radiation" },
  { label: "System Settings", icon: "⚙", href: "/system-status" },
];

export function Sidebar() {
  const pathname = usePathname();

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
            return (
              <li key={item.label}>
                <Link 
                  className={`navigation-item ${isCurrent ? 'navigation-item-current' : 'text-gray-400 hover:text-white'}`} 
                  href={item.href} 
                  aria-current={isCurrent ? "page" : undefined}
                >
                  <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.alerts && (
                    <span className="navigation-count" aria-label={`${item.alerts} alerts`}>{item.alerts}</span>
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