export default function ContributePage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Contribute a Paper</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Help fellow NTU students by sharing past exam papers. Enter your roll number to get started.
      </p>
      <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
          ℹ️ Submitted papers are reviewed by admins before being made public.
        </p>
      </div>
      <p style={{ color: '#64748b', fontSize: '14px' }}>
        Contribution form coming soon. Please check back later.
      </p>
    </div>
  );
}
