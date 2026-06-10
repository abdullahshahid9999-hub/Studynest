'use client';
import { useState, useEffect } from 'react';
import { parseRollNumber } from '@/lib/utils/rollNumber';

const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export function ContributeForm() {
  const [rollNumber, setRollNumber] = useState('');
  const [detectedDept, setDetectedDept] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('');
  const [semester, setSemester] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (rollNumber.length < 10) { setDetectedDept(''); setTeachers([]); return; }
    const parsed = parseRollNumber(rollNumber);
    if (!parsed.isValid) { setDetectedDept(''); return; }
    setDetectedDept(parsed.departmentName ?? parsed.departmentCode);
    fetch(`/api/teachers?department_code=${parsed.departmentCode}`)
      .then(r => r.json()).then(res => { if (res.success) setTeachers(res.data); }).catch(() => {});
  }, [rollNumber]);

  useEffect(() => {
    if (!teacherId) { setSubjects([]); return; }
    fetch(`/api/subjects?teacher_id=${teacherId}`)
      .then(r => r.json()).then(res => { if (res.success) setSubjects(res.data); }).catch(() => {});
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setMessage('Please select a file.'); setStatus('error'); return; }
    setStatus('loading');
    const fd = new FormData();
    fd.append('roll_number', rollNumber); fd.append('teacher_id', teacherId);
    fd.append('subject_id', subjectId); fd.append('exam_type', examType);
    fd.append('semester', semester); fd.append('term', term);
    fd.append('year', String(year)); fd.append('file', file);
    fd.append('recaptcha_token', 'public-submit');
    const res = await fetch('/api/contribute', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.success) { setStatus('success'); setMessage(json.message); }
    else { setStatus('error'); setMessage(json.error); }
  };

  const inp = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
  const sel = { ...inp };
  const lbl = { display: 'block', fontSize: '13px', fontWeight: '500' as const, marginBottom: '4px' };

  if (status === 'success') return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <p style={{ fontSize: '3rem' }}>✅</p>
      <h2 style={{ fontWeight: 'bold' }}>Submitted Successfully!</h2>
      <p style={{ color: '#64748b' }}>{message}</p>
      <button onClick={() => setStatus('idle')} style={{ padding: '10px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '16px' }}>Submit Another</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={lbl}>Roll Number *</label>
        <input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. 25-NTU-CS-FL-1124" required style={inp} />
        {detectedDept && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>✓ Department: {detectedDept}</p>}
      </div>
      <div>
        <label style={lbl}>Teacher *</label>
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required style={sel} disabled={!detectedDept}>
          <option value="">{!detectedDept ? 'Enter roll number first' : 'Select teacher'}</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label style={lbl}>Subject *</label>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required style={sel} disabled={!teacherId}>
          <option value="">{!teacherId ? 'Select teacher first' : 'Select subject'}</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.course_code} — {s.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={lbl}>Exam Type *</label>
          <select value={examType} onChange={e => setExamType(e.target.value)} required style={sel}>
            <option value="">Select</option>
            <option value="Mid">Mid</option>
            <option value="Final">Final</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Semester *</label>
          <select value={semester} onChange={e => setSemester(e.target.value)} required style={sel}>
            <option value="">Select</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Term *</label>
          <select value={term} onChange={e => setTerm(e.target.value)} required style={sel}>
            <option value="">Select</option>
            <option value="Spring">Spring</option>
            <option value="Fall">Fall</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Year *</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={sel}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={lbl}>Paper File * (PDF, JPG, PNG, DOCX — max 20MB)</label>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={e => setFile(e.target.files?.[0] ?? null)} required style={{ ...inp, padding: '6px' }} />
      </div>
      {status === 'error' && <p style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '10px', borderRadius: '6px' }}>{message}</p>}
      <button type="submit" disabled={status === 'loading'} style={{ padding: '12px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
        {status === 'loading' ? 'Submitting...' : 'Submit Paper'}
      </button>
    </form>
  );
}
