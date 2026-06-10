// app/(admin)/admin/page.tsx
import { createClient } from '@supabase/supabase-js';
import { AdminDashboardStats } from '@/types';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  FileText, Clock, CheckCircle, XCircle,
  Building2, UserRound, BookOpen, Users,
} from 'lucide-react';

async function getDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await supabase
    .from('v_admin_dashboard')
    .select('*')
    .single();
  return data as AdminDashboardStats;
}

async function getRecentPending() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await supabase
    .from('papers')
    .select(`
      id, exam_type, semester, term, year, roll_number, created_at,
      department:departments(name, code),
      teacher:teachers(name),
      subject:subjects(name, course_code)
    `)
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function AdminDashboardPage() {
  const [stats, pending] = await Promise.all([
    getDashboardStats(),
    getRecentPending(),
  ]);

  const statCards = [
    { label: 'Total Papers',     value: stats.total_papers,    icon: FileText,   color: 'text-blue-500' },
    { label: 'Pending Review',   value: stats.pending_papers,  icon: Clock,      color: 'text-amber-500' },
    { label: 'Approved Papers',  value: stats.approved_papers, icon: CheckCircle,color: 'text-green-500' },
    { label: 'Rejected Papers',  value: stats.rejected_papers, icon: XCircle,    color: 'text-red-500' },
    { label: 'Departments',      value: stats.departments_count, icon: Building2, color: 'text-violet-500' },
    { label: 'Teachers',         value: stats.teachers_count,  icon: UserRound,  color: 'text-indigo-500' },
    { label: 'Subjects',         value: stats.subjects_count,  icon: BookOpen,   color: 'text-cyan-500' },
    { label: 'Contributors',     value: stats.contributors_count, icon: Users,   color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">NTU Past Papers Archive — Admin Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(value ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Pending */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Pending Papers</h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending papers. All caught up!
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Roll Number','Subject','Teacher','Exam','Term/Year','Submitted'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{p.roll_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.subject?.name}</div>
                      <div className="text-xs text-muted-foreground">{p.subject?.course_code}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.teacher?.name}</td>
                    <td className="px-4 py-3">{p.exam_type}</td>
                    <td className="px-4 py-3">{p.term} {p.year}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/pending#${p.id}`}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        Review →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
