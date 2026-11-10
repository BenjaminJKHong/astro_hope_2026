import { CrewProfile } from "@/components/crew-profile/CrewProfile";
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
  return <CrewProfile crew={getCrewStream(crewKey)} />;
}
