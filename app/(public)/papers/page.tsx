'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

const S: Record<string, React.CSSProperties> = {
  select: {
    padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#333', outline: 'none',
    cursor: 'pointer', minWidth: 120,
  },
  searchBox: {
    padding: '9px 14px 9px 36px', border: '1px solid #e0e0e0',
    borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
    width: '100%', color: '#333',
  },
  card: {
    background: '#fff', border: '1px solid #e8e8e8',
    borderRadius: 12, padding: 20,
    display: 'flex', flexDirection: 'column' as const,
    transition: 'box-shadow 0.15s, border-color 0.15s',
  },
  tag: {
    display: 'inline-block', padding: '2px 9px',
    borderRadius: 999, fontSize: 11, fontWeight: 600,
  },
  btn: {
    flex: 1, padding: '8px 0', borderRadius: 8,
    fontSize: 13, fontWeight: 600, border: 'none',
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
};

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [exam, setExam] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [sem, setSem] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const load = async () => {
    setLoading(true);
    let q = sb.from('v_papers_public').select('*').order('year', { ascending: false });
    if (dept) q = q.eq('department_id', dept);
    if (exam) q = q.eq('exam_type', exam);
    if (term) q = q.eq('term', term);
    if (year) q = q.eq('year', parseInt(year));
    if (sem) q = q.eq('semester', sem);
    if (search.trim()) q = q.or(`subject_name.ilike.%${search}%,teacher_name.ilike.%${search}%,course_code.ilike.%${search}%`);
    const { data } = await q.limit(120);
    setPapers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    sb.from('departments').select('id,name,code').eq('is_active', true).order('name')
      .then(({ data }) => setDepts(data ?? []));
  }, []);

  useEffect(() => { load(); }, [dept, exam, term, year, sem]);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>Past Papers</h1>
        <p style={{ fontSize: 14, color: '#888' }}>
          {loading ? 'Loading…' : `${papers.length} paper${papers.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', border: '1px solid #e8e8e8',
        borderRadius: 12, padding: '16px 20px',
        marginBottom: 24,
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa' }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search subject, teacher, code…"
            style={S.searchBox}
          />
        </div>

        {/* Dropdowns */}
        <select value={dept} onChange={e => setDept(e.target.value)} style={S.select}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>

        <select value={exam} onChange={e => setExam(e.target.value)} style={S.select}>
          <option value="">All Types</option>
          <option value="Mid">Mid</option>
          <option value="Final">Final</option>
        </select>

        <select value={term} onChange={e => setTerm(e.target.value)} style={S.select}>
          <option value="">All Terms</option>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>

        <select value={sem} onChange={e => setSem(e.target.value)} style={S.select}>
          <option value="">All Sems</option>
          {['1','2','3','4','5','6','7','8'].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)} style={S.select}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <button onClick={load} style={{
          padding: '8px 18px', background: '#111', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Search</button>

        {(search || dept || exam || term || year || sem) && (
          <button onClick={() => { setSearch(''); setDept(''); setExam(''); setTerm(''); setYear(''); setSem(''); }}
            style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, height: 180 }}>
              {[70, 40, 55, 45].map((w, j) => (
                <div key={j} style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>No papers found</p>
          <p style={{ fontSize: 13, color: '#999' }}>Try different filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {papers.map(p => (
            <div key={p.id}
              style={S.card}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#ccc';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8e8';
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 3, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.subject_name}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{p.course_code}</div>
                </div>
                <span style={{
                  ...S.tag,
                  background: p.exam_type === 'Final' ? '#e8f0fe' : '#fef8e7',
                  color: p.exam_type === 'Final' ? '#1a56db' : '#92400e',
                  flexShrink: 0,
                }}>
                  {p.exam_type}
                </span>
              </div>

              {/* Details */}
              <div style={{ flex: 1, marginBottom: 14 }}>
                {[
                  { label: 'Dept', val: p.department_name },
                  { label: 'Teacher', val: p.teacher_name },
                  { label: 'Term', val: `Sem ${p.semester} · ${p.term} ${p.year}` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', gap: 6, marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: '#aaa', width: 50, flexShrink: 0, fontSize: 12 }}>{label}</span>
                    <span style={{ color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                <button
                  onClick={() => setPreview(p)}
                  style={{ ...S.btn, background: '#111', color: '#fff' }}
                >
                  View
                </button>
                <a href={p.file_url} download target="_blank" rel="noopener noreferrer"
                  style={{ ...S.btn, background: '#f5f5f5', color: '#333', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}
          >
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.subject_name}</span>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>
                {preview.course_code} · {preview.exam_type} · {preview.term} {preview.year}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <a href={preview.file_url} download target="_blank" rel="noopener noreferrer"
                style={{ padding: '7px 16px', background: '#111', color: '#fff', borderRadius: 7, fontSize: 13, fontWeight: 600 }}>
                Download
              </a>
              <button onClick={() => setPreview(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: 7, width: 34, height: 34, fontSize: 18, cursor: 'pointer', color: '#555' }}>
                ✕
              </button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', zIndex: 1, transform: 'rotate(-20deg)',
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'rgba(0,0,0,0.04)', letterSpacing: 3, userSelect: 'none', whiteSpace: 'nowrap' }}>
                NTU PAST PAPERS
              </span>
            </div>
            <iframe src={preview.file_url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}
