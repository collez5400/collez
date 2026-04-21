import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { CACHE_DURATIONS } from '../config/constants';
import { supabase } from '../config/supabase';

const QUOTE_CACHE_KEY_PREFIX = 'daily_quote_v1';

export interface DailyQuote {
  text: string;
  author: string;
  scheduledDate: string | null;
  isFallback: boolean;
}

const FALLBACK_QUOTE: DailyQuote = {
  text: 'Progress over perfection.',
  author: 'COLLEZ',
  scheduledDate: null,
  isFallback: true,
};

interface QuoteCachePayload {
  updatedAt: number;
  quote: DailyQuote;
}

const buildCacheKey = (dateKey: string) => `${QUOTE_CACHE_KEY_PREFIX}_${dateKey}`;

const parseCachedQuote = (rawValue: string | null): DailyQuote | null => {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue) as QuoteCachePayload;
    if (Date.now() - parsed.updatedAt > CACHE_DURATIONS.LONG) {
      return null;
    }
    return parsed.quote;
  } catch {
    return null;
  }
};

const cacheQuote = async (cacheKey: string, quote: DailyQuote): Promise<void> => {
  const payload: QuoteCachePayload = {
    updatedAt: Date.now(),
    quote,
  };
  await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
};

export async function fetchTodayQuote(options?: { forceRefresh?: boolean }): Promise<DailyQuote> {
  const dateKey = dayjs().format('YYYY-MM-DD');
  const cacheKey = buildCacheKey(dateKey);
  const forceRefresh = options?.forceRefresh ?? false;

  if (!forceRefresh) {
    const cachedQuote = parseCachedQuote(await AsyncStorage.getItem(cacheKey));
    if (cachedQuote) return cachedQuote;
  }

  try {
    const supabaseClient = supabase as any;
    const { data, error } = await supabaseClient
      .from('quotes')
      .select('text, author, scheduled_date, is_active')
      .eq('scheduled_date', dateKey)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed fetching daily quote');
    }

    const quote: DailyQuote = data
      ? {
          text: data.text ?? FALLBACK_QUOTE.text,
          author: data.author ?? 'Unknown',
          scheduledDate: data.scheduled_date ?? dateKey,
          isFallback: false,
        }
      : FALLBACK_QUOTE;

    await cacheQuote(cacheKey, quote);
    return quote;
  } catch {
    const cachedQuote = parseCachedQuote(await AsyncStorage.getItem(cacheKey));
    return cachedQuote ?? FALLBACK_QUOTE;
  }
}

