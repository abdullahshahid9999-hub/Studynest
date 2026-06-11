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

  const cards = [
    { label: 'Total Papers',    value: stats.total_papers,      color: '#3b82f6' },
    { label: 'Pending Review',  value: stats.pending_papers,    color: '#f59e0b' },
    { label: 'Approved',        value: stats.approved_papers,   color: '#10b981' },
    { label: 'Rejected',        value: stats.rejected_papers,   color: '#ef4444' },
    { label: 'Departments',     value: stats.departments_count, color: '#8b5cf6' },
    { label: 'Teachers',        value: stats.teachers_count,    color: '#6366f1' },
    { label: 'Subjects',        value: stats.subjects_count,    color: '#06b6d4' },
    { label: 'Contributors',    value: stats.contributors_count,color: '#ec4899' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>NTU Past Papers Archive — Admin Overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        {cards.map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '18px', borderLeft: `4px solid ${color}` }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 6px', fontWeight: '500' }}>{label}</p>
            <p style={{ fontSize: '1.9rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>{(value ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: '600', margin: 0, fontSize: '15px' }}>Recent Pending Papers</h2>
          <a href="/admin/pending" style={{ fontSize: '13px', color: '#1d4ed8', textDecoration: 'none' }}>View all →</a>
        </div>
        {pending.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', margin: 0 }}>No pending papers. All caught up!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Roll Number','Subject','Teacher','Exam','Term/Year','Submitted'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((p: any, i: number) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#374151' }}>{p.roll_number}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{(p.subjects as any)?.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{(p.subjects as any)?.course_code}</div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#6b7280' }}>{(p.teachers as any)?.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px' }}>{p.exam_type}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px' }}>{p.term} {p.year}</td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#9ca3af' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[['Pending Papers','/admin/pending','#f59e0b'],['Departments','/admin/departments','#8b5cf6'],['Teachers','/admin/teachers','#6366f1'],['Subjects','/admin/subjects','#06b6d4'],['Contributors','/admin/contributors','#ec4899']].map(([label,href,color]) => (
          <a key={href} href={href as string} style={{ padding: '9px 18px', background: color as string, color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>{label as string}</a>
        ))}
      </div>
    </div>
  );
}
