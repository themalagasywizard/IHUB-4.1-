const STORAGE_KEY = 'ihub-watch-progress';

export interface ShowProgress {
  episodes: Record<string, number>;
  lastSeason?: number;
  lastEpisode?: number;
}

type ProgressMap = Record<string, ShowProgress>;

const readProgress = (): ProgressMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeProgress = (progress: ProgressMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore private-mode write failures
  }
};

export const episodeKey = (season: number, episode: number) => `${season}-${episode}`;

export const getShowProgress = (showId: string): ShowProgress => {
  return readProgress()[String(showId)] || { episodes: {} };
};

export const isEpisodeWatched = (showId: string, season: number, episode: number) => {
  return Boolean(getShowProgress(showId).episodes[episodeKey(season, episode)]);
};

export const getSeasonWatchedCount = (showId: string, season: number) => {
  const prefix = `${season}-`;
  return Object.keys(getShowProgress(showId).episodes).filter((key) => key.startsWith(prefix)).length;
};

export const getWatchedCount = (showId: string) => {
  return Object.keys(getShowProgress(showId).episodes).length;
};

export const markEpisodeWatched = (showId: string, season: number, episode: number) => {
  const all = readProgress();
  const current = all[String(showId)] || { episodes: {} };
  current.episodes[episodeKey(season, episode)] = Date.now();
  current.lastSeason = season;
  current.lastEpisode = episode;
  all[String(showId)] = current;
  writeProgress(all);
  return current;
};

export const toggleEpisodeWatched = (showId: string, season: number, episode: number) => {
  const all = readProgress();
  const current = all[String(showId)] || { episodes: {} };
  const key = episodeKey(season, episode);
  if (current.episodes[key]) {
    delete current.episodes[key];
  } else {
    current.episodes[key] = Date.now();
    current.lastSeason = season;
    current.lastEpisode = episode;
  }
  all[String(showId)] = current;
  writeProgress(all);
  return current;
};

export const getContinueEpisode = (showId: string) => {
  const progress = getShowProgress(showId);
  if (!progress.lastSeason || !progress.lastEpisode) return null;
  return {
    season: progress.lastSeason,
    episode: progress.lastEpisode + 1,
    resumeSeason: progress.lastSeason,
    resumeEpisode: progress.lastEpisode,
  };
};
