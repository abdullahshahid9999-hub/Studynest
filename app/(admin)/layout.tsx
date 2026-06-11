'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setAuthed(true);
      }
      setChecking(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#64748b' }}>Verifying access...</p>
      </div>
    </div>
  );

  if (!authed) return null;

  const navItems = [
    ['🏠', 'Dashboard', '/admin'],
    ['🏫', 'Departments', '/admin/departments'],
    ['👤', 'Teachers', '/admin/teachers'],
    ['📖', 'Subjects', '/admin/subjects'],
    ['⏳', 'Pending', '/admin/pending'],
    ['✅', 'Approved', '/admin/approved'],
    ['❌', 'Rejected', '/admin/rejected'],
    ['👥', 'Contributors', '/admin/contributors'],
    ['🏆', 'Leaderboard', '/admin/leaderboard'],
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '230px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>📚</div>
          <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: 'white' }}>NTU Archive</h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(([icon, label, href]) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <a key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
                color: active ? 'white' : '#94a3b8', textDecoration: 'none', fontSize: '13px',
                background: active ? '#1e40af' : 'transparent',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s'
              }}>
                <span>{icon}</span>{label}
              </a>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <a href="/papers" style={{ display: 'block', color: '#64748b', fontSize: '12px', textDecoration: 'none', marginBottom: '10px' }}>
            ← Public Site
          </a>
          <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
