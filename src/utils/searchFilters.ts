export const SEARCH_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'RU', name: 'Russia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IR', name: 'Iran' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IL', name: 'Israel' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
] as const;

export const SEARCH_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'th', name: 'Thai' },
  { code: 'fa', name: 'Persian' },
] as const;

export const SEARCH_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
  { value: 'primary_release_date.asc', label: 'Oldest first' },
  { value: 'revenue.desc', label: 'Highest revenue' },
  { value: 'title.asc', label: 'Title A-Z' },
] as const;

export const SEARCH_RUNTIME_OPTIONS = [
  { value: '', label: 'Any length' },
  { value: 'short', label: 'Under 90 min' },
  { value: 'standard', label: '90-150 min' },
  { value: 'long', label: 'Over 150 min' },
] as const;

export const SEARCH_VOTE_OPTIONS = [
  { value: '', label: 'Any votes' },
  { value: '20', label: '20+ votes' },
  { value: '100', label: '100+ votes' },
  { value: '500', label: '500+ votes' },
  { value: '1000', label: '1000+ votes' },
] as const;

export const SEARCH_DECADES = ['1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];

export const SEARCH_PROVIDERS = [
  { id: '8', name: 'Netflix' },
  { id: '9', name: 'Prime Video' },
  { id: '337', name: 'Disney+' },
  { id: '1899', name: 'Max' },
  { id: '350', name: 'Apple TV+' },
  { id: '15', name: 'Hulu' },
  { id: '531', name: 'Paramount+' },
  { id: '386', name: 'Peacock' },
  { id: '283', name: 'Crunchyroll' },
  { id: '11', name: 'MUBI' },
  { id: '63', name: 'Filmin' },
] as const;

const PROVIDER_REGIONS: Record<string, string[]> = {
  '63': ['ES', 'PT'],
};

export const watchRegionForFilters = (country?: string, provider?: string) => {
  const regions = provider ? PROVIDER_REGIONS[provider] : undefined;
  if (regions?.length) {
    if (country && regions.includes(country)) return country;
    return regions[0];
  }
  return country || 'US';
};

export const SEARCH_STUDIOS = [
  { id: '41077', name: 'A24' },
  { id: '10342', name: 'Studio Ghibli' },
  { id: '3', name: 'Pixar' },
  { id: '420', name: 'Marvel Studios' },
  { id: '174', name: 'Warner Bros.' },
  { id: '33', name: 'Universal Pictures' },
  { id: '4', name: 'Paramount' },
  { id: '25', name: '20th Century Studios' },
  { id: '5', name: 'Columbia Pictures' },
  { id: '21', name: 'MGM' },
  { id: '3172', name: 'Blumhouse' },
  { id: '9168', name: 'NEON' },
  { id: '10146', name: 'Focus Features' },
  { id: '1632', name: 'Lionsgate' },
  { id: '923', name: 'Legendary' },
  { id: '521', name: 'DreamWorks' },
  { id: '178464', name: 'Netflix' },
  { id: '3268', name: 'HBO' },
  { id: '20580', name: 'Amazon Studios' },
] as const;

export const SEARCH_CERTIFICATIONS = [
  { value: 'G', label: 'G' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'R', label: 'R' },
  { value: 'NC-17', label: 'NC-17' },
] as const;

export const SEARCH_THEMES = [
  { id: '10051', name: 'Heist' },
  { id: '4379', name: 'Time travel' },
  { id: '818', name: 'Based on a novel' },
  { id: '9672', name: 'True story' },
  { id: '9748', name: 'Revenge' },
  { id: '9715', name: 'Superhero' },
  { id: '12377', name: 'Zombie' },
  { id: '9882', name: 'Space' },
  { id: '10683', name: 'Coming of age' },
  { id: '163053', name: 'Found footage' },
] as const;

export const SEARCH_AWARDS = [
  { id: '337571', name: 'Oscar winner' },
  { id: '360635', name: 'Academy Awards' },
  { id: '337964', name: "Palme d'Or" },
  { id: '366594', name: 'Cannes' },
  { id: '368640', name: 'Sundance' },
  { id: '341034', name: 'Golden Globe' },
  { id: '334043', name: 'Emmy winner' },
] as const;

export interface SimilarTitle {
  id: string;
  title: string;
  media_type?: string;
  poster_path?: string | null;
}

export interface AdvancedSearchFilters {
  year?: string;
  genre?: string;
  people?: any[];
  rating?: number;
  country?: string;
  language?: string;
  sortBy?: string;
  runtime?: string;
  minVotes?: string;
  provider?: string;
  company?: string;
  certification?: string;
  keyword?: string;
  award?: string;
  similarToId?: string;
}

export const sortForContentType = (sortBy: string | undefined, contentType: 'movie' | 'tv') => {
  const sort = sortBy || 'popularity.desc';
  if (contentType === 'tv') {
    return sort
      .replace('primary_release_date', 'first_air_date')
      .replace('title.asc', 'name.asc')
      .replace('revenue.desc', 'popularity.desc');
  }
  return sort;
};

export const runtimeBounds = (runtime?: string) => {
  if (runtime === 'short') return { min: undefined, max: 89 };
  if (runtime === 'standard') return { min: 90, max: 150 };
  if (runtime === 'long') return { min: 151, max: undefined };
  return { min: undefined, max: undefined };
};

export const matchesRuntime = (minutes: number | undefined, runtime?: string) => {
  if (!runtime) return true;
  if (!minutes) return false;
  const { min, max } = runtimeBounds(runtime);
  if (min && minutes < min) return false;
  if (max && minutes > max) return false;
  return true;
};
