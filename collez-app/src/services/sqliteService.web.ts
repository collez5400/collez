type RunResult = {
  changes: number;
  lastInsertRowId: number;
};

type WebDatabase = {
  execAsync: (query: string) => Promise<void>;
  getFirstAsync: <T>(query: string) => Promise<T | null>;
  getAllAsync: <T>(query: string) => Promise<T[]>;
  runAsync: (query: string, params?: unknown[]) => Promise<RunResult>;
};

const webDb: WebDatabase = {
  async execAsync(_query: string) {
    return;
  },
  async getFirstAsync<T>(query: string) {
    if (query.includes('PRAGMA user_version')) {
      return { user_version: 4 } as T;
    }
    return null;
  },
  async getAllAsync<T>(_query: string) {
    return [] as T[];
  },
  async runAsync(_query: string, _params?: unknown[]) {
    return { changes: 0, lastInsertRowId: 0 };
  },
};

export async function getDb(): Promise<WebDatabase> {
  return webDb;
}

export async function initSQLite() {
  // Web fallback: no-op until a persistent web DB layer is added.
}

