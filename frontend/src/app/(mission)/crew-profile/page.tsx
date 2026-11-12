import { CrewProfile } from "@/components/crew-profile/CrewProfile";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

export default function CrewProfileIndexPage() {
  return (
    <WarningStateProvider>
      <CrewProfile />
    </WarningStateProvider>
  );
}