"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { researchCatalog, researchTags, type ResearchAnalysis } from "../../lib/analysis-catalog";

const lenses = ["All lenses", "WIS", "SCD", "WW"] as const;
const subjects = ["All subjects", "character", "work", "aspect"] as const;

export default function AnalysisLibraryClient() {
  const [items, setItems] = useState<ResearchAnalysis[]>(researchCatalog);
  const [query, setQuery] = useState("");
  const [lens, setLens] = useState<(typeof lenses)[number]>("All lenses");
  const [subject, setSubject] = useState<(typeof subjects)[number]>("All subjects");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(); if (query) params.set("q", query); if (lens !== "All lenses") params.set("domain", lens); if (subject !== "All subjects") params.set("subjectType", subject); if (tag) params.set("tag", tag);
    fetch(`/api/analyses?${params}`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<{ analyses?: ResearchAnalysis[] }> : Promise.reject()).then((data) => { if (data.analyses) setItems(data.analyses); }).catch(() => undefined).finally(() => setLoading(false));
    return () => controller.abort();
  }, [query, lens, subject, tag]);

  const counts = useMemo(() => ({ all: researchCatalog.length, WIS: researchCatalog.filter((item) => item.domain === "WIS").length, SCD: researchCatalog.filter((item) => item.domain === "SCD").length, WW: researchCatalog.filter((item) => item.domain === "WW").length }), []);

  return <div className="research-library">
    <section className="research-intro" aria-labelledby="research-title">
      <div><span className="eyebrow"><span className="eyebrow-dot" /> RESEARCH / COMMUNITY LIBRARY</span><h1 id="research-title">Read the work behind the claim.</h1><p>Find close readings, feat breakdowns, and outsmarting studies. Every entry names its subject, lens, version, sources, and limits so newcomers can follow the reasoning.</p></div>
      <div className="research-intro-aside"><span className="card-label">START WITH A QUESTION</span><strong>What are you trying to understand?</strong><p>Choose a character, a whole work, or one aspect of them. Then leave a trail someone else can build on.</p><Link className="button button-primary" href="/analysis/new">Start your research ↗</Link></div>
    </section>
    <section className="research-controls" aria-label="Research filters">
      <label className="research-search"><span className="sr-only">Search research</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, subjects, aspects, tags…" /></label>
      <div className="research-tabs" role="tablist" aria-label="Research lenses">{lenses.map((item) => <button key={item} className={lens === item ? "active" : ""} onClick={() => setLens(item)} role="tab" aria-selected={lens === item}>{item}{item !== "All lenses" && <small>{counts[item]}</small>}</button>)}</div>
      <div className="research-selects"><label>Subject <select value={subject} onChange={(event) => setSubject(event.target.value as (typeof subjects)[number])}>{subjects.map((item) => <option key={item} value={item}>{item === "All subjects" ? item : item[0].toUpperCase() + item.slice(1)}</option>)}</select></label><label>Tag <select value={tag} onChange={(event) => setTag(event.target.value)}><option value="">All tags</option>{researchTags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
    </section>
    <div className="research-results-heading"><div><span className="section-index">02</span><strong>CURATED + COMMUNITY RESEARCH</strong></div><span>{loading ? "Updating…" : `${items.length} entries`}</span></div>
    {items.length ? <section className="research-grid" aria-live="polite">{items.map((item) => <Link className="research-card" href={`/analysis/${item.slug}`} key={item.slug}><div className="research-card-top"><span className={`status-chip research-domain-${item.domain.toLowerCase()}`}>{item.domain}</span><span>{item.readTime} read</span></div><h2>{item.title}</h2><p>{item.summary}</p><div className="research-subject"><span>{item.subjectType === "aspect" ? "ASPECT STUDY" : item.subjectType.toUpperCase()}</span><strong>{item.subjectLabel}</strong><small>{item.aspect}</small></div><div className="tag-row">{item.tags.slice(0, 4).map((itemTag) => <span key={itemTag}>#{itemTag}</span>)}</div><div className="research-card-foot"><span>Revision {item.revision} · {item.author}</span><span>{item.comments} comments ↗</span></div></Link>)}</section> : <div className="empty-state"><strong>No research matches that trail yet.</strong><p>Try another lens or start a draft and make the missing connection yourself.</p><Link className="button button-outline" href="/analysis/new">Create a research brief</Link></div>}
    <section className="research-guide"><div><span className="card-label">A FRIENDLY READING CONTRACT</span><h2>Make interpretation inspectable.</h2></div><div className="guide-grid"><div><strong>01 / Name the object</strong><p>Say whether you are studying a character, work, or aspect—and which version you mean.</p></div><div><strong>02 / Show the trail</strong><p>Link claims to sources, scenes, feats, or comparison rows. Notes alone are not evidence.</p></div><div><strong>03 / Leave room to reply</strong><p>Readers can comment on a revision without rewriting the author’s argument.</p></div></div></section>
  </div>;
}
