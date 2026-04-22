import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { XP_VALUES } from '../../../src/config/constants';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import type { Event, PuzzleRushConfig, PuzzleRushDifficulty, PuzzleRushPuzzle } from '../../../src/models/event';
import { useEventStore } from '../../../src/store/eventStore';
import { useXpStore } from '../../../src/store/xpStore';

const DEFAULT_PUZZLE_LIMIT = 3;

function getPuzzleRushConfig(event: Event | null): PuzzleRushConfig | null {
  if (!event?.config || typeof event.config !== 'object') return null;
  if (!Array.isArray((event.config as PuzzleRushConfig).puzzles)) return null;
  return event.config as PuzzleRushConfig;
}

function parseSudokuGrid(input: string) {
  return input.split('').map((char) => {
    const value = Number(char);
    return Number.isFinite(value) ? value : 0;
  });
}

function getDifficultyLabel(level: PuzzleRushDifficulty) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

type LetterTile = {
  id: string;
  value: string;
};

export default function PuzzleRushScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, joinEvent, getParticipation, submitPuzzleRushCompletion } =
    useEventStore();
  const { awardXpForAction } = useXpStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PuzzleRushDifficulty>('easy');
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>([]);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_PUZZLE_LIMIT);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [sudokuBoard, setSudokuBoard] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      await fetchEvents();
      const foundEvent = [...liveEvents, ...upcomingEvents, ...pastEvents].find((item) => item.id === id) ?? null;
      setEvent(foundEvent);
      if (foundEvent) {
        await joinEvent(foundEvent.id);
      }
      setIsLoading(false);
    };
    void hydrate();
  }, [fetchEvents, id, joinEvent, liveEvents, pastEvents, upcomingEvents]);

  const config = useMemo(() => getPuzzleRushConfig(event), [event]);
  const puzzles = config?.puzzles ?? [];
  const xpPerPuzzle = config?.xp_per_puzzle ?? XP_VALUES.PUZZLE_RUSH;
  const availableDifficulties = useMemo(() => {
    const levels = new Set<PuzzleRushDifficulty>();
    for (const puzzle of puzzles) {
      if (puzzle.type === 'sudoku') {
        levels.add(puzzle.difficulty ?? 'easy');
      }
    }
    return Array.from(levels);
  }, [puzzles]);

  const filteredPuzzles = useMemo(() => {
    return puzzles.filter((puzzle) => {
      if (completedTodayIds.includes(puzzle.id)) return false;
      if (puzzle.type !== 'sudoku') return true;
      return (puzzle.difficulty ?? 'easy') === selectedDifficulty;
    });
  }, [completedTodayIds, puzzles, selectedDifficulty]);

  const activePuzzle = useMemo(() => {
    const preferred = filteredPuzzles.find((item) => item.id === activePuzzleId);
    if (preferred) return preferred;
    return filteredPuzzles[0] ?? null;
  }, [activePuzzleId, filteredPuzzles]);

  useEffect(() => {
    if (!activePuzzle) return;
    setActivePuzzleId(activePuzzle.id);
    setFeedback(null);
    setTimeLeft(activePuzzle.time_limit_seconds ?? (activePuzzle.type === 'sudoku' ? 240 : 120));
    if (activePuzzle.type === 'sudoku') {
      setSudokuBoard(parseSudokuGrid(activePuzzle.puzzle));
      setSelectedCell(null);
      setLetterTiles([]);
      return;
    }
    const source = activePuzzle.scrambled.split('').map((letter, index) => ({
      id: `${activePuzzle.id}-${letter}-${index}`,
      value: letter,
    }));
    setLetterTiles(source);
    setSudokuBoard([]);
    setSelectedCell(null);
  }, [activePuzzle]);

  useEffect(() => {
    if (!event || !config) return;
    const loadProgress = async () => {
      const participation = await getParticipation(event.id);
      const progress = (participation?.progress ?? {}) as {
        puzzleRushCompletedByDate?: Record<string, string[]>;
      };
      const todayIst = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      const todayCompletions = progress.puzzleRushCompletedByDate?.[todayIst] ?? [];
      setCompletedTodayIds(todayCompletions);
      setDailyLimit(Math.max(1, config.daily_limit ?? DEFAULT_PUZZLE_LIMIT));
    };
    void loadProgress();
  }, [config, event, getParticipation]);

  useEffect(() => {
    if (!activePuzzle || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activePuzzle, timeLeft]);

  const completedTodayCount = completedTodayIds.length;
  const limitReached = completedTodayCount >= dailyLimit;

  const handleSudokuInput = (digit: number | null) => {
    if (!activePuzzle || activePuzzle.type !== 'sudoku' || selectedCell === null) return;
    const originalPuzzle = parseSudokuGrid(activePuzzle.puzzle);
    if (originalPuzzle[selectedCell] !== 0) return;
    setSudokuBoard((prev) => {
      const next = [...prev];
      next[selectedCell] = digit ?? 0;
      return next;
    });
  };

  const submitCurrentPuzzle = async () => {
    if (!event || !activePuzzle || isChecking || limitReached || timeLeft <= 0) return;
    let solved = false;

    if (activePuzzle.type === 'sudoku') {
      solved = sudokuBoard.join('') === activePuzzle.solution;
    } else {
      solved = letterTiles.map((tile) => tile.value).join('').toUpperCase() === activePuzzle.answer.toUpperCase();
    }

    if (!solved) {
      setFeedback('Not correct yet. Keep trying.');
      return;
    }

    setIsChecking(true);
    const completionResult = await submitPuzzleRushCompletion({ eventId: event.id, puzzleId: activePuzzle.id });
    if (!completionResult?.accepted) {
      setFeedback(completionResult?.message ?? 'Could not save puzzle completion.');
      setIsChecking(false);
      return;
    }

    const xpResult = await awardXpForAction({
      source: 'puzzle_rush',
      amount: xpPerPuzzle,
      sourceId: event.id,
      description: `Puzzle rush completion: ${activePuzzle.id}`,
    });

    setCompletedTodayIds((prev) => [...new Set([...prev, activePuzzle.id])]);
    setFeedback(`Puzzle complete. +${xpResult?.awardedXp ?? xpPerPuzzle} XP`);
    setIsChecking(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!event || event.event_type !== 'puzzle_rush' || !config || puzzles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Puzzle Rush is not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>{event.description ?? 'Solve up to 3 puzzles daily and stack XP.'}</Text>
        <Text style={styles.meta}>
          Completed today: {completedTodayCount}/{dailyLimit}
        </Text>

        {availableDifficulties.length > 0 ? (
          <View style={styles.difficultyRow}>
            {availableDifficulties.map((level) => (
              <Pressable
                key={level}
                onPress={() => setSelectedDifficulty(level)}
                style={[styles.difficultyChip, selectedDifficulty === level && styles.difficultyChipActive]}
              >
                <Text style={[styles.difficultyText, selectedDifficulty === level && styles.difficultyTextActive]}>
                  {getDifficultyLabel(level)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!activePuzzle ? (
          <GlassCard style={styles.centerCard}>
            <Text style={styles.emptyTitle}>No puzzle available</Text>
            <Text style={styles.emptyText}>
              {limitReached ? 'Daily limit reached. New puzzles unlock tomorrow.' : 'No unsolved puzzle in this difficulty.'}
            </Text>
            <GradientButton title="Back to Events" onPress={() => router.replace('/events')} />
          </GlassCard>
        ) : (
          <GlassCard style={styles.puzzleCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.puzzleType}>{activePuzzle.type === 'sudoku' ? 'Sudoku' : 'Word Puzzle'}</Text>
              <Text style={styles.timer}>{timeLeft}s</Text>
            </View>

            {activePuzzle.type === 'sudoku' ? (
              <>
                <View style={styles.grid}>
                  {sudokuBoard.map((value, index) => {
                    const row = Math.floor(index / 9);
                    const col = index % 9;
                    const originalPuzzle = parseSudokuGrid(activePuzzle.puzzle);
                    const locked = originalPuzzle[index] !== 0;
                    return (
                      <Pressable
                        key={`${activePuzzle.id}-${index}`}
                        onPress={() => setSelectedCell(index)}
                        style={[
                          styles.cell,
                          selectedCell === index && styles.cellSelected,
                          (row + 1) % 3 === 0 && row !== 8 ? styles.cellBottomBold : null,
                          (col + 1) % 3 === 0 && col !== 8 ? styles.cellRightBold : null,
                          locked && styles.cellLocked,
                        ]}
                      >
                        <Text style={[styles.cellText, locked && styles.cellTextLocked]}>{value === 0 ? '' : value}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.numberPad}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <Pressable key={digit} style={styles.numberButton} onPress={() => handleSudokuInput(digit)}>
                      <Text style={styles.numberButtonText}>{digit}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.clearButton} onPress={() => handleSudokuInput(null)}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.wordPrompt}>Drag tiles to form a valid word</Text>
                <DraggableFlatList
                  data={letterTiles}
                  keyExtractor={(item) => item.id}
                  horizontal
                  contentContainerStyle={styles.tilesList}
                  onDragEnd={({ data }) => setLetterTiles(data)}
                  renderItem={({ item, drag, isActive }: RenderItemParams<LetterTile>) => (
                    <Pressable onLongPress={drag} delayLongPress={120} style={[styles.tile, isActive && styles.tileActive]}>
                      <Text style={styles.tileText}>{item.value}</Text>
                    </Pressable>
                  )}
                />
                <Text style={styles.previewWord}>{letterTiles.map((tile) => tile.value).join('')}</Text>
              </>
            )}

            <GradientButton
              title={isChecking ? 'Checking...' : 'Validate Puzzle'}
              onPress={() => void submitCurrentPuzzle()}
              disabled={isChecking || limitReached || timeLeft <= 0}
            />
            {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          </GlassCard>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
  title: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, fontWeight: '700' },
  subtitle: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  meta: { color: Colors.primary, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  difficultyRow: { flexDirection: 'row', gap: Spacing.xs },
  difficultyChip: {
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceLow,
  },
  difficultyChipActive: { backgroundColor: `${Colors.primary}22`, borderColor: Colors.primary },
  difficultyText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs, fontWeight: '700' },
  difficultyTextActive: { color: Colors.primary },
  centerCard: { gap: Spacing.sm },
  emptyTitle: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  emptyText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  puzzleCard: { gap: Spacing.sm, flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  puzzleType: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  timer: { color: Colors.primary, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: `${Colors.outline}66`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cell: {
    width: '11.1111%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: `${Colors.outline}44`,
    backgroundColor: Colors.surfaceLow,
  },
  cellSelected: { backgroundColor: `${Colors.primary}33` },
  cellLocked: { backgroundColor: Colors.surface },
  cellBottomBold: { borderBottomWidth: 2 },
  cellRightBold: { borderRightWidth: 2 },
  cellText: { color: Colors.onSurface, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '600' },
  cellTextLocked: { color: Colors.primary, fontWeight: '700' },
  numberPad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  numberButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
  },
  numberButtonText: { color: Colors.onSurface, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  clearButton: {
    paddingHorizontal: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  clearButtonText: { color: Colors.onSurface, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  wordPrompt: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  tilesList: { gap: Spacing.xs },
  tile: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  tileActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}22` },
  tileText: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  previewWord: { color: Colors.primary, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.lg, fontWeight: '700', letterSpacing: 1.5 },
  feedback: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  errorText: { color: Colors.error, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
});
