import Link from "next/link";
import { seedCharacters, seedComparisons, seedMetrics, seedWorks } from "../db/seed-data";
import { getDb } from "../db";
import { comparisonRevisions, comparisons } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { SiteShell } from "./site-shell";
import SettingsClient from "./settings/settings-client";
import { researchCatalog } from "../lib/analysis-catalog";
import AnalysisDetailClient from "./analysis/analysis-detail-client";
import ComparisonReaderClient from "./comparisons/comparison-reader-client";

export function PublicPage({ eyebrow, title, description, active = "" , children }: { eyebrow: string; title: string; description: string; active?: string; children: React.ReactNode }) {
  return <SiteShell active={active}>
    <main className="page-main section-pad">
      <div className="section-kicker"><span>{eyebrow}</span><span>ENGLISH / PUBLIC READ</span></div>
      <header className="page-heading"><div><h1>{title}</h1><p>{description}</p></div><Link className="button button-primary" href="/#new-comparison">Create a draft ↗</Link></header>
      {children}
    </main>
  </SiteShell>;
}

export function ExplorePage() {
  return <PublicPage active="explore" eyebrow="EXPLORE / KNOWLEDGE GRAPH" title="Find the argument behind the score." description="Browse published comparisons, evidence trails, metric definitions, and analysis written for readers who want to inspect the work." >
    <section className="page-grid page-grid-wide"><div>
      <div className="list-heading"><span>RECENT PUBLISHED WORK</span><span>{seedComparisons.length} indexed</span></div>
      {seedComparisons.map((item, index) => <Link className="recent-row" href={`/comparisons/${item.slug}`} key={item.slug}><span className="recent-index">0{index + 1}</span><div className="recent-main"><div><span className="status-chip">{item.domain}</span><span className="recent-age">SEEDED FOUNDATION</span></div><h3>{item.title}</h3><p>{item.categories} metrics · {item.evidence} evidence objects · {item.difficulty}</p></div><span className="recent-result">{item.winner}</span></Link>)}
    </div><aside className="review-rail"><div className="list-heading"><span>REVIEW QUEUE</span><span className="queue-count">03</span></div><div className="review-item review-cyan"><span className="review-icon">↳</span><div><strong>Evidence dispute</strong><p>Source context needs a clearer boundary.</p><span className="review-state">OPEN FOR REVIEW</span></div></div><div className="review-item review-wine"><span className="review-icon">◇</span><div><strong>Metric duplicate</strong><p>Counter-planning resembles planning.</p><span className="review-state">TRIAGE</span></div></div><div className="review-item review-orange"><span className="review-icon">+</span><div><strong>New community edit</strong><p>A reader suggested a counterargument.</p><span className="review-state">READY</span></div></div></aside></section>
    <section className="catalog-strip"><span>CATALOG SCOPE</span><strong>{seedWorks.length} works</strong><strong>{seedCharacters.length} characters</strong><strong>{seedMetrics.length} metric definitions</strong><Link href="/library">Open the Library ↗</Link></section>
  </PublicPage>;
}

export function LibraryPage() {
  return <PublicPage active="library" eyebrow="LIBRARY / UNIFIED SEARCH" title="A shared context layer for writing." description="Canonical metadata, community claims, versions, sources, and creative outputs stay linked without pretending they are the same kind of truth." >
    <div className="library-filters"><input className="library-search" placeholder="Search works, characters, metrics, comparisons, and analysis" aria-label="Search the Library" /><select aria-label="Filter by domain"><option>All domains</option><option>WIS / Powerscaling</option><option>SCD / Smart Character Debate</option><option>WW / Writing Wise</option></select><select aria-label="Filter by content type"><option>All content</option><option>Published comparisons</option><option>Metrics</option><option>Evidence</option><option>Analysis</option></select></div>
    <div className="library-catalog"><div className="catalog-column"><div className="list-heading"><span>WORKS</span><span>CANONICAL METADATA</span></div>{seedWorks.map((work) => <Link className="catalog-card" key={work.slug} href={`/works/${work.slug}`}><span className={`work-dot ${work.accent}`} /><div><strong>{work.title}</strong><p>{work.type} · {work.creator}</p><small>{work.description}</small></div><span>↗</span></Link>)}</div><div className="catalog-column"><div className="list-heading"><span>METRICS</span><span>VERSIONED</span></div>{seedMetrics.map((metric) => <Link className="catalog-card" key={metric.slug} href={`/metrics/${metric.slug}`}><span className="metric-code">{metric.domain}</span><div><strong>{metric.name}</strong><p>{metric.family} · weight {metric.defaultWeight.toFixed(1)}</p><small>{metric.definition}</small></div><span>↗</span></Link>)}</div></div>
  </PublicPage>;
}

export function MetricPage({ slug }: { slug: string }) {
  const metric = seedMetrics.find((item) => item.slug === slug) ?? seedMetrics[0];
  return <PublicPage eyebrow={`METRIC / ${metric.domain}`} title={metric.name} description={metric.definition} active="library">
    <div className="detail-grid"><article className="detail-card"><span className="card-label">DEFINITION / VERSION 1</span><h2>{metric.name}</h2><p>{metric.definition}</p><div className="data-list"><div><span>Domain</span><b>{metric.domain}</b></div><div><span>Family</span><b>{metric.family}</b></div><div><span>Default weight</span><b>{metric.defaultWeight.toFixed(1)} normalized units</b></div><div><span>Status</span><b>{metric.status}</b></div></div></article><aside className="detail-card accent-card"><span className="card-label">GOVERNANCE</span><h3>What this includes</h3><p>Published definitions are immutable. A future revision must preserve the old version for existing comparisons and explain what changed.</p><ul><li>Inclusion and exclusion criteria</li><li>Examples and anti-examples</li><li>Review history and duplicate checks</li><li>Transparent weight distribution</li></ul><Link className="text-link" href="/metrics">Browse all metrics ↗</Link></aside></div>
  </PublicPage>;
}

export async function ComparisonPage({ slug }: { slug: string }) {
  const item = seedComparisons.find((comparison) => comparison.slug === slug) ?? seedComparisons[0];
  let stored: { title: string; domain: string; difficulty: string; revisionNumber: number; scoreA?: number; scoreB?: number } | null = null;
  try { const comparison = (await getDb().select().from(comparisons).where(and(eq(comparisons.slug, slug), eq(comparisons.status, "published"))).limit(1))[0]; if (comparison) { const revision = (await getDb().select().from(comparisonRevisions).where(and(eq(comparisonRevisions.comparisonId, comparison.id), eq(comparisonRevisions.revisionNumber, comparison.revisionNumber))).limit(1))[0]; const snapshot = revision ? JSON.parse(revision.snapshotJson) as { calculation?: { totalA?: number; totalB?: number } } : {}; stored = { title: comparison.title, domain: comparison.domain, difficulty: comparison.difficulty, revisionNumber: comparison.revisionNumber, scoreA: snapshot.calculation?.totalA ? Math.round(snapshot.calculation.totalA * 100) : undefined, scoreB: snapshot.calculation?.totalB ? Math.round(snapshot.calculation.totalB * 100) : undefined }; } } catch { /* public seed fallback remains available while D1 is unavailable */ }
  const display = stored ?? { ...item, revisionNumber: 0 };
  return <PublicPage eyebrow={`COMPARISON / ${display.domain}`} title={display.title} description="A public, versioned comparison with explicit rules, visible weights, evidence links, and a recalculable result." active="compare">
    <ComparisonReaderClient item={item} display={display} />
  </PublicPage>;
}

export function AnalysisPage({ slug }: { slug: string }) {
  const entry = researchCatalog.find((item) => item.slug === slug) ?? researchCatalog[0];
  return <PublicPage eyebrow={`ANALYSIS / ${entry.domain} RESEARCH`} title={entry.title} description={entry.summary} active="analysis">
    <AnalysisDetailClient initialEntry={entry} />
  </PublicPage>;
}

export function StudioPage() {
  return <PublicPage eyebrow="STUDIO / COMPARISON CARDS" title="Turn the ledger into a shareable card." description="The first production Studio milestone is a 9:16 data-bound composer. Rendering can arrive later without changing the project schema." active="studio">
    <div className="studio-layout"><div className="studio-preview"><div className="studio-label">SCALEFRAME / SCD / 9:16</div><div className="studio-card"><span>THE STRATEGIST&apos;S CEILING</span><strong>BAKU<br /><em>vs</em> JOHAN</strong><div className="studio-winner">BAKU WINS / 61 — 39</div><small>DATA-BOUND COMPARISON CARD</small></div><div className="studio-controls"><button type="button">▣ Text</button><button type="button">▤ Comparison</button><button type="button">□ Shape</button><button type="button">◌ Caption</button></div></div><aside className="studio-sidebar"><div className="list-heading"><span>LAYERS</span><span>9:16</span></div>{["Title · bound", "Participant names · bound", "Weighted score · bound", "Winner band · bound", "Evidence note"].map((layer, index) => <div className="layer-row" key={layer}><span>{index + 1}</span><strong>{layer}</strong><small>◉</small></div>)}<div className="notice">Sign in to create a private project. Autosave, revision recovery, provenance metadata, and signed media uploads are part of the project API.</div><Link className="button button-primary" href="/settings">Configure account ↗</Link></aside></div>
  </PublicPage>;
}

export function SettingsPage() {
  return <PublicPage eyebrow="ACCOUNT / SECURITY" title="Your work stays yours." description="Accounts unlock private drafts, saved items, analysis revisions, Studio projects, and export/delete controls." >
    <SettingsClient />
  </PublicPage>;
}

export function ModerationPage() {
  return <PublicPage eyebrow="TRUST & SAFETY / HUMAN REVIEW" title="Good faith needs structure." description="Reports, evidence disputes, metric review, takedown requests, and moderation actions are logged and reversible where appropriate." >
    <div className="detail-grid"><article className="detail-card"><span className="card-label">COMMUNITY GUIDELINES</span><h2>Argue the work. Show the receipt.</h2><ul><li>Label spoilers, mature content, and adaptation boundaries.</li><li>Separate canon metadata from community interpretation.</li><li>Use sources and counterarguments for consequential claims.</li><li>Report harassment, impersonation, spam, copyright concerns, and unsafe media.</li></ul><button className="button button-primary" type="button">Sign in to file a report</button></article><aside className="detail-card"><span className="card-label">GOVERNANCE LOG</span><div className="audit-row"><b>Metric proposal</b><span>duplicate review → human review</span></div><div className="audit-row"><b>Evidence dispute</b><span>source context requested</span></div><div className="audit-row"><b>Upload provenance</b><span>attestation required</span></div><p className="form-hint">Automated signals can triage spam and duplicates. They do not decide truth or final moderation outcomes.</p></aside></div>
  </PublicPage>;
}
