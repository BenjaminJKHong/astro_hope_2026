import { Suspense } from "react";
import { BiometricTrends } from "@/components/dashboard/BiometricTrends";
import { crewStreamPlaceholders } from "@/data/crew-streams";
import BiometricTrendsLoading from "../loading";

export function generateStaticParams() {
  return crewStreamPlaceholders.map((crew) => ({ crewKey: crew.key }));
}

export default async function SelectedCrewBiometricTrendsPage({
  params,
}: {
  params: Promise<{ crewKey: string }>;
}) {
  const { crewKey } = await params;
  return <Suspense fallback={<BiometricTrendsLoading />}><BiometricTrends initialCrewKey={crewKey} /></Suspense>;
}
