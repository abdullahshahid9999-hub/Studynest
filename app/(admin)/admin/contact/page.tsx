'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

const EMPTY = { name: '', section: '', semester: '', department: '', availability: '', display_order: 0, is_active: true };

export default function ContactPage() {
  // Contact settings (single row, id = 1)
  const [email, setEmail] = useState('');
  const [intro, setIntro] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Campus meeting points
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState({ text: '', ok: true });

  const load = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      sb.from('contact_settings').select('*').eq('id', 1).maybeSingle(),
      sb.from('meeting_contacts').select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);
    if (s) { setEmail(s.contact_email ?? ''); setIntro(s.intro ?? ''); }
    setContacts(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 2800);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const { error } = await sb.from('contact_settings')
      .upsert({ id: 1, contact_email: email.trim() || null, intro: intro.trim() || null, is_active: true }, { onConflict: 'id' });
    if (error) flash(error.message, false); else flash('Contact settings saved!');
    setSavingSettings(false);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); };

  const saveContact = async () => {
    if (!form.name.trim()) { flash('Name is required.', false); return; }
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      section: form.section.trim() || null,
      semester: form.semester.trim() || null,
      department: form.department.trim() || null,
      availability: form.availability.trim() || null,
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };
    if (editId) {
      const { error } = await sb.from('meeting_contacts').update(payload).eq('id', editId);
      if (error) flash(error.message, false); else { flash('Meeting point updated!'); resetForm(); await load(); }
    } else {
      const { error } = await sb.from('meeting_contacts').insert(payload);
      if (error) flash(error.message, false); else { flash('Meeting point added!'); resetForm(); await load(); }
    }
    setLoading(false);
  };

  const editContact = (c: any) => {
    setEditId(c.id);
    setForm({
      name: c.name ?? '', section: c.section ?? '', semester: c.semester ?? '',
      department: c.department ?? '', availability: c.availability ?? '',
      display_order: c.display_order ?? 0, is_active: c.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (c: any) => {
    await sb.from('meeting_contacts').update({ is_active: !c.is_active }).eq('id', c.id);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('Remove this meeting point from the public Contact Us section?')) return;
    const { error } = await sb.from('meeting_contacts').delete().eq('id', id);
    if (error) flash(error.message, false);
    else { flash('Removed.'); if (editId === id) resetForm(); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 };
  const focus = (e: any) => (e.target.style.borderColor = '#111');
  const blur = (e: any) => (e.target.style.borderColor = '#e0e0e0');

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>Contact Us</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Manage the contact email and campus meeting points shown at the bottom of the public
        <a href="/about" target="_blank" rel="noopener noreferrer" style={{ color: '#3b5bdb', textDecoration: 'none', fontWeight: 600 }}> About&nbsp;Us</a> page.
      </p>

      {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 14, fontWeight: 500 }}>{msg.text}</p>}

      {/* Contact settings */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16 }}>Contact Details</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Contact email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="team@studynest.com" style={inp} onFocus={focus} onBlur={blur} />
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 5 }}>Shown as a “mail us” button for collaboration / ideas.</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Intro message (optional)</label>
          <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={2}
            placeholder="Want to collaborate, contribute, or share an idea? We'd love to hear from you." style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
        </div>
        <button onClick={saveSettings} disabled={savingSettings}
          style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: savingSettings ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: savingSettings ? 0.7 : 1 }}>
          {savingSettings ? 'Saving…' : 'Save Contact Details'}
        </button>
      </div>

      {/* Meeting point form */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>{editId ? 'Edit Meeting Point' : 'Add Campus Meeting Point'}</h2>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>Where an NTU student can find a team member in person.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Abdullah Shahid" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Section</label>
            <input value={form.section} onChange={e => set('section', e.target.value)} placeholder="A" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Semester</label>
            <input value={form.semester} onChange={e => set('semester', e.target.value)} placeholder="6" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Display order</label>
            <input type="number" value={form.display_order} onChange={e => set('display_order', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Availability / where to find</label>
          <input value={form.availability} onChange={e => set('availability', e.target.value)} placeholder="e.g. CS Lab 3, after 2pm on weekdays" style={inp} onFocus={focus} onBlur={blur} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer', marginBottom: 14 }}>
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
          Visible on public site
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={saveContact} disabled={loading}
            style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : editId ? 'Update Meeting Point' : 'Add Meeting Point'}
          </button>
          {editId && (
            <button onClick={resetForm}
              style={{ padding: '9px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Meeting points list */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 700, color: '#111' }}>
          Meeting Points ({contacts.length})
        </div>
        {contacts.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No meeting points yet.</div>
        ) : contacts.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < contacts.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{c.name}</span>
                {!c.is_active && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 5 }}>HIDDEN</span>}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {[c.department, c.section && `Section ${c.section}`, c.semester && `Semester ${c.semester}`, c.availability].filter(Boolean).join(' · ') || '—'}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>#{c.display_order}</span>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => toggleActive(c)} style={{ padding: '5px 11px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{c.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => editContact(c)} style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
              <button onClick={() => del(c.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
