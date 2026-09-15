import { MetricPage } from "../../public-pages";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <MetricPage slug={(await params).slug} />; }
