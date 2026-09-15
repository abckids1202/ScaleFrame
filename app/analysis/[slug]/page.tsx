import { AnalysisPage } from "../../public-pages";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <AnalysisPage slug={(await params).slug} />; }
