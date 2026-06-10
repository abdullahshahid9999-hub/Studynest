'use client';
import { useState } from 'react';

interface PaperPublic {
  id: string; exam_type: string; semester: string; term: string; year: number;
  file_url: string; file_name: string; department_name: string;
  teacher_name: string; subject_name: string; course_code: string;
}

export function PaperCard({ paper }: { paper: PaperPublic }) {
  const [showReport, setShowReport] = useState(false);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>{paper.subject_name}</h3>
        <span style={{ background: paper.exam_type === 'Final' ? '#1d4ed8' : '#64748b', color: 'white', padding: '2px 8px', borderRadius: '999px', fontSize: '12px' }}>{paper.exam_type}</span>
      </div>
      <p style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace', margin: '0 0 8px' }}>{paper.course_code}</p>
      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>
        <div>📚 {paper.department_name}</div>
        <div>👤 {paper.teacher_name}</div>
        <div>📅 Sem {paper.semester} · {paper.term} {paper.year}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
        <a href={paper.file_url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: '#1d4ed8', color: 'white', borderRadius: '6px', fontSize: '13px', textDecoration: 'none' }}>👁 View</a>
        <a href={paper.file_url} download style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', color: '#374151' }}>⬇ Download</a>
        <button onClick={() => setShowReport(true)} style={{ padding: '6px 12px', border: 'none', background: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>🚩 Report</button>
      </div>
      {showReport && (
        <div style={{ marginTop: '12px', padding: '12px', background: '#fef9c3', borderRadius: '6px', fontSize: '13px' }}>
          For corrections, ownership claims, or concerns regarding this paper, please contact the administration.
          <button onClick={() => setShowReport(false)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
      )}
    </div>
  );
}
