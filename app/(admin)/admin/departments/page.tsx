'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await sb.from('departments').select('*').order('name');
    setDepts(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 2500);
  };

  const save = async () => {
    if (!name.trim() || !code.trim()) { flash('Name and code required.', false); return; }
    setLoading(true);
    if (editId) {
      const { error } = await sb.from('departments').update({ name: name.trim(), code: code.trim().toUpperCase() }).eq('id', editId);
      if (error) { flash(error.message, false); } else { flash('Updated!'); setName(''); setCode(''); setEditId(null); await load(); }
    } else {
      const { error } = await sb.from('departments').insert({ name: name.trim(), code: code.trim().toUpperCase() });
      if (error) { flash(error.message, false); } else { flash('Added!'); setName(''); setCode(''); await load(); }
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this department? This may fail if teachers are linked.')) return;
    const { error } = await sb.from('departments').delete().eq('id', id);
    if (error) flash('Cannot delete — teachers are linked to this department.', false);
    else { flash('Deleted.'); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111' };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 24 }}>Departments</h1>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 14 }}>
          {editId ? 'Edit Department' : 'Add Department'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Department Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Code *</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="CS" style={inp}
              onFocus={e => (e.target.style.borderColor = '#111')} onBlur={e => (e.target.style.borderColor = '#e0e0e0')} />
          </div>
        </div>
        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 10 }}>{msg.text}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '8px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'Saving…' : editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setName(''); setCode(''); }}
              style={{ padding: '8px 14px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Name','Code','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depts.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < depts.length-1 ? '1px solid #f5f5f5' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 14 }}>{d.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f0f4ff', color: '#3b5bdb', padding: '2px 9px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>{d.code}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, color: d.is_active ? '#059669' : '#dc2626', fontWeight: 500 }}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditId(d.id); setName(d.name); setCode(d.code); }}
                      style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
                    <button onClick={() => del(d.id)}
                      style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {depts.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
