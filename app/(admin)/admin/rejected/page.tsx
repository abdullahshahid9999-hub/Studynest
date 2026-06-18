'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { watermarkPdfBytes } from '@/lib/utils/watermark';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

export default function RejectedPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<string|null>(null);
  const [msg, setMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);

  const load = async () => {
    const { data } = await sb.from('papers').select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status', 'Rejected').order('created_at', { ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const approvePaper = async (p: any) => {
    setLoadingAction(p.id); setMsg('');

    const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
    const newPath = p.file_path.startsWith('pending/')
      ? p.file_path.replace('pending/', 'approved/')
      : p.file_path;
    const isPdf = p.file_type === 'application/pdf' || p.file_path?.toLowerCase().endsWith('.pdf');

    // Stamp a StudyNest watermark onto PDFs, then place the file at approved/.
    try {
      if (isPdf) {
        const { data: file, error: dlErr } = await sb.storage.from('papers').download(p.file_path);
        if (dlErr || !file) throw dlErr ?? new Error('download failed');
        const stamped = await watermarkPdfBytes(await file.arrayBuffer());
        const { error: upErr } = await sb.storage.from('papers').upload(newPath, stamped, { contentType: 'application/pdf', upsert: true });
        if (upErr) throw upErr;
        if (p.file_path !== newPath) await sb.storage.from('papers').remove([p.file_path]);
      } else if (p.file_path !== newPath) {
        await sb.storage.from('papers').move(p.file_path, newPath);
      }
    } catch {
      if (p.file_path !== newPath) { try { await sb.storage.from('papers').move(p.file_path, newPath); } catch {} }
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${newPath}`;

    await sb.from('papers').update({
      status: 'Approved',
      file_path: newPath,
      file_url: publicUrl,
      reviewed_at: new Date().toISOString(),
    }).eq('id', p.id);

    setLoadingAction(null);
    setMsg(isPdf ? 'Approved — StudyNest watermark added!' : 'Paper successfully approved!');
    await load();
    setTimeout(() => setMsg(''), 3000);
  };

  const preview = async (p: any) => {
    const { data } = await sb.storage.from('papers').createSignedUrl(p.file_path, 120);
    setPreviewUrl(data?.signedUrl ?? null);
  };

  const deletePaper = async (p: any) => {
    if (!confirm('Are you sure you want to permanently delete this paper? This cannot be undone.')) return;
    setLoadingAction(p.id); setMsg('');
    
    if (p.file_path) {
      await sb.storage.from('papers').remove([p.file_path]);
    }
    await sb.from('papers').delete().eq('id', p.id);

    setLoadingAction(null);
    setMsg('Paper deleted permanently.');
    await load();
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Rejected Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{papers.length} rejected papers</p>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {msg}
        </div>
      )}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Subject','Teacher','Exam','Term/Year','Roll No','Reason','Rejected On','Actions'].map(h => (
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
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => preview(p)}
                      style={{ padding: '4px 10px', background: '#f5f5f5', color: '#444', border: '1px solid #e0e0e0', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      View
                    </button>
                    <button onClick={() => approvePaper(p)} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Approve
                    </button>
                    <button onClick={() => deletePaper(p)} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#111', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                      {loadingAction === p.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {papers.length === 0 && <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No rejected papers.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* File Preview modal */}
      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>File Preview</span>
            <button onClick={() => setPreviewUrl(null)}
              style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <iframe src={previewUrl} style={{ flex: 1, border: 'none' }} title="Preview" />
        </div>
      )}
    </div>
  );
}
