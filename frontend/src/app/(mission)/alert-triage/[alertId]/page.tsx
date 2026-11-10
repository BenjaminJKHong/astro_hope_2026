import { AlertTriageDetail } from "@/components/alerts/AlertTriageDetail";
import { criticalDemoAlert, getMissionAlert } from "@/data/alerts";

export function generateStaticParams() {
  return [{ alertId: criticalDemoAlert.id }];
}

export default async function SelectedAlertTriagePage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;
  return <AlertTriageDetail alert={getMissionAlert(alertId)} />;
}
