export function Header() {
  return (
    <header className="mission-header">
      <div className="mission-identity">
        <p className="mission-name">ARTEMIS SIMULATION MISSION</p>
        <p className="mission-code">AG-2026-001 / ORBITAL OPERATIONS</p>
      </div>
      <div className="mission-clock mission-clock-elapsed"><span className="clock-value">T+ 06:14:32</span></div>
      <div className="mission-clock"><span className="clock-value">14:32:08 Z</span></div>
      <div className="header-status-group" aria-label="Mission system status">
        <span className="status-pill status-pill-telemetry"><span className="status-dot status-dot-green" aria-hidden="true" />TELEMETRY</span>
        <span className="status-pill status-pill-ai"><span className="status-dot status-dot-cyan" aria-hidden="true" />AI ACTIVE</span>
        <span className="notification-indicator" aria-label="2 notifications"><span aria-hidden="true">♢</span><span className="notification-count">2</span></span>
        <span className="header-avatar" aria-label="Mission control operator">MC</span>
      </div>
    </header>
  );
}
