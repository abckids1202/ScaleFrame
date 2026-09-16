import { SiteShell } from "../../site-shell";
import AnalysisEditorClient from "./editor-client";

export default function Page() {
  return <SiteShell active="analysis"><main className="page-main section-pad"><div className="section-kicker"><span>RESEARCH STUDIO / PRIVATE DRAFT</span><span>ONE OWNER · VERSIONED</span></div><AnalysisEditorClient /></main></SiteShell>;
}
