/**
 * Database type shim for Supabase client.
 * Full types can be generated via: npx supabase gen types typescript
 * Until then, these manual types keep the client strongly typed on Rows,
 * while using `any` for Insert/Update to avoid Supabase's strict overload
 * inference turning unrecognised tables into `never`.
 */

import type { User } from './user';
import type { College, CollegeRequest } from './college';

export interface XpTransaction {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  created_at: string;
}

type TableDef<Row> = {
  Row: Row;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Insert: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Update: any;
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<User>;
      colleges: TableDef<College>;
      college_requests: TableDef<CollegeRequest>;
      xp_transactions: TableDef<XpTransaction>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
