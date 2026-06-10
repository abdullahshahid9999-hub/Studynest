// lib/utils/rollNumber.ts
// Parses NTU roll numbers like: 25-NTU-CS-FL-1124
// Format: YY-UNIVERSITY-DEPT-TYPE-SEQUENCE

import { ParsedRollNumber } from '@/types';

/**
 * Configurable department code → department name mapping.
 * Add new departments here without changing parser logic.
 */
export const DEPARTMENT_CODE_MAP: Record<string, string> = {
  CS:  'Department of Computer Science',
  TE:  'Textile Engineering',
  ME:  'Mechanical Engineering',
  MS:  'Management Sciences',
  EE:  'Electrical Engineering',
  CHE: 'Chemical Engineering',
  ENV: 'Environmental Sciences',
  // Add future departments here:
  // BBA: 'Business Administration',
  // FD:  'Fashion Design',
};

/**
 * Roll number regex pattern.
 * Captures: year, university, dept code, type, sequence
 * Example: 25-NTU-CS-FL-1124
 */
const ROLL_NUMBER_PATTERN =
  /^(\d{2})-([A-Z]+)-([A-Z]+)-([A-Z]+)-(\d{4,6})$/i;

/**
 * Parse an NTU roll number into its components.
 */
export function parseRollNumber(rollNumber: string): ParsedRollNumber {
  const trimmed = rollNumber.trim().toUpperCase();
  const match = trimmed.match(ROLL_NUMBER_PATTERN);

  if (!match) {
    return {
      raw: rollNumber,
      year: '',
      university: '',
      departmentCode: '',
      type: '',
      sequence: '',
      isValid: false,
    };
  }

  const [, year, university, deptCode, type, sequence] = match;
  const departmentName = DEPARTMENT_CODE_MAP[deptCode];

  return {
    raw: rollNumber,
    year,
    university,
    departmentCode: deptCode,
    type,
    sequence,
    departmentName,
    isValid: university === 'NTU' && !!departmentName,
  };
}

/**
 * Get the department code from a roll number.
 * Returns null if invalid.
 */
export function getDepartmentCode(rollNumber: string): string | null {
  const parsed = parseRollNumber(rollNumber);
  return parsed.isValid ? parsed.departmentCode : null;
}

/**
 * Validate roll number format.
 */
export function isValidRollNumber(rollNumber: string): boolean {
  return parseRollNumber(rollNumber).isValid;
}

/**
 * Get a human-readable department name from a roll number.
 */
export function getDepartmentName(rollNumber: string): string | null {
  const parsed = parseRollNumber(rollNumber);
  return parsed.departmentName ?? null;
}
