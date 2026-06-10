import { createClient } from '@supabase/supabase-js';

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await supabase.from('v_admin_dashboard').select('*').single();
  return data ?? {};
}

export default async function AdminDashboardPage() {
  const stats = await getStats() as any;
  const cards = [
    { label: 'Total Papers', value: stats.total_papers ?? 0, color: '#3b82f6' },
    { label: 'Pending Review', value: stats.pending_papers ?? 0, color: '#f59e0b' },
    { label: 'Approved', value: stats.approved_papers ?? 0, color: '#10b981' },
    { label: 'Rejected', value: stats.rejected_papers ?? 0, color: '#ef4444' },
    { label: 'Departments', value: stats.departments_count ?? 0, color: '#8b5cf6' },
    { label: 'Teachers', value: stats.teachers_count ?? 0, color: '#6366f1' },
    { label: 'Subjects', value: stats.subjects_count ?? 0, color: '#06b6d4' },
    { label: 'Contributors', value: stats.contributors_count ?? 0, color: '#ec4899' },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>NTU Past Papers Archive — Admin Overview</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {cards.map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', borderLeft: `4px solid ${color}` }}>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Quick Links</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[['Pending Papers', '/admin/pending'], ['Departments', '/admin/departments'], ['Teachers', '/admin/teachers']].map(([label, href]) => (
            <a key={href} href={href} style={{ padding: '8px 16px', background: '#1d4ed8', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>{label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
