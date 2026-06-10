// app/(public)/leaderboard/page.tsx
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { LeaderboardEntry } from '@/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';

async function getLeaderboard(search?: string): Promise<LeaderboardEntry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('v_leaderboard')
    .select('*')
    .limit(100);

  if (search) {
    query = query.ilike('roll_number', `%${search}%`);
  }

  const { data } = await query;
  return (data ?? []) as LeaderboardEntry[];
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground font-mono text-sm">#{rank}</span>;
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const entries = await getLeaderboard(q);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Contributors Leaderboard</h1>
        <p className="text-muted-foreground">
          Ranked by approved paper contributions. Thank you to everyone who helps build this archive.
        </p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by roll number…"
          className="max-w-sm mx-auto"
        />
      </form>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {q ? `No contributors found for "${q}".` : 'No contributors yet. Be the first!'}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Approved Papers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={
                    entry.rank <= 3
                      ? 'bg-amber-50/50 dark:bg-amber-950/10'
                      : ''
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      <RankIcon rank={Number(entry.rank)} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/contributors/${encodeURIComponent(entry.roll_number)}`}
                      className="font-mono font-medium hover:text-primary hover:underline"
                    >
                      {entry.roll_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {entry.department_code ? (
                      <Badge variant="outline">{entry.department_code}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-lg">{entry.total_approved}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export const revalidate = 300; // Revalidate every 5 minutes
