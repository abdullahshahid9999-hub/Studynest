'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dvtkcuqwvkakycsseydh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70'
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.replace('/login');
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  const navItems = [
    ['🏠', 'Dashboard',    '/admin'],
    ['🏫', 'Departments',  '/admin/departments'],
    ['👤', 'Teachers',     '/admin/teachers'],
    ['📖', 'Subjects',     '/admin/subjects'],
    ['⏳', 'Pending',      '/admin/pending'],
    ['✅', 'Approved',     '/admin/approved'],
    ['❌', 'Rejected',     '/admin/rejected'],
    ['👥', 'Contributors', '/admin/contributors'],
    ['🏆', 'Leaderboard',  '/admin/leaderboard'],
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '230px', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px', color: 'white' }}>NTU Archive</h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(([icon, label, href]) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href as string));
            return (
              <a key={href as string} href={href as string} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
                color: active ? 'white' : '#94a3b8', textDecoration: 'none', fontSize: '13px',
                background: active ? '#1e40af' : 'transparent',
                borderLeft: active ? '3px solid #60a5fa' : '3px solid transparent',
              }}>
                <span>{icon}</span>{label as string}
              </a>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <a href="/papers" style={{ display: 'block', color: '#64748b', fontSize: '12px', textDecoration: 'none', marginBottom: '10px' }}>← Public Site</a>
          <button onClick={handleSignOut}
            style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: '230px', padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
