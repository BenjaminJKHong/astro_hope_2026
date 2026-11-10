import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { crewStreamPlaceholders } from "@/data/crew-streams";

export function CrewStreams() {
  return (
    <Panel className="crew-streams">
      <h2>CREW STREAM STATUS</h2>
      <p className="panel-subtitle">
        Select a crew stream to open its profile · identities await backend reporting
      </p>
      <div className="crew-grid">
        {crewStreamPlaceholders.map((stream) => (
          <Link
            className={`crew-card crew-card-link${stream.dataState === "NOT CONNECTED" ? " crew-waiting" : ""}`}
            href={`/crew-profile/${stream.key}`}
            key={stream.key}
            aria-label={`Open profile for ${stream.label}, ${stream.state}`}
          >
            <span className="crew-dot dot-amber" aria-hidden="true" />
            <strong>{stream.label}</strong>
            <span className="tone-text-amber">{stream.state}</span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
