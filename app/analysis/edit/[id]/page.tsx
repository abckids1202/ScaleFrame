import { SiteShell } from "../../../site-shell";
import AnalysisRevisionEditor from "./editor-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <SiteShell active="analysis"><main className="page-main section-pad"><div className="section-kicker"><span>RESEARCH STUDIO / PRIVATE DRAFT</span><span>VERSIONED · SINGLE OWNER</span></div><AnalysisRevisionEditor id={(await params).id} /></main></SiteShell>;
}
