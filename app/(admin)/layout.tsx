'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.replace('/login');
    });
  }, []);

  const nav = [
    { icon: '📊', label: 'Dashboard',    href: '/admin' },
    { icon: '🏫', label: 'Departments',  href: '/admin/departments' },
    { icon: '👤', label: 'Teachers',     href: '/admin/teachers' },
    { icon: '📖', label: 'Subjects',     href: '/admin/subjects' },
    { icon: '⏳', label: 'Pending',      href: '/admin/pending' },
    { icon: '✅', label: 'Approved',     href: '/admin/approved' },
    { icon: '❌', label: 'Rejected',     href: '/admin/rejected' },
    { icon: '👥', label: 'Contributors', href: '/admin/contributors' },
    { icon: '🏆', label: 'Leaderboard',  href: '/admin/leaderboard' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: '#0f172a', color: 'white',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '36px', background: '#1a56db', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📚</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>StudyNest</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {nav.map(({ icon, label, href }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <a key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '14px', fontWeight: active ? '600' : '400',
                color: active ? 'white' : '#94a3b8',
                background: active ? 'rgba(26,86,219,0.35)' : 'transparent',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/papers" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', color: '#64748b', textDecoration: 'none', fontSize: '13px', marginBottom: '6px' }}>
            <span>🌐</span> Public Site
          </a>
          <button onClick={async () => { await sb.auth.signOut(); window.location.replace('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {nav.find(n => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label ?? 'Dashboard'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#1a56db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
          </div>
        </div>
        <main style={{ flex: 1, padding: '32px', background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
