import { create } from 'zustand';
import { TimetableEntry, DayOfWeek } from '../models/timetable';
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
  }
}));
