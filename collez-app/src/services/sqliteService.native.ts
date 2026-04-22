import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// The current database schema version
const CURRENT_VERSION = 4;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('collez.db');
  return db;
}

export async function initSQLite() {
  const database = await getDb();

  // Set journal mode to WAL for better performance
  await database.execAsync('PRAGMA journal_mode = WAL');

  // We are using a simple migration strategy where we store the db version
  // in a pragma user_version and run updates accordingly.
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= CURRENT_VERSION) {
    return; // Up to date
  }

  if (currentVersion === 0) {
    // Initial schema setup
    await database.execAsync(`
      BEGIN TRANSACTION;

      -- Timetable
      CREATE TABLE IF NOT EXISTS timetable (
        id TEXT PRIMARY KEY,
        day_of_week INTEGER NOT NULL,
        subject TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        color TEXT NOT NULL,
        room TEXT,
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      -- Tasks
      CREATE TABLE IF NOT EXISTS task_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        folder_id TEXT,
        due_date TEXT,
        completed_at TEXT,
        is_completed INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Notes
      CREATE TABLE IF NOT EXISTS note_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT,
        subject_tag TEXT,
        folder_id TEXT,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- PDF Vault
      CREATE TABLE IF NOT EXISTS pdf_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pdf_files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        local_uri TEXT NOT NULL,
        folder_id TEXT,
        cloud_path TEXT,
        synced_at TEXT,
        size_bytes INTEGER NOT NULL,
        last_accessed_at TEXT,
        created_at TEXT NOT NULL
      );

      -- App cache
      CREATE TABLE IF NOT EXISTS app_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      COMMIT;
    `);
    // Set version after transaction commits
    await database.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
    return;
  }

  if (currentVersion === 1) {
    await database.execAsync(`
      BEGIN TRANSACTION;
      ALTER TABLE tasks ADD COLUMN completed_at TEXT;
      COMMIT;
    `);
    await database.execAsync('PRAGMA user_version = 2');
  }

  if (currentVersion <= 2) {
    await database.execAsync(`
      BEGIN TRANSACTION;
      CREATE TABLE IF NOT EXISTS app_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      COMMIT;
    `);
    await database.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
  }

  if (currentVersion <= 3) {
    await database.execAsync(`
      BEGIN TRANSACTION;
      ALTER TABLE pdf_files ADD COLUMN cloud_path TEXT;
      ALTER TABLE pdf_files ADD COLUMN synced_at TEXT;
      COMMIT;
    `);
    await database.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
  }
}

