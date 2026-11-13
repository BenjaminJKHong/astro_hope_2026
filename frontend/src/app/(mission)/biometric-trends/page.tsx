import { CrewBiometricProfile } from "@/components/crew-profile/CrewBiometricProfile";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

export default function BiometricTrendsPage() {
  return (
    <WarningStateProvider>
      <CrewBiometricProfile />
    </WarningStateProvider>
  );
}