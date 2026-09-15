import { ComparisonPage } from "../../public-pages";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <ComparisonPage slug={(await params).slug} />; }
