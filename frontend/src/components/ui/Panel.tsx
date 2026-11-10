import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & { children: ReactNode; className?: string };

export function Panel({ children, className = "", ...attributes }: PanelProps) {
  return <section className={`panel ${className}`} {...attributes}>{children}</section>;
}
