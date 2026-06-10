export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
      <aside style={{ width: '220px', background: '#0f172a', color: 'white', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #1e293b', marginBottom: '8px' }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>📚</div>
          <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>NTU Archive</h1>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            ['🏠', 'Dashboard', '/admin'],
            ['🏫', 'Departments', '/admin/departments'],
            ['👤', 'Teachers', '/admin/teachers'],
            ['📖', 'Subjects', '/admin/subjects'],
            ['⏳', 'Pending', '/admin/pending'],
            ['✅', 'Approved', '/admin/approved'],
            ['❌', 'Rejected', '/admin/rejected'],
            ['👥', 'Contributors', '/admin/contributors'],
            ['🏆', 'Leaderboard', '/admin/leaderboard'],
          ].map(([icon, label, href]) => (
            <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', transition: 'background 0.15s' }}>
              <span>{icon}</span>{label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <a href="/papers" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>← Public Site</a>
          <a href="/login" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>Sign Out</a>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
