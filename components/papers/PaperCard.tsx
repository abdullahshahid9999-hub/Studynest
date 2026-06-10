'use client';
// components/papers/PaperCard.tsx

import { useState } from 'react';
import type { PaperPublic } from '@/types';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Eye, Download, Printer, Share2, Flag,
  BookOpen, User, GraduationCap, Hash,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface PaperCardProps {
  paper: PaperPublic;
}

export function PaperCard({ paper }: PaperCardProps) {
  const [viewerOpen, setViewerOpen]  = useState(false);
  const [reportOpen, setReportOpen]  = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = paper.file_url;
    a.download = `${paper.course_code}_${paper.exam_type}_${paper.term}${paper.year}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    const win = window.open(paper.file_url, '_blank');
    win?.addEventListener('load', () => win.print());
  };

  const handleShare = async () => {
    const text = `${paper.subject_name} (${paper.course_code}) — ${paper.exam_type} ${paper.term} ${paper.year}`;
    if (navigator.share) {
      await navigator.share({ title: text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Card className="group flex flex-col h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {paper.subject_name}
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                {paper.course_code}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Badge
                variant={paper.exam_type === 'Final' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {paper.exam_type}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1 space-y-2">
          <InfoRow icon={<GraduationCap className="h-3.5 w-3.5" />} label={paper.department_name} />
          <InfoRow icon={<User className="h-3.5 w-3.5" />} label={paper.teacher_name} />
          <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label={`Semester ${paper.semester}`} />
          <InfoRow
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label={`${paper.term} ${paper.year}`}
          />
        </CardContent>

        <CardFooter className="pt-3 border-t flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={() => setViewerOpen(true)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" /> View
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>
          <Button size="sm" variant="ghost" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground ml-auto"
            onClick={() => setReportOpen(true)}
          >
            <Flag className="h-3.5 w-3.5 mr-1" /> Report
          </Button>
        </CardFooter>
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>
              {paper.subject_name} — {paper.exam_type} · {paper.term} {paper.year}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative overflow-hidden">
            {/* Watermark overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
              style={{ transform: 'rotate(-30deg)' }}
            >
              <span
                className="text-4xl font-bold select-none whitespace-nowrap"
                style={{ color: 'rgba(0,0,0,0.06)', userSelect: 'none' }}
              >
                NTU Past Papers Archive
              </span>
            </div>
            <iframe
              src={`${paper.file_url}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={paper.subject_name}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report an Issue</AlertDialogTitle>
            <AlertDialogDescription>
              For corrections, ownership claims, or concerns regarding this paper,
              please contact the administration directly. We review all reports promptly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="mailto:admin@ntu.edu.pk?subject=Paper+Report">
                Contact Admin
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="shrink-0 text-muted-foreground/60">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
