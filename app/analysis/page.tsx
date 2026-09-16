import Link from "next/link";
import { SiteShell } from "../site-shell";
import AnalysisLibraryClient from "./analysis-library-client";

export default function Page() {
  return <SiteShell active="analysis"><main className="page-main section-pad"><div className="section-kicker"><span>ANALYSIS / RESEARCH LIBRARY</span><span>WRITING · POWER · OUTSMARTING</span></div><header className="page-heading"><div><h1>A place for better questions.</h1><p>Search community research, follow the evidence, and create your own focused study of a character, work, or aspect.</p></div><Link className="button button-primary" href="/analysis/new">Create research ↗</Link></header><AnalysisLibraryClient /></main></SiteShell>;
}
