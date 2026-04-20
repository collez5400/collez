export type XpSource =
  | 'daily_login'
  | 'trivia'
  | 'treasure_hunt'
  | 'event'
  | 'weekly_streak'
  | 'bonus';

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: XpSource;
  source_id: string | null;
  description: string | null;
  created_at: string;
}

export interface AwardXpPayload {
  source: XpSource;
  amount: number;
  sourceId?: string;
  description?: string;
  bypassDailyCap?: boolean;
}

export interface AwardXpResult {
  awardedXp: number;
  totalXp: number;
  dailyXpEarned: number;
  dailyCap: number;
  capped: boolean;
  rankTier: string;
}
