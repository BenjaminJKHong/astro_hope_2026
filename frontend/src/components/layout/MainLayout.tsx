import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type MainLayoutProps = { children: ReactNode };

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="workspace">
        <Header />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
