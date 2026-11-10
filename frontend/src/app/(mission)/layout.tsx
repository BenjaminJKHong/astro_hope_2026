import type { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

export default function MissionLayout({ children }: { children: ReactNode }) {
  return <WarningStateProvider><MainLayout>{children}</MainLayout></WarningStateProvider>;
}
