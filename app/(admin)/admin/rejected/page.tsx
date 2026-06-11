'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function RejectedPage() {
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    sb.from('papers').select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status', 'Rejected').order('created_at', { ascending: false })
      .then(({ data }) => setPapers(data ?? []));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Rejected Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{papers.length} rejected papers</p>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Subject','Teacher','Exam','Term/Year','Roll No','Reason','Rejected On'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < papers.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{p.subjects?.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.subjects?.course_code}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.teachers?.name}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.exam_type}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.term} {p.year}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>{p.roll_number}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#dc2626' }}>{p.admin_note || '—'}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>{new Date(p.reviewed_at ?? p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {papers.length === 0 && <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No rejected papers.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
