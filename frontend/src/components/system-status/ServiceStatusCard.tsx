import { serviceStateTone, type ServiceState } from "@/data/system-status";

export function ServiceStatusCard({ name, state, detail }: { name: string; state: ServiceState; detail: string }) {
  return <article className="panel service-card"><p className="eyebrow">{name}</p><div className="service-card-content"><strong className={`tone-text-${serviceStateTone[state]}`}>{state}</strong><span>{detail}</span></div></article>;
}
