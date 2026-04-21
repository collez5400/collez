import { create } from 'zustand';
import { TimetableEntry, DayOfWeek, ColorLabel } from '../models/timetable';
import { getDb } from '../services/sqliteService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface TimetableState {
  entries: Record<number, TimetableEntry[]>;
  selectedDay: DayOfWeek;
  isLoading: boolean;
  
  
  // Actions
  setSelectedDay: (day: DayOfWeek) => void;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<TimetableEntry, 'id' | 'created_at'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  reorderEntries: (day: DayOfWeek, newOrder: TimetableEntry[]) => Promise<void>;
  duplicateDay: (fromDay: DayOfWeek, toDay: DayOfWeek) => Promise<void>;
  resetSemester: () => Promise<void>;
  generateWeekSlots: (config: {
    periodMinutes: number;
    classStart: string;
    classEnd: string;
    breakStart?: string;
    breakEnd?: string;
  }) => Promise<void>;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  entries: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] },
  selectedDay: DayOfWeek.Monday,
  isLoading: false,

  setSelectedDay: (day: DayOfWeek) => set({ selectedDay: day }),

  fetchEntries: async () => {
    set({ isLoading: true });
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<TimetableEntry>('SELECT * FROM timetable ORDER BY day_of_week, sort_order ASC');
      
      const newEntries: Record<number, TimetableEntry[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
      for (const row of rows) {
        if (newEntries[row.day_of_week]) {
          newEntries[row.day_of_week].push(row);
        }
      }
      set({ entries: newEntries });
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData) => {
    const db = await getDb();
    const id = uuidv4();
    const created_at = new Date().toISOString();
    
    await db.runAsync(
      'INSERT INTO timetable (id, day_of_week, subject, start_time, end_time, color, room, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        entryData.day_of_week,
        entryData.subject,
        entryData.start_time,
        entryData.end_time,
        entryData.color,
        entryData.room || null,
        entryData.sort_order,
        created_at
      ]
    );
    await get().fetchEntries();
  },

  updateEntry: async (id, updates) => {
    const db = await getDb();
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => (updates as any)[k]);
    values.push(id);
    
    await db.runAsync(`UPDATE timetable SET ${setClause} WHERE id = ?`, values);
    await get().fetchEntries();
  },

  deleteEntry: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM timetable WHERE id = ?', [id]);
    await get().fetchEntries();
  },

  reorderEntries: async (day, newOrder) => {
    const db = await getDb();
    // Optimistic UI update
    const currentEntries = { ...get().entries };
    currentEntries[day] = newOrder;
    set({ entries: currentEntries });
    
    // Store updates
    for (let i = 0; i < newOrder.length; i++) {
        await db.runAsync('UPDATE timetable SET sort_order = ? WHERE id = ?', [i, newOrder[i].id]);
    }
  },

  duplicateDay: async (fromDay, toDay) => {
    const db = await getDb();
    const currentEntries = get().entries[fromDay];
    
    // Delete existing on target day? Usually we want it clear to duplicate over.
    await db.runAsync('DELETE FROM timetable WHERE day_of_week = ?', [toDay]);
    
    for (const entry of currentEntries) {
      const id = uuidv4();
      const created_at = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO timetable (id, day_of_week, subject, start_time, end_time, color, room, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, toDay, entry.subject, entry.start_time, entry.end_time, entry.color, entry.room || null, entry.sort_order, created_at]
      );
    }
    await get().fetchEntries();
  },

  resetSemester: async () => {
    const db = await getDb();
    await db.runAsync('DELETE FROM timetable');
    set({ entries: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] } });
  },

  generateWeekSlots: async (config) => {
    const db = await getDb();
    const parseMins = (value: string) => {
      const [hours, mins] = value.split(':').map(Number);
      return hours * 60 + mins;
    };
    const toTime = (mins: number) =>
      `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

    const periodMinutes = Math.max(10, config.periodMinutes);
    const start = parseMins(config.classStart);
    const end = parseMins(config.classEnd);
    const breakStart = config.breakStart ? parseMins(config.breakStart) : undefined;
    const breakEnd = config.breakEnd ? parseMins(config.breakEnd) : undefined;

    if (start >= end) {
      throw new Error('Class start time must be before end time');
    }
    if ((breakStart !== undefined && breakEnd === undefined) || (breakStart === undefined && breakEnd !== undefined)) {
      throw new Error('Break start and end are both required');
    }
    if (breakStart !== undefined && breakEnd !== undefined) {
      if (breakStart >= breakEnd) throw new Error('Break start time must be before break end time');
      if (breakStart < start || breakEnd > end) throw new Error('Break must be inside class hours');
    }

    const buildDaySlots = () => {
      const slots: Array<{ subject: string; start_time: string; end_time: string; color: ColorLabel; room: null; sort_order: number }> = [];
      let cursor = start;
      let order = 0;
      while (cursor + periodMinutes <= end) {
        const slotEnd = cursor + periodMinutes;
        if (breakStart !== undefined && breakEnd !== undefined) {
          if (cursor < breakStart && slotEnd > breakStart) {
            cursor = breakStart;
            continue;
          }
          if (cursor >= breakStart && cursor < breakEnd) {
            if (cursor === breakStart) {
              slots.push({
                subject: 'BREAK',
                start_time: toTime(breakStart),
                end_time: toTime(breakEnd),
                color: ColorLabel.Warning,
                room: null,
                sort_order: order++,
              });
            }
            cursor = breakEnd;
            continue;
          }
        }

        slots.push({
          subject: 'Tap to add subject',
          start_time: toTime(cursor),
          end_time: toTime(slotEnd),
          color: ColorLabel.Primary,
          room: null,
          sort_order: order++,
        });
        cursor = slotEnd;
      }
      return slots;
    };

    await db.runAsync('DELETE FROM timetable');
    for (let day = DayOfWeek.Monday; day <= DayOfWeek.Saturday; day++) {
      const slots = buildDaySlots();
      for (const slot of slots) {
        await db.runAsync(
          'INSERT INTO timetable (id, day_of_week, subject, start_time, end_time, color, room, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), day, slot.subject, slot.start_time, slot.end_time, slot.color, null, slot.sort_order, new Date().toISOString()]
        );
      }
    }
    await get().fetchEntries();
  },
}));
