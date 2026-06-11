'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [preview, setPreview] = useState<any>(null);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const load = async () => {
    setLoading(true);
    let q = sb.from('v_papers_public').select('*').order('year', { ascending: false });
    if (filterDept) q = q.eq('department_id', filterDept);
    if (filterExam) q = q.eq('exam_type', filterExam);
    if (filterTerm) q = q.eq('term', filterTerm);
    if (filterYear) q = q.eq('year', parseInt(filterYear));
    if (search) q = q.or(`subject_name.ilike.%${search}%,teacher_name.ilike.%${search}%,course_code.ilike.%${search}%`);
    const { data } = await q.limit(100);
    setPapers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    sb.from('departments').select('id,name,code').eq('is_active',true).order('name').then(({ data }) => setDepts(data ?? []));
  }, []);

  useEffect(() => { load(); }, [filterDept, filterExam, filterTerm, filterYear]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  const inp = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: 'white' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>Past Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{papers.length} papers available</p>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject, teacher, code..." style={{ ...inp, minWidth: '220px', flex: 1 }} />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={inp}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
        </select>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)} style={inp}>
          <option value="">All Exam Types</option>
          <option value="Mid">Mid</option>
          <option value="Final">Final</option>
        </select>
        <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)} style={inp}>
          <option value="">All Terms</option>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={inp}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit" style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Search</button>
        <button type="button" onClick={() => { setSearch(''); setFilterDept(''); setFilterExam(''); setFilterTerm(''); setFilterYear(''); }}
          style={{ padding: '8px 14px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Clear</button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading papers...</div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No papers found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {papers.map(p => (
            <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '14px', margin: 0, flex: 1, lineHeight: '1.4' }}>{p.subject_name}</h3>
                <span style={{ background: p.exam_type === 'Final' ? '#dbeafe' : '#f3f4f6', color: p.exam_type === 'Final' ? '#1e40af' : '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginLeft: '8px', flexShrink: 0 }}>{p.exam_type}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 10px' }}>{p.course_code}</p>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.9', flex: 1 }}>
                <div>🏫 {p.department_name}</div>
                <div>👤 {p.teacher_name}</div>
                <div>📅 Sem {p.semester} · {p.term} {p.year}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={() => setPreview(p)}
                  style={{ flex: 1, padding: '7px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  View
                </button>
                <a href={p.file_url} download target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, padding: '7px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', textDecoration: 'none', color: '#374151', textAlign: 'center' }}>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{preview.subject_name}</span>
              <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '12px' }}>{preview.exam_type} · {preview.term} {preview.year}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href={preview.file_url} download target="_blank" rel="noopener noreferrer"
                style={{ padding: '6px 14px', background: '#1d4ed8', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }}>Download</a>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#374151' }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10, transform: 'rotate(-30deg)' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.06)', userSelect: 'none', whiteSpace: 'nowrap' }}>NTU Past Papers Archive</span>
            </div>
            <iframe src={preview.file_url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} title="Paper Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
