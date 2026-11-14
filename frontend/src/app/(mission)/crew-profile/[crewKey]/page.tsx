import { CrewProfile } from "@/components/crew-profile/CrewProfile";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";
import { crewStreamPlaceholders, getCrewStream } from "@/data/crew-streams";

export function generateStaticParams() {
  return crewStreamPlaceholders.map((crew) => ({ crewKey: crew.key }));
}

export default async function SelectedCrewProfilePage({
  params,
}: {
  params: Promise<{ crewKey: string }>;
}) {
  const { crewKey } = await params;
  return (
    <WarningStateProvider>
      <CrewProfile crew={crewKey}/>
    </WarningStateProvider>
  )
}
