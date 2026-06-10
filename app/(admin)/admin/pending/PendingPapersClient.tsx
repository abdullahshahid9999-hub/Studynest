'use client';
// app/(admin)/admin/pending/page-client.tsx
// Server page fetches data; this client component handles approve/reject UI

import { useState } from 'react';
import type { Paper } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PendingPapersClientProps {
  papers: Paper[];
}

export function PendingPapersClient({ papers }: PendingPapersClientProps) {
  const router = useRouter();
  const [viewPaper, setViewPaper]       = useState<Paper | null>(null);
  const [rejectPaper, setRejectPaper]   = useState<Paper | null>(null);
  const [rejectNote, setRejectNote]     = useState('');
  const [loading, setLoading]           = useState<string | null>(null);
  const [error, setError]               = useState('');

  async function getAuthToken() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }

  async function handleApprove(paper: Paper) {
    setLoading(paper.id);
    setError('');
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paper_id: paper.id }),
      });
      const json = await res.json();
      if (json.success) {
        router.refresh();
      } else {
        setError(json.error ?? 'Approval failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectPaper) return;
    if (!rejectNote.trim()) { setError('Please provide a rejection reason.'); return; }

    setLoading(rejectPaper.id);
    setError('');
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paper_id: rejectPaper.id, admin_note: rejectNote }),
      });
      const json = await res.json();
      if (json.success) {
        setRejectPaper(null);
        setRejectNote('');
        router.refresh();
      } else {
        setError(json.error ?? 'Rejection failed.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(null);
    }
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <CheckCircle className="h-12 w-12 text-green-400" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm">No pending papers to review.</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {papers.map((paper: any) => (
          <Card key={paper.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base leading-tight">
                {paper.subject?.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {paper.subject?.course_code}
              </p>
            </CardHeader>

            <CardContent className="space-y-2 flex-1 text-sm">
              <Row label="Department" value={paper.department?.name} />
              <Row label="Teacher"    value={paper.teacher?.name} />
              <Row label="Exam"       value={paper.exam_type} />
              <Row label="Term"       value={`${paper.term} ${paper.year}`} />
              <Row label="Semester"   value={`Semester ${paper.semester}`} />
              <Row label="Roll No."   value={paper.roll_number} mono />
              <Row
                label="Submitted"
                value={new Date(paper.created_at).toLocaleDateString()}
              />
            </CardContent>

            <CardFooter className="border-t pt-3 gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewPaper(paper)}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading === paper.id}
                onClick={() => handleApprove(paper)}
              >
                {loading === paper.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <><CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve</>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading === paper.id}
                onClick={() => { setRejectPaper(paper); setRejectNote(''); setError(''); }}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* File Preview Dialog */}
      <Dialog open={!!viewPaper} onOpenChange={() => setViewPaper(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>{viewPaper?.file_name}</DialogTitle>
          </DialogHeader>
          {viewPaper && (
            <iframe
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/papers/${viewPaper.file_path}`}
              className="flex-1 w-full border-0"
              title="Paper preview"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectPaper} onOpenChange={() => setRejectPaper(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Paper</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejection. This is stored internally.
            </p>
            <Textarea
              placeholder="Reason for rejection…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectPaper(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!!loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
