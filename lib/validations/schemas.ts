import { z } from 'zod';
import { isValidRollNumber } from '@/lib/utils/rollNumber';

const ALLOWED_MIME_TYPES = [
  'application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '20') * 1024 * 1024;

export const contributeSchema = z.object({
  roll_number: z.string().min(1, 'Roll number is required').refine(isValidRollNumber, {
    message: 'Invalid roll number. Expected: YY-NTU-DEPT-TYPE-SEQUENCE (e.g. 25-NTU-CS-FL-1124)',
  }),
  teacher_id: z.string().uuid('Invalid teacher selection'),
  subject_id: z.string().uuid('Invalid subject selection'),
  exam_type: z.enum(['Mid', 'Final']),
  semester: z.enum(['1','2','3','4','5','6','7','8']),
  term: z.enum(['Spring', 'Fall']),
  year: z.number().int().min(2000).max(new Date().getFullYear()),
  recaptcha_token: z.string().min(1),
});

export type ContributeInput = z.infer<typeof contributeSchema>;

export const adminApproveSchema = z.object({
  paper_id: z.string().uuid(),
  admin_note: z.string().max(500).optional(),
});

export const adminRejectSchema = z.object({
  paper_id: z.string().uuid(),
  admin_note: z.string().min(5, 'Provide a reason').max(500),
});

export const paperFiltersSchema = z.object({
  department_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  exam_type: z.enum(['Mid', 'Final']).optional(),
  semester: z.enum(['1','2','3','4','5','6','7','8']).optional(),
  term: z.enum(['Spring', 'Fall']).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export function validateUploadedFile(file: { name: string; type: string; size: number }): { valid: boolean; error?: string } {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return { valid: false, error: `File type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}` };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return { valid: false, error: 'Invalid file MIME type.' };
  if (file.size > MAX_FILE_SIZE_BYTES) return { valid: false, error: `File too large. Max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` };
  if (file.size === 0) return { valid: false, error: 'File is empty.' };
  return { valid: true };
}
