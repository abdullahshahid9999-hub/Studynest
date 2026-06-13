'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    sb.from('v_admin_dashboard').select('*').single().then(({ data }) => setStats(data ?? {}));
    sb.from('papers')
      .select('id,exam_type,semester,term,year,roll_number,created_at,departments(name,code),teachers(name),subjects(name,course_code)')
      .eq('status','Pending').order('created_at',{ascending:false}).limit(5)
      .then(({ data }) => setPending(data ?? []));
  }, []);

  const statCards = [
    { label: 'Total Papers',   value: stats.total_papers,      color: '#3b82f6' },
    { label: 'Pending',        value: stats.pending_papers,    color: '#f59e0b' },
    { label: 'Approved',       value: stats.approved_papers,   color: '#10b981' },
    { label: 'Rejected',       value: stats.rejected_papers,   color: '#ef4444' },
    { label: 'Departments',    value: stats.departments_count, color: '#8b5cf6' },
    { label: 'Teachers',       value: stats.teachers_count,    color: '#6366f1' },
    { label: 'Subjects',       value: stats.subjects_count,    color: '#06b6d4' },
    { label: 'Contributors',   value: stats.contributors_count,color: '#ec4899' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '16px 18px', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111' }}>{(value ?? 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Recent pending */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Recent Pending</span>
          <a href="/admin/pending" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
        </div>
        {pending.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>All caught up!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Roll Number','Subject','Teacher','Exam','Submitted'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((p: any) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{p.roll_number}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{(p.subjects as any)?.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{(p.subjects as any)?.course_code}</div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#666' }}>{(p.teachers as any)?.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13 }}>{p.exam_type} · {p.term} {p.year}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#aaa' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
