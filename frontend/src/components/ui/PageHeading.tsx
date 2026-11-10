type PageHeadingProps = { title: string; description: string; badge?: string };

export function PageHeading({ title, description, badge = "STATUS UNKNOWN" }: PageHeadingProps) {
  return <section className="page-heading" aria-labelledby="page-title"><div><h1 id="page-title">{title}</h1><p>{description}</p></div><span className="simulated-badge"><span className="status-dot status-dot-amber" aria-hidden="true" />{badge}</span></section>;
}
