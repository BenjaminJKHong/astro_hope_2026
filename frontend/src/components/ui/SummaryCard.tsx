type SummaryCardProps = { label: string; value: string; detail: string; note: string; tone?: "cyan" | "green" | "amber" | "red"; critical?: boolean; size?: "default" | "compact" };

export function SummaryCard({ label, value, detail, note, tone = "cyan", critical = false, size = "default" }: SummaryCardProps) {
  return <article className={`summary-card tone-${tone}${size === "compact" ? " summary-card-compact" : ""}${critical ? " summary-card-critical" : ""}`}><div className="summary-card-content"><p className="eyebrow">{label}</p><div className="summary-value-line"><strong>{value}</strong><span>{detail}</span></div><p className="summary-note">{note}</p></div></article>;
}
