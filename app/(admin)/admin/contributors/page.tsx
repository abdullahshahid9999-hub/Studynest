'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    sb.from('contributors').select('*, departments(name,code)').order('total_approved', { ascending: false })
      .then(({ data }) => setContributors(data ?? []));
  }, []);

  const filtered = contributors.filter(c =>
    c.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Contributors</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{contributors.length} total contributors</p>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by roll number..."
        style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '280px', marginBottom: '20px' }} />
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Roll Number','Department','Approved','Pending','Rejected','Joined'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '500' }}>{c.roll_number}</td>
                <td style={{ padding: '11px 14px' }}><span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{c.departments?.code ?? '—'}</span></td>
                <td style={{ padding: '11px 14px' }}><span style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>{c.total_approved}</span></td>
                <td style={{ padding: '11px 14px' }}><span style={{ color: '#d97706', fontWeight: '600', fontSize: '14px' }}>{c.total_pending}</span></td>
                <td style={{ padding: '11px 14px' }}><span style={{ color: '#dc2626', fontWeight: '600', fontSize: '14px' }}>{c.total_rejected}</span></td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No contributors yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
