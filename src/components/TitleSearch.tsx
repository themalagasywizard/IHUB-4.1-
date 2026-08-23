import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { SimilarTitle } from '@/utils/searchFilters';

const apiKey = '650ff50a48a7379fd245c173ad422ff8';

interface TitleSearchProps {
  contentType: 'movie' | 'tv';
  selectedTitle: SimilarTitle | null;
  onSelect: (title: SimilarTitle) => void;
  onClear: () => void;
}

const TitleSearch = ({ contentType, selectedTitle, onSelect, onClear }: TitleSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SimilarTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/${contentType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await response.json();
        setResults(
          (data.results || [])
            .filter((item: any) => item.poster_path)
            .slice(0, 6)
            .map((item: any) => ({
              id: String(item.id),
              title: item.title || item.name,
              media_type: contentType,
              poster_path: item.poster_path,
            }))
        );
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, contentType]);

  if (selectedTitle) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md bg-[#1a1a1a] px-3 py-2">
        <span className="truncate text-sm">{selectedTitle.title}</span>
        <button
          type="button"
          onClick={onClear}
          className="text-white/50 hover:text-white"
          aria-label="Clear similar title"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 w-4 h-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={contentType === 'tv' ? 'Search a series...' : 'Search a movie...'}
          className="w-full rounded-md bg-[#1a1a1a] py-2 pl-8 pr-3 text-white outline-none placeholder:text-white/30"
        />
      </div>
      {(isLoading || results.length > 0) && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[#2a2a2a] bg-[#141414]">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-white/40">Searching...</p>
          )}
          {results.map((title) => (
            <button
              key={title.id}
              type="button"
              onClick={() => {
                onSelect(title);
                setQuery('');
                setResults([]);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#2a2a2a]"
            >
              {title.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${title.poster_path}`}
                  alt=""
                  className="h-12 w-8 rounded object-cover"
                />
              )}
              <span className="text-sm">{title.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitleSearch;
