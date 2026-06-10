'use client';
// components/contribute/ContributeForm.tsx

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contributeSchema } from '@/lib/validations/schemas';
import { parseRollNumber } from '@/lib/utils/rollNumber';
import type { Department, Teacher, Subject } from '@/types';

// shadcn/ui components (adjust import paths to your setup)
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge }    from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

type FormValues = z.infer<typeof contributeSchema>;

const SEMESTERS = ['1','2','3','4','5','6','7','8'] as const;
const EXAM_TYPES = ['Mid', 'Final'] as const;
const TERMS = ['Spring', 'Fall'] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export function ContributeForm() {
  const [teachers, setTeachers]       = useState<Teacher[]>([]);
  const [subjects, setSubjects]       = useState<Subject[]>([]);
  const [detectedDept, setDetectedDept] = useState<Department | null>(null);
  const [submitState, setSubmitState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError]       = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(contributeSchema),
    defaultValues: { year: CURRENT_YEAR },
  });

  const rollNumber = watch('roll_number');
  const teacherId  = watch('teacher_id');

  // ── Auto-detect department from roll number
  useEffect(() => {
    if (!rollNumber || rollNumber.length < 10) {
      setDetectedDept(null);
      setTeachers([]);
      return;
    }

    const parsed = parseRollNumber(rollNumber);
    if (!parsed.isValid) {
      setDetectedDept(null);
      return;
    }

    // Fetch teachers for detected department
    fetch(`/api/teachers?department_code=${parsed.departmentCode}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setTeachers(res.data);
          setDetectedDept({ code: parsed.departmentCode, name: parsed.departmentName! } as Department);
        }
      })
      .catch(() => {});
  }, [rollNumber]);

  // ── Load subjects when teacher changes
  useEffect(() => {
    if (!teacherId) {
      setSubjects([]);
      return;
    }
    fetch(`/api/subjects?teacher_id=${teacherId}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setSubjects(res.data); })
      .catch(() => {});
  }, [teacherId]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) { setSelectedFile(null); return; }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Allowed: PDF, JPG, PNG, DOCX');
      setSelectedFile(null);
      return;
    }
    if (file.size > maxSize) {
      setFileError('File too large. Maximum size is 20MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      return;
    }

    setSubmitState('loading');
    setErrorMessage('');

    try {
      // Get reCAPTCHA token
      let recaptchaToken = 'dev-token';
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        recaptchaToken = await (window as any).grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          { action: 'contribute' }
        );
      }

      const formData = new FormData();
      Object.entries({ ...data, recaptcha_token: recaptchaToken }).forEach(
        ([k, v]) => formData.append(k, String(v))
      );
      formData.append('file', selectedFile);

      const res  = await fetch('/api/contribute', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success) {
        setSubmitState('success');
        reset();
        setSelectedFile(null);
        setDetectedDept(null);
        setTeachers([]);
        setSubjects([]);
      } else {
        setSubmitState('error');
        setErrorMessage(json.error ?? 'Submission failed.');
      }
    } catch {
      setSubmitState('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Submitted Successfully!</h2>
        <p className="text-muted-foreground max-w-md">
          Your paper has been submitted for review. It will appear in the public archive
          after admin approval. Thank you for contributing!
        </p>
        <Button onClick={() => setSubmitState('idle')}>Submit Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Roll Number */}
      <div className="space-y-2">
        <Label htmlFor="roll_number">
          Roll Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="roll_number"
          placeholder="e.g. 25-NTU-CS-FL-1124"
          {...register('roll_number')}
          className={errors.roll_number ? 'border-destructive' : ''}
        />
        {errors.roll_number && (
          <p className="text-sm text-destructive">{errors.roll_number.message}</p>
        )}
        {detectedDept && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Detected department:</span>
            <Badge variant="secondary">{detectedDept.code} — {detectedDept.name}</Badge>
          </div>
        )}
      </div>

      {/* Teacher */}
      <div className="space-y-2">
        <Label htmlFor="teacher_id">
          Teacher <span className="text-destructive">*</span>
        </Label>
        <Select
          disabled={!detectedDept || teachers.length === 0}
          onValueChange={(v) => setValue('teacher_id', v)}
        >
          <SelectTrigger id="teacher_id">
            <SelectValue
              placeholder={
                !detectedDept
                  ? 'Enter roll number first'
                  : teachers.length === 0
                  ? 'No teachers found for department'
                  : 'Select teacher'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teacher_id && (
          <p className="text-sm text-destructive">{errors.teacher_id.message}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject_id">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Select
          disabled={!teacherId || subjects.length === 0}
          onValueChange={(v) => setValue('subject_id', v)}
        >
          <SelectTrigger id="subject_id">
            <SelectValue
              placeholder={
                !teacherId ? 'Select teacher first' : 'Select subject'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.course_code} — {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subject_id && (
          <p className="text-sm text-destructive">{errors.subject_id.message}</p>
        )}
      </div>

      {/* Exam Type + Semester */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Exam Type <span className="text-destructive">*</span></Label>
          <Select onValueChange={(v) => setValue('exam_type', v as any)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {EXAM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.exam_type && (
            <p className="text-sm text-destructive">{errors.exam_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Semester <span className="text-destructive">*</span></Label>
          <Select onValueChange={(v) => setValue('semester', v as any)}>
            <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.semester && (
            <p className="text-sm text-destructive">{errors.semester.message}</p>
          )}
        </div>
      </div>

      {/* Term + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Term <span className="text-destructive">*</span></Label>
          <Select onValueChange={(v) => setValue('term', v as any)}>
            <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
            <SelectContent>
              {TERMS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.term && (
            <p className="text-sm text-destructive">{errors.term.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Year <span className="text-destructive">*</span></Label>
          <Select
            defaultValue={String(CURRENT_YEAR)}
            onValueChange={(v) => setValue('year', Number(v))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.year && (
            <p className="text-sm text-destructive">{errors.year.message}</p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="file">
          Paper File <span className="text-destructive">*</span>
        </Label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
            fileError ? 'border-destructive' : 'border-muted-foreground/25'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          {selectedFile ? (
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG, DOCX — Max 20MB
              </p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileChange}
          />
        </div>
        {fileError && <p className="text-sm text-destructive">{fileError}</p>}
      </div>

      {/* Error Alert */}
      {submitState === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={submitState === 'loading'}
        size="lg"
      >
        {submitState === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Paper'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Submitted papers are reviewed by admins before appearing publicly.
        Your roll number is stored for leaderboard tracking only.
      </p>
    </form>
  );
}
