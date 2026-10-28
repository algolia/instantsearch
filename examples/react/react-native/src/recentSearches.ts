import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'instantsearch-recent-searches';
const MAX_RECENT = 5;

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (error) {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getRecentSearches();
  }

  const previous = await getRecentSearches();
  const next = [
    trimmed,
    ...previous.filter((item) => item !== trimmed),
  ].slice(0, MAX_RECENT);

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Ignore write failures (e.g. storage full); recent searches are best-effort.
  }

  return next;
}
