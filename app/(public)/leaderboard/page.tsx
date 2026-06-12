'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    sb.from('v_leaderboard').select('*').limit(100).then(({ data }) => setEntries(data ?? []));
  }, []);

  const filtered = entries.filter(e =>
    e.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const viewProfile = async (roll: string) => {
    const { data: c } = await sb.from('contributors').select('*, departments(name,code)').eq('roll_number', roll).single();
    const { data: papers } = await sb.from('papers').select('exam_type,semester,term,year,status,subjects(name,course_code),teachers(name)').eq('roll_number', roll).order('created_at',{ascending:false});
    setProfile({ contributor: c, papers: papers ?? [] });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '6px' }}>Contributors Leaderboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Ranked by approved paper contributions.</p>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by roll number..."
        style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '280px', marginBottom: '20px' }} />

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Rank','Roll Number','Department','Approved Papers',''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f3f4f6' : 'none', background: Number(e.rank) <= 3 ? '#fffbeb' : 'white' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '16px' }}>
                  {Number(e.rank) === 1 ? '🥇' : Number(e.rank) === 2 ? '🥈' : Number(e.rank) === 3 ? '🥉' : '#' + e.rank}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '500', fontSize: '13px' }}>{e.roll_number}</td>
                <td style={{ padding: '12px 16px' }}>
                  {e.department_code ? <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{e.department_code}</span> : '—'}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '18px', color: '#16a34a' }}>{e.total_approved}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => viewProfile(e.roll_number)}
                    style={{ padding: '5px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                {search ? 'No contributor found.' : 'No contributors yet. Be the first!'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Modal */}
      {profile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0 4px', fontFamily: 'monospace' }}>{profile.contributor?.roll_number}</h2>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>{profile.contributor?.departments?.name}</p>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {[['Approved', profile.contributor?.total_approved, '#16a34a'],['Pending', profile.contributor?.total_pending, '#d97706'],['Rejected', profile.contributor?.total_rejected, '#dc2626']].map(([l,v,c]) => (
                <div key={l as string} style={{ flex: 1, background: '#f9fafb', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px' }}>{l as string}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.6rem', margin: 0, color: c as string }}>{v as number}</p>
                </div>
              ))}
            </div>
            <h3 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Upload History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Subject','Exam','Term/Year','Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.papers.map((p: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px' }}>{p.subjects?.name}<br/><span style={{ fontSize: '11px', color: '#9ca3af' }}>{p.subjects?.course_code}</span></td>
                    <td style={{ padding: '8px 12px' }}>{p.exam_type}</td>
                    <td style={{ padding: '8px 12px' }}>{p.term} {p.year}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: p.status==='Approved'?'#16a34a':p.status==='Pending'?'#d97706':'#dc2626', fontWeight: '500', fontSize: '12px' }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
