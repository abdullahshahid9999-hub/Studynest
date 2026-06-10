import { ContributeForm } from '@/components/contribute/ContributeForm';

export default function ContributePage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Contribute a Paper</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Share past exam papers to help fellow NTU students.</p>
      <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#1e40af' }}>
        ℹ️ Papers are reviewed by admins before going public. Your roll number is stored for leaderboard tracking only.
      </div>
      <ContributeForm />
    </div>
  );
}
