import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <Link href="/papers" style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#111827', textDecoration: 'none' }}>
            NTU Past Papers Archive
          </Link>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Link href="/papers" style={{ padding: '7px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '6px' }}>Papers</Link>
            <Link href="/contribute" style={{ padding: '7px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '6px' }}>Contribute</Link>
            <Link href="/leaderboard" style={{ padding: '7px 16px', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '6px' }}>Leaderboard</Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '60px' }}>
        © {new Date().getFullYear()} NTU Past Papers Archive. For NTU students.
      </footer>
    </div>
  );
}
