export function RadiationWidget({ critical = false }: { critical?: boolean }) {
  return <section className={`panel radiation-widget${critical ? " radiation-widget-critical" : ""}`}><h2>RADIATION TELEMETRY</h2><p className="widget-subtitle">CREW MEMBER · ID NOT REPORTED</p><div className="dose-value">— <span>mSv</span></div><p className="dose-scope">FIELD · radiation_msv · ID NOT REPORTED</p><div className="widget-divider"/><p className="dose-note">{critical ? "CRITICAL MODE · VALUE NOT REPORTED" : "WAITING FOR TELEMETRY"}</p></section>;
}
