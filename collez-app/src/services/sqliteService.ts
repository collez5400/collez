import { Platform } from 'react-native';

type SqliteDb = {
  execAsync: (query: string) => Promise<void>;
  getFirstAsync: <T>(query: string) => Promise<T | null>;
  getAllAsync: <T>(query: string) => Promise<T[]>;
  runAsync: (query: string, params?: unknown[]) => Promise<{
    changes: number;
    lastInsertRowId: number;
  }>;
};

type SqliteModule = {
  getDb: () => Promise<SqliteDb>;
  initSQLite: () => Promise<void>;
};

const sqliteModule: SqliteModule =
  Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./sqliteService.web')
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./sqliteService.native');

export const getDb = sqliteModule.getDb;
export const initSQLite = sqliteModule.initSQLite;