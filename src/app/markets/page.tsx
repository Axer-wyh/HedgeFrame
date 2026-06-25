import { MarketsWorkspace } from "../markets-workspace";

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;

  return <MarketsWorkspace initialScenario={params.scenario} />;
}
