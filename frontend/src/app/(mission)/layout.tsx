import { MainLayout } from "@/components/layout/MainLayout";

export default function MissionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}