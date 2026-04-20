export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  student_count: number;
  total_xp: number;
  avatar_url: string | null;
  created_at: string;
}

export interface CollegeRequest {
  id: string;
  requested_by: string;       // user id
  college_name: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

/**
 * College score formula: SUM(studentXP) / sqrt(studentCount)
 * Normalises XP by college size so small colleges can compete.
 */
export function getCollegeScore(totalXp: number, studentCount: number): number {
  if (studentCount === 0) return 0;
  return totalXp / Math.sqrt(studentCount);
}
