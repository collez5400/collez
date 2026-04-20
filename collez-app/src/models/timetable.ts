export enum DayOfWeek {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
}

export enum ColorLabel {
  Primary = '#B4C5FF',
  Secondary = '#86EAD4',
  Tertiary = '#D0BCFF',
  Error = '#FFB4AB',
  Success = '#4ADE80',
  Warning = '#FBBF24',
}

export interface TimetableEntry {
  id: string;
  day_of_week: DayOfWeek;
  subject: string;
  start_time: string; // "HH:MM" format
  end_time: string;   // "HH:MM" format
  color: ColorLabel | string;
  room?: string;
  sort_order: number;
  created_at: string;
}
