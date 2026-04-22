export type EventType = 'trivia' | 'treasure_hunt' | 'puzzle_rush' | 'college_battle' | 'streak_marathon';
export type EventStatus = 'upcoming' | 'live' | 'ended';

export interface TriviaQuestion {
  id: string;
  text: string;
  options: string[];
  correct_index: number;
  time_limit_seconds?: number;
}

export interface TriviaConfig {
  questions: TriviaQuestion[];
  total_questions?: number;
  xp_per_correct?: number;
  participation_xp?: number;
  passing_score?: number;
  badge_name?: string;
}

export type HuntClueType = 'puzzle' | 'navigate' | 'question' | 'action';
export type HuntPuzzleType = 'sudoku' | 'word_scramble' | 'math';

export interface HuntClue {
  id: string;
  type: HuntClueType;
  hint?: string;
  puzzle_type?: HuntPuzzleType;
  puzzle_data?: Record<string, unknown>;
  target_screen?: string;
  hidden_element_id?: string;
  question?: string;
  answer?: string;
  case_sensitive?: boolean;
  action?: string;
}

export interface TreasureHuntConfig {
  clues: HuntClue[];
  total_clues?: number;
  completion_xp?: number;
  badge_name?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  status: EventStatus;
  start_time: string;
  end_time: string;
  xp_reward: number;
  badge_name: string | null;
  banner_image_url: string | null;
  config: TriviaConfig | TreasureHuntConfig | null;
  created_at: string;
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  xp_earned: number;
  completed: boolean;
  progress: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
}
