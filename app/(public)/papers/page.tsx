'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

const DEPT_MAP: Record<string,string> = {
  CS:'Computer Science', TE:'Textile Engineering', ME:'Mechanical Engineering',
  MS:'Management Sciences', EE:'Electrical Engineering',
  CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPT_MAP[m[1]] ?? m[1] } : null;
}

export default function PapersPage() {
  const [roll, setRoll]           = useState('');
  const [dept, setDept]           = useState<any>(null);
  const [deptId, setDeptId]       = useState('');
  const [teachers, setTeachers]   = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subjects, setSubjects]   = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [papers, setPapers]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [viewer, setViewer]       = useState<{url:string;paper:any;type:string}|null>(null);
  const [busy, setBusy]           = useState<string|null>(null);
  const [step, setStep]           = useState<1|2|3|4>(1);

  const handleRoll = async () => {
    const parsed = parseRoll(roll);
    if (!parsed) return;
    setDept(parsed);
    setTeacherId(''); setSubjectId(''); setPapers([]); setSearched(false);

    const { data: dRow } = await sb.from('departments').select('id').eq('code', parsed.code).eq('is_active', true).single();
    if (!dRow) return;
    setDeptId(dRow.id);

    const { data: t } = await sb.from('teachers').select('id,name').eq('department_id', dRow.id).eq('is_active', true).order('name');
    setTeachers(t ?? []);
    setStep(2);
  };

  const handleTeacher = async (tid: string, tname: string) => {
    setTeacherId(tid); setTeacherName(tname);
    setSubjectId(''); setPapers([]); setSearched(false);
    const { data: s } = await sb.from('subjects').select('id,name,course_code').eq('teacher_id', tid).eq('is_active', true).order('name');
    setSubjects(s ?? []);
    setStep(3);
  };

  const handleSubject = async (sid: string, sname: string) => {
    setSubjectId(sid); setSubjectName(sname);
    setLoading(true); setSearched(true);
    const { data } = await sb.from('papers')
      .select('id, exam_type, semester, term, year, file_path, file_type, subjects(name,course_code), teachers(name)')
      .eq('status', 'Approved').eq('subject_id', sid)
      .order('year', { ascending: false });
    setPapers(data ?? []);
    setLoading(false);
    setStep(4);
  };

  const reset = () => {
    setRoll(''); setDept(null); setDeptId(''); setTeachers([]); setTeacherId(''); setTeacherName('');
    setSubjects([]); setSubjectId(''); setSubjectName(''); setPapers([]); setSearched(false); setStep(1);
  };

  // View: get signed URL then open in fullscreen viewer
  const handleView = async (paper: any) => {
    setBusy(paper.id);
    try {
      const res = await fetch(`/api/papers/signed?id=${paper.id}`);
      const json = await res.json();
      if (json.url) {
        setViewer({ url: json.url, paper, type: paper.file_type ?? 'application/pdf' });
      } else {
        alert('Could not load this paper. The file may have been moved. Please contact admin.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setBusy(null);
  };

  // Download: direct link, browser handles it
  const handleDownload = (paper: any) => {
    const a = document.createElement('a');
    a.href = `/api/papers/signed?id=${paper.id}&action=download`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const inp: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8,
    fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>Past Papers</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Enter your roll number to find papers for your department.</p>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {[['1','Roll Number'],['2','Teacher'],['3','Subject'],['4','Papers']].map(([num, label], i) => {
          const n = parseInt(num);
          const active = step === n;
          const done = step > n;
          return (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: done ? '#059669' : active ? '#111' : '#e8e8e8',
                  color: (done || active) ? '#fff' : '#999' }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#111' : done ? '#059669' : '#aaa' }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 1, background: '#e0e0e0' }} />}
            </div>
          );
        })}
        {step > 1 && (
          <button onClick={reset} style={{ marginLeft: 'auto', padding: '5px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, color: '#888', background: 'transparent', cursor: 'pointer' }}>
            Start Over
          </button>
        )}
      </div>

      {/* Step 1: Roll Number */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Your Roll Number</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={roll} onChange={e => { setRoll(e.target.value); }} onKeyDown={e => e.key === 'Enter' && parseRoll(roll) && handleRoll()}
            placeholder="25-NTU-CS-FL-1124" style={inp}
            onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          <button onClick={handleRoll} disabled={!parseRoll(roll)}
            style={{ padding: '10px 20px', background: parseRoll(roll) ? '#111' : '#e8e8e8', color: parseRoll(roll) ? '#fff' : '#aaa', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: parseRoll(roll) ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
            Find Papers
          </button>
        </div>
        {dept && <p style={{ fontSize: 12, color: '#059669', marginTop: 6, fontWeight: 500 }}>✓ {dept.code} — {dept.name}</p>}
        {roll.length > 8 && !parseRoll(roll) && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>Invalid format. Example: 25-NTU-CS-FL-1124</p>}
      </div>

      {/* Step 2: Teacher chips */}
      {step >= 2 && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>Select Teacher</label>
          {teachers.length === 0 ? (
            <p style={{ fontSize: 13, color: '#aaa' }}>No teachers found for your department.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {teachers.map(t => (
                <button key={t.id} onClick={() => handleTeacher(t.id, t.name)}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: teacherId === t.id ? 600 : 400,
                    background: teacherId === t.id ? '#111' : '#f5f5f5',
                    color: teacherId === t.id ? '#fff' : '#333',
                    border: teacherId === t.id ? '1px solid #111' : '1px solid #e0e0e0',
                    transition: 'all 0.15s' }}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Subject chips */}
      {step >= 3 && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>Select Subject</label>
          {subjects.length === 0 ? (
            <p style={{ fontSize: 13, color: '#aaa' }}>No subjects found for this teacher.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subjects.map(s => (
                <button key={s.id} onClick={() => handleSubject(s.id, s.name)}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: subjectId === s.id ? 600 : 400,
                    background: subjectId === s.id ? '#111' : '#f5f5f5',
                    color: subjectId === s.id ? '#fff' : '#333',
                    border: subjectId === s.id ? '1px solid #111' : '1px solid #e0e0e0',
                    transition: 'all 0.15s' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.6, marginRight: 6 }}>{s.course_code}</span>{s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Papers grid */}
      {searched && (
        loading ? (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 32, textAlign: 'center', color: '#aaa', fontSize: 14 }}>Loading…</div>
        ) : papers.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <p style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>No papers found</p>
            <p style={{ fontSize: 13, color: '#999' }}>No approved papers for <b>{subjectName}</b> yet.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              <b style={{ color: '#111' }}>{papers.length}</b> paper{papers.length !== 1 ? 's' : ''} for <b style={{ color: '#111' }}>{subjectName}</b> by <b style={{ color: '#111' }}>{teacherName}</b>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
              {papers.map((p: any) => (
                <div key={p.id}
                  style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s,border-color 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'; el.style.borderColor = '#ccc'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e8e8e8'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{p.subjects?.name}</div>
                      <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{p.subjects?.course_code}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                      background: p.exam_type === 'Final' ? '#e8f0fe' : '#fef9e7',
                      color: p.exam_type === 'Final' ? '#1a56db' : '#92400e' }}>
                      {p.exam_type}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 14, flex: 1 }}>
                    Sem {p.semester} · {p.term} {p.year}
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f5f5f5' }}>
                    <button onClick={() => handleView(p)} disabled={busy === p.id}
                      style={{ flex: 1, padding: '8px', background: busy === p.id ? '#555' : '#111', color: '#fff', border: 'none', borderRadius: 7, cursor: busy === p.id ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {busy === p.id ? 'Loading…' : 'View'}
                    </button>
                    <button onClick={() => handleDownload(p)}
                      style={{ flex: 1, padding: '8px', background: '#f5f5f5', color: '#333', border: '1px solid #e0e0e0', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* FULLSCREEN VIEWER - fits screen properly */}
      {viewer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ background: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #e8e8e8', gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {viewer.paper.subjects?.name}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {viewer.paper.subjects?.course_code} · {viewer.paper.exam_type} · Sem {viewer.paper.semester} · {viewer.paper.term} {viewer.paper.year}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleDownload(viewer.paper)}
                style={{ padding: '7px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                ⬇ Download
              </button>
              <button onClick={() => setViewer(null)}
                style={{ width: 34, height: 34, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✕
              </button>
            </div>
          </div>

          {/* Viewer area - full remaining space */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10, transform: 'rotate(-25deg)' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.06)', letterSpacing: 4, userSelect: 'none', whiteSpace: 'nowrap' }}>
                NTU PAST PAPERS ARCHIVE
              </span>
            </div>

            {/* Image files - show as img tag, fits perfectly */}
            {(viewer.type.includes('image') || viewer.url.match(/\.(jpg|jpeg|png)(\?|$)/i)) ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', background: '#111' }}>
                <img
                  src={viewer.url}
                  alt="Paper"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            ) : (
              /* PDF - full width/height iframe */
              <iframe
                src={viewer.url}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="Paper Viewer"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
