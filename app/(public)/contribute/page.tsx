'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

const DEPTS: Record<string,string> = {
  CS:'Computer Science', TE:'Textile Engineering', ME:'Mechanical Engineering',
  MS:'Management Sciences', EE:'Electrical Engineering', CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function parseDept(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPTS[m[1]] ?? m[1] } : null;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #e0e0e0', borderRadius: 8,
  fontSize: 14, color: '#111', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export default function ContributePage() {
  const [roll, setRoll] = useState('');
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('');
  const [semester, setSemester] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState<File|null>(null);
  const [fileErr, setFileErr] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const p = parseDept(roll);
    if (!p) { setDept(null); setTeachers([]); setTeacherId(''); setSubjects([]); setSubjectId(''); return; }
    setDept(p);
    sb.from('departments').select('id').eq('code', p.code).eq('is_active', true).single()
      .then(({ data: d }) => {
        if (!d) return;
        sb.from('teachers').select('id,name').eq('department_id', d.id).eq('is_active', true).order('name')
          .then(({ data }) => { setTeachers(data ?? []); setTeacherId(''); setSubjects([]); setSubjectId(''); });
      });
  }, [roll]);

  useEffect(() => {
    if (!teacherId) { setSubjects([]); setSubjectId(''); return; }
    sb.from('subjects').select('id,name,course_code').eq('teacher_id', teacherId).eq('is_active', true).order('name')
      .then(({ data }) => { setSubjects(data ?? []); setSubjectId(''); });
  }, [teacherId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; setFileErr('');
    if (!f) return;
    const ok = ['application/pdf','image/jpeg','image/jpg','image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(f.type)) { setFileErr('Allowed: PDF, JPG, PNG, DOCX'); return; }
    if (f.size > 20*1024*1024) { setFileErr('Max 20MB'); return; }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileErr('Select a file'); return; }
    setStatus('loading');
    const fd = new FormData();
    fd.append('roll_number', roll.trim().toUpperCase());
    fd.append('teacher_id', teacherId); fd.append('subject_id', subjectId);
    fd.append('exam_type', examType); fd.append('semester', semester);
    fd.append('term', term); fd.append('year', String(year));
    fd.append('file', file); fd.append('recaptcha_token', 'bypass');
    const res = await fetch('/api/contribute', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.success) { setStatus('success'); setMsg(json.message); }
    else { setStatus('error'); setMsg(json.error); }
  };

  if (status === 'success') return (
    <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Submitted!</h2>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>{msg}</p>
      <button
        onClick={() => { setStatus('idle'); setRoll(''); setFile(null); setTeacherId(''); setSubjectId(''); setExamType(''); setSemester(''); setTerm(''); }}
        style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        Submit Another
      </button>
    </div>
  );

  const lbl = (text: string, req = false) => (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 5 }}>
      {text}{req && <span style={{ color: '#e02424', marginLeft: 2 }}>*</span>}
    </label>
  );

  const CY = new Date().getFullYear();
  const YEARS = Array.from({ length: 10 }, (_, i) => CY - i);

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Contribute a Paper</h1>
      <p style={{ fontSize: 14, color: '#777', marginBottom: 28 }}>
        Share past papers with NTU students. Reviewed by admin before going live.
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Roll number */}
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            {lbl('Roll Number', true)}
            <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="25-NTU-CS-FL-1124" required style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
            {dept && <p style={{ fontSize: 12, color: '#059669', marginTop: 5 }}>✓ {dept.code} — {dept.name}</p>}
            {roll.length > 8 && !dept && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 5 }}>Invalid format</p>}
          </div>
        </div>

        {/* Paper info */}
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              {lbl('Teacher', true)}
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required disabled={!dept} style={{ ...inp, cursor: dept ? 'pointer' : 'default', opacity: dept ? 1 : 0.5 }}>
                <option value="">{!dept ? 'Enter roll number first' : teachers.length === 0 ? 'No teachers found' : 'Select teacher'}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              {lbl('Subject', true)}
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!teacherId} style={{ ...inp, cursor: teacherId ? 'pointer' : 'default', opacity: teacherId ? 1 : 0.5 }}>
                <option value="">{!teacherId ? 'Select teacher first' : 'Select subject'}</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.course_code} — {s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Exam Type', val: examType, set: setExamType, opts: [['Mid','Mid Term'],['Final','Final Term']] },
                { label: 'Semester', val: semester, set: setSemester, opts: ['1','2','3','4','5','6','7','8'].map(s => [s, `Sem ${s}`]) },
                { label: 'Term', val: term, set: setTerm, opts: [['Spring','Spring'],['Fall','Fall']] },
                { label: 'Year', val: String(year), set: (v: string) => setYear(parseInt(v)), opts: YEARS.map(y => [String(y), String(y)]) },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  {lbl(label, true)}
                  <select value={val} onChange={e => (set as any)(e.target.value)} required style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Select</option>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File */}
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20 }}>
          {lbl('File', true)}
          <div
            onClick={() => document.getElementById('fi')?.click()}
            style={{
              border: `2px dashed ${file ? '#059669' : '#d0d0d0'}`,
              borderRadius: 10, padding: '24px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: file ? '#f0fdf4' : '#fafafa',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? '📄' : '📁'}</div>
            {file
              ? <><p style={{ fontWeight: 600, color: '#059669', marginBottom: 2 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: '#666' }}>{(file.size/1024/1024).toFixed(1)} MB · Click to change</p></>
              : <><p style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Click to select file</p>
                  <p style={{ fontSize: 12, color: '#999' }}>PDF, JPG, PNG, DOCX · Max 20MB</p></>
            }
            <input id="fi" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          {fileErr && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>{fileErr}</p>}
        </div>

        {status === 'error' && msg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', color: '#dc2626', fontSize: 13 }}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={status === 'loading'} style={{
          padding: '12px', background: status === 'loading' ? '#888' : '#111',
          color: '#fff', border: 'none', borderRadius: 8,
          fontSize: 15, fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}>
          {status === 'loading' ? 'Submitting…' : 'Submit Paper'}
        </button>
      </form>
    </div>
  );
}
