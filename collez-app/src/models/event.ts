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

export type PuzzleRushDifficulty = 'easy' | 'medium' | 'hard';
export type PuzzleRushPuzzleType = 'sudoku' | 'word_scramble';

export interface PuzzleRushPuzzleBase {
  id: string;
  type: PuzzleRushPuzzleType;
  difficulty?: PuzzleRushDifficulty;
  time_limit_seconds?: number;
}

export interface PuzzleRushSudokuPuzzle extends PuzzleRushPuzzleBase {
  type: 'sudoku';
  puzzle: string;
  solution: string;
}

export interface PuzzleRushWordPuzzle extends PuzzleRushPuzzleBase {
  type: 'word_scramble';
  scrambled: string;
  answer: string;
}

export type PuzzleRushPuzzle = PuzzleRushSudokuPuzzle | PuzzleRushWordPuzzle;

export interface PuzzleRushConfig {
  puzzles: PuzzleRushPuzzle[];
  daily_limit?: number;
  xp_per_puzzle?: number;
  badge_name?: string;
}

export interface CollegeBattlePrizeConfig {
  rank: number;
  xp_bonus: number;
  badge_name?: string;
}

export interface CollegeBattleConfig {
  battle_type?: 'xp_race';
  min_participants?: number;
  prizes?: CollegeBattlePrizeConfig[];
  rewards_distributed_at?: string;
}

export interface CollegeBattleStanding {
  rank: number;
  college_id: string;
  college_name: string;
  college_city: string | null;
  college_state: string | null;
  participant_count: number;
  student_count: number;
  total_xp_earned: number;
  score: number;
  eligible: boolean;
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
  config: TriviaConfig | TreasureHuntConfig | PuzzleRushConfig | CollegeBattleConfig | null;
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
