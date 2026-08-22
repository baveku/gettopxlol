import { getLeaderboardData } from '@/lib/data';
import { LeaderboardView } from '@/components/LeaderboardView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialData = await getLeaderboardData();

  return <LeaderboardView initialData={initialData as any} />;
}
