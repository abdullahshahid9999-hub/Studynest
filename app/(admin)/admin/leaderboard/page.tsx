'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    sb.from('v_leaderboard').select('*').limit(100).then(({ data }) => setEntries(data ?? []));
  }, []);

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '24px' }}>Leaderboard</h1>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Rank','Roll Number','Department','Approved Papers'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: i < entries.length-1 ? '1px solid #f3f4f6' : 'none', background: i < 3 ? '#fffbeb' : 'white' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '16px' }}>
                  {Number(e.rank) === 1 ? '🥇' : Number(e.rank) === 2 ? '🥈' : Number(e.rank) === 3 ? '🥉' : '#' + e.rank}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '500', fontSize: '13px' }}>{e.roll_number}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{e.department_code ?? '—'}</span></td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '16px', color: '#16a34a' }}>{e.total_approved}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
