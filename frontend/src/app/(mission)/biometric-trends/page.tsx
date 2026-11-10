import { Suspense } from "react";
import { BiometricTrends } from "@/components/dashboard/BiometricTrends";
import BiometricTrendsLoading from "./loading";

export default function BiometricTrendsPage() {
  return <Suspense fallback={<BiometricTrendsLoading />}><BiometricTrends /></Suspense>;
}
