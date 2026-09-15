import { ComparisonPage } from "../../public-pages";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <ComparisonPage slug={(await params).slug} />; }
