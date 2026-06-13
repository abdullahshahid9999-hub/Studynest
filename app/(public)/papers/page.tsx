'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

// Use service key client to generate signed URLs - this bypasses bucket privacy
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

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
  const [preview, setPreview] = useState<{url: string, paper: any} | null>(null);
  const [signedLoading, setSignedLoading] = useState<string | null>(null);
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

  // Get a working URL for the paper - try file_url first, then signed URL
  const getWorkingUrl = async (paper: any): Promise<string> => {
    // If file_url looks correct (supabase storage), try it first
    if (paper.file_url && paper.file_url.includes('supabase.co/storage')) {
      return paper.file_url;
    }

    // Otherwise generate a fresh signed URL from file_path
    // We need file_path - fetch from papers table
    const { data: p } = await sb.from('papers').select('file_path').eq('id', paper.id).single();
    if (!p?.file_path) return '';

    // Try public URL first
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${p.file_path}`;

    // Generate signed URL as fallback (works with private bucket)
    const { data: signed } = await sb.storage.from('papers').createSignedUrl(p.file_path, 3600);
    
    // Update the file_url in DB so future loads are faster
    if (signed?.signedUrl) {
      // Don't await - background update
      sb.from('papers').update({ file_url: publicUrl }).eq('id', paper.id);
    }

    return signed?.signedUrl ?? publicUrl;
  };

  const handleView = async (paper: any) => {
    setSignedLoading(paper.id);
    const url = await getWorkingUrl(paper);
    setSignedLoading(null);
    if (url) setPreview({ url, paper });
    else alert('Could not load this paper. Please try again.');
  };

  const handleDownload = async (paper: any) => {
    setSignedLoading(paper.id + '_dl');
    const url = await getWorkingUrl(paper);
    setSignedLoading(null);
    if (!url) { alert('Could not get download link.'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.course_code}_${paper.exam_type}_${paper.term}${paper.year}`;
    a.target = '_blank';
    a.click();
  };

  const S: Record<string, React.CSSProperties> = {
    select: { padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff', color: '#333', outline: 'none', cursor: 'pointer' },
    card: { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s, border-color 0.15s' },
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>Past Papers</h1>
        <p style={{ fontSize: 14, color: '#888' }}>
          {loading ? 'Loading…' : `${papers.length} paper${papers.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 16 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search subject, teacher, code…"
            style={{ padding: '8px 12px 8px 32px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', color: '#333' }} />
        </div>
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
        <button onClick={load} style={{ padding: '8px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Search</button>
        {(search || dept || exam || term || year || sem) && (
          <button onClick={() => { setSearch(''); setDept(''); setExam(''); setTerm(''); setYear(''); setSem(''); }}
            style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, height: 200 }}>
              {[70,40,55,45].map((w,j) => <div key={j} style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, width: `${w}%` }} />)}
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
            <div key={p.id} style={S.card}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.borderColor = '#ccc'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e8e8e8'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subject_name}</div>
                  <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{p.course_code}</div>
                </div>
                <span style={{ flexShrink: 0, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.exam_type === 'Final' ? '#e8f0fe' : '#fef9e7', color: p.exam_type === 'Final' ? '#1a56db' : '#92400e' }}>
                  {p.exam_type}
                </span>
              </div>
              <div style={{ flex: 1, marginBottom: 14 }}>
                {[['Dept', p.department_name], ['Teacher', p.teacher_name], ['Term', `Sem ${p.semester} · ${p.term} ${p.year}`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 6, marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: '#bbb', width: 48, flexShrink: 0, fontSize: 12 }}>{l}</span>
                    <span style={{ color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f5f5f5', paddingTop: 14 }}>
                <button onClick={() => handleView(p)} disabled={signedLoading === p.id}
                  style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: signedLoading === p.id ? 0.6 : 1 }}>
                  {signedLoading === p.id ? '…' : 'View'}
                </button>
                <button onClick={() => handleDownload(p)} disabled={signedLoading === p.id + '_dl'}
                  style={{ flex: 1, padding: '8px', background: '#f5f5f5', color: '#333', border: '1px solid #e8e8e8', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: signedLoading === p.id + '_dl' ? 0.6 : 1 }}>
                  {signedLoading === p.id + '_dl' ? '…' : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.paper.subject_name}</span>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>{preview.paper.course_code} · {preview.paper.exam_type} · {preview.paper.term} {preview.paper.year}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(preview.paper)}
                style={{ padding: '7px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Download
              </button>
              <button onClick={() => setPreview(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: 7, width: 34, height: 34, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, transform: 'rotate(-20deg)' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(0,0,0,0.04)', letterSpacing: 3, userSelect: 'none', whiteSpace: 'nowrap' }}>NTU PAST PAPERS</span>
            </div>
            <iframe src={preview.url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} title="Paper" />
          </div>
        </div>
      )}
    </div>
  );
}
