import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Star, ArrowLeft, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import StarryBackground from '../components/StarryBackground';
import PersonSearch from '../components/PersonSearch';
import Settings from '../components/Settings';
import MediaDetails from '../components/MediaDetails';
import PasswordAuth from '../components/PasswordAuth';
import MediaNavigation from '../components/MediaNavigation';
import { Button } from '@/components/ui/button';
import { filterCategory, fetchTVSeries, fetchTVSeriesByCategory, handleSearch, fetchMovies, fetchPersonMovies, advancedSearch } from '../utils/mediaUtils';
import { determineMediaType } from '../utils/mediaTypeUtils';

interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  media_type?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  episode_run_time?: number[];
}

const categories = {
  '28': 'Action',
  '12': 'Adventure',
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '14': 'Fantasy',
  '36': 'History',
  '27': 'Horror',
  '10402': 'Music',
  '9648': 'Mystery',
  '10749': 'Romance',
  '878': 'Science Fiction',
  '10770': 'TV Movie',
  '53': 'Thriller',
  '10752': 'War',
  '37': 'Western'
};

const seriesCategories = {
  '10759': 'Action & Adventure',
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '10762': 'Kids',
  '9648': 'Mystery',
  '10763': 'News',
  '10764': 'Reality',
  '10765': 'Sci-Fi & Fantasy',
  '10766': 'Soap',
  '10767': 'Talk',
  '10768': 'War & Politics',
  '37': 'Western'
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchYear, setSearchYear] = useState<string>('');
  const [searchGenre, setSearchGenre] = useState<string>('');
  const [selectedPeople, setSelectedPeople] = useState<any[]>([]);
  const [searchCast, setSearchCast] = useState<string[]>([]);
  const [searchDirector, setSearchDirector] = useState<string[]>([]);
  const [searchRating, setSearchRating] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [selectedMediaDetails, setSelectedMediaDetails] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'general' | 'category' | 'person' | 'tv' | 'tvCategory' | 'search'>('general');

  const apiKey = '650ff50a48a7379fd245c173ad422ff8';

  useEffect(() => {
    // Handle person selection from home page
    if (location.state?.selectedPerson && location.state?.fromHome) {
      handlePersonClick(location.state.selectedPerson);
    }

    // Handle category selection from navigation
    if (location.state?.selectedCategory) {
      handleFilterCategory(location.state.selectedCategory);
    }

    // Handle TV series navigation
    if (location.state?.contentType === 'tv') {
      if (location.state.selectedCategory) {
        handleFetchTVSeriesByCategory(location.state.selectedCategory);
      } else {
        handleFetchTVSeries();
      }
    }

    // Handle search state from navigation
    if (location.state?.showSearch) {
      setShowSearch(true);
    }

    // Handle initial media selection
    const initialMedia = location.state?.initialMedia;
    if (initialMedia) {
      handleMediaClick(initialMedia);
    }

    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Only load initial movies if no specific state is provided
    if (!location.state?.selectedCategory && !location.state?.contentType && !location.state?.initialMedia) {
      loadInitialMovies();
    }
  }, []);

  const loadInitialMovies = async () => {
    const { results, total_pages } = await fetchMovies(1);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('general');
    setSelectedPerson(null);
    setSelectedCategory('all');
  };

  const showAllCategories = async () => {
    const { results, total_pages } = await fetchMovies(1);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('general');
    setSelectedPerson(null);
    setSelectedCategory('all');
  };

  const handleFilterCategory = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPerson(null);
    const { results, total_pages } = await filterCategory(categoryId);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('category');
  };

  const handleFetchTVSeries = async () => {
    setSelectedCategory('all');
    setSelectedPerson(null);
    const { results, total_pages } = await fetchTVSeries();
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('tv');
  };

  const handleFetchTVSeriesByCategory = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPerson(null);
    const { results, total_pages } = await fetchTVSeriesByCategory(categoryId);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('tvCategory');
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      let newResults;

      switch (currentView) {
        case 'person':
          if (selectedPerson) {
            const { results } = await fetchPersonMovies(selectedPerson, nextPage);
            newResults = results;
          }
          break;
        case 'category':
          if (selectedCategory !== 'all') {
            const { results } = await filterCategory(selectedCategory, nextPage);
            newResults = results;
          }
          break;
        case 'tv':
          const { results: tvResults } = await fetchTVSeries(nextPage);
          newResults = tvResults;
          break;
        case 'tvCategory':
          if (selectedCategory !== 'all') {
            const { results } = await fetchTVSeriesByCategory(selectedCategory, nextPage);
            newResults = results;
          }
          break;
        case 'search':
          // Add handling for advanced search pagination
          const { results: searchResults } = await advancedSearch(
            {
              year: searchYear,
              genre: searchGenre,
              people: selectedPeople,
              rating: searchRating
            },
            contentType,
            nextPage // Pass the page number to advancedSearch
          );
          newResults = searchResults;
          break;
        default:
          const { results } = await fetchMovies(nextPage);
          newResults = results;
      }

      if (newResults) {
        setMovies(prevMovies => [...prevMovies, ...newResults]);
        setPage(nextPage);
        // Update hasMoreResults based on whether we're at the last page
        setHasMoreResults(nextPage < totalPages);
      }
    }
  };

  const performSearch = async () => {
    const results = await advancedSearch(
      {
        year: searchYear,
        genre: searchGenre,
        people: selectedPeople,
        rating: searchRating
      },
      contentType
    );
    
    setMovies(results.results);
    setTotalPages(results.total_pages);
    setHasMoreResults(results.total_pages > 1);
    setShowSearch(false);
    setSearchQuery('');
    setCurrentView('search');
    setPage(1);
  };

  const handleSearchQuery = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await handleSearch(query);
      setSearchResults(results);
      // Update URL state to preserve search context
      navigate('/browse', { 
        state: { showSearch: true },
        replace: true 
      });
    } else {
      setSearchResults([]);
    }
  };

  const toggleFavorite = (media: Movie) => {
    const newFavorites = favorites.some(fav => fav.id === media.id)
      ? favorites.filter(fav => fav.id !== media.id)
      : [...favorites, media];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (mediaId: string) => {
    return favorites.some(fav => fav.id === mediaId);
  };

  const handleMediaClick = async (media: Movie) => {
    setSelectedMedia(media);
    const mediaType = determineMediaType(media);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${media.id}?api_key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const details = await response.json();
      details.media_type = mediaType;
      setSelectedMediaDetails(details);
    } catch (error) {
      console.error('Error fetching media details:', error);
      setSelectedMedia(null);
      setSelectedMediaDetails(null);
    }
  };

  const handlePersonClick = async (personId: number) => {
    // Ensure personId is a number
    const id = parseInt(personId.toString());
    setSelectedPerson(personId);
    setSelectedCategory('all');
    setSelectedMedia(null);
    setSelectedMediaDetails(null);
    setShowSearch(false);
    const { results, total_pages } = await fetchPersonMovies(id);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
    setCurrentView('person');
  };

  const closePlayer = () => {
    setShowPlayer(false);
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }
    }
  };

  const playMedia = (id: string, type: string, specificUrl?: string) => {
    setSelectedMedia(null);
    setSelectedMediaDetails(null);
    setShowPlayer(true);
    
    // Try vidsrc.to first for better mobile compatibility
    const primaryUrl = specificUrl || (type === 'movie'
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}/1/1`);

    // Prepare fallback URL using vidsrc.me
    const fallbackUrl = type === 'movie'
      ? `https://vidsrc.me/embed/movie?tmdb=${id}`
      : `https://vidsrc.me/embed/tv?tmdb=${id}&season=1&episode=1`;
    
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }

      // Create container for iframe
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'relative w-full aspect-video max-h-[600px]';
      videoContainer.appendChild(iframeContainer);

      // Add loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-black rounded-lg';
      loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#ea384c] border-t-transparent"></div>
      `;
      iframeContainer.appendChild(loadingDiv);

      // Create and configure iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'absolute inset-0 w-full h-full rounded-lg shadow-lg bg-black';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      iframe.setAttribute('loading', 'eager');
      iframe.setAttribute('importance', 'high');
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 0.3s ease';

      // Add iframe to container
      iframeContainer.appendChild(iframe);

      let loadAttempts = 0;
      const maxAttempts = 2;

      const tryLoadSource = (url: string) => {
        loadAttempts++;
        iframe.src = url;

        const handleLoad = () => {
          iframe.style.opacity = '1';
          loadingDiv.remove();
          iframe.removeEventListener('load', handleLoad);
          iframe.removeEventListener('error', handleError);
        };

        const handleError = () => {
          if (loadAttempts < maxAttempts) {
            console.log(`Attempt ${loadAttempts}: Trying fallback source...`);
            iframe.removeEventListener('load', handleLoad);
            iframe.removeEventListener('error', handleError);
            tryLoadSource(fallbackUrl);
          } else {
            loadingDiv.innerHTML = `
              <div class="text-center text-white">
                <p class="mb-2">Unable to load video</p>
                <button onclick="location.reload()" class="px-4 py-2 bg-[#ea384c] rounded-md hover:bg-[#ff4d63]">
                  Retry
                </button>
              </div>
            `;
          }
        };

        iframe.addEventListener('load', handleLoad);
        iframe.addEventListener('error', handleError);

        // Set a timeout for source loading
        setTimeout(() => {
          if (loadingDiv.parentNode && loadAttempts < maxAttempts) {
            handleError();
          }
        }, 10000);
      };

      // Start with primary source
      tryLoadSource(primaryUrl);

      setShowPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const toggleDyslexicFont = () => {
    setIsDyslexicFont(!isDyslexicFont);
    if (!isDyslexicFont) {
      document.body.classList.add('dyslexic');
    } else {
      document.body.classList.remove('dyslexic');
    }
  };

  const handleEpisodeSelect = (seasonNum: number, episodeNum: number) => {
    if (selectedMedia) {
      const url = `https://vidsrc.to/embed/tv/${selectedMedia.id}/${seasonNum}/${episodeNum}`;
      playMedia(selectedMedia.id, 'tv', url);
    }
  };

  if (!isAuthenticated) {
    return <PasswordAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white relative select-none">
      <StarryBackground />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(20,20,20,0.95)] backdrop-blur-md shadow-lg shadow-black/50 border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex items-center">
            <MediaNavigation
              categories={categories}
              seriesCategories={seriesCategories}
              onShowAll={showAllCategories}
              onFilterCategory={handleFilterCategory}
              onFetchTVSeries={handleFetchTVSeries}
              onFetchTVSeriesByCategory={handleFetchTVSeriesByCategory}
            />
          </nav>
          
          <div className="flex items-center absolute left-1/2 -translate-x-1/2">
            <img 
              src="https://i.imgur.com/hcwPIIr.png"
              alt="iHub"
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity select-none"
              onClick={() => {
                // Clear video container
                const videoContainer = document.getElementById('video-container');
                if (videoContainer) {
                  while (videoContainer.firstChild) {
                    videoContainer.removeChild(videoContainer.firstChild);
                  }
                }
                // Reset all states and reload home page
                window.location.href = '/';
              }}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`p-2 rounded-full transition-colors ${
                showFavorites ? 'bg-[rgba(234,56,76,0.1)] text-[#ea384c]' : 'hover:bg-[rgba(234,56,76,0.1)]'
              }`}
            >
              <Star className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
            </button>
            
            <Settings
              currentLanguage={currentLanguage}
              isDyslexicFont={isDyslexicFont}
              onLanguageChange={handleLanguageChange}
              onToggleDyslexicFont={toggleDyslexicFont}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto pt-20 relative z-10">
        <div id="video-container" className="mb-8 relative" />
        
        {selectedMediaDetails && (
          <MediaDetails
            id={selectedMedia?.id || ''}
            title={selectedMediaDetails.title || selectedMediaDetails.name}
            overview={selectedMediaDetails.overview}
            rating={selectedMediaDetails.vote_average}
            posterPath={selectedMediaDetails.poster_path}
            mediaType={selectedMedia?.media_type || 'movie'}
            isFavorite={isFavorite(selectedMedia?.id || '')}
            onToggleFavorite={() => selectedMedia && toggleFavorite(selectedMedia)}
            onBack={() => {
              setSelectedMedia(null);
              setSelectedMediaDetails(null);
            }}
            onSelectEpisode={handleEpisodeSelect}
            onPersonClick={handlePersonClick}
            onPlayMovie={(id) => playMedia(id, 'movie')}
          />
        )}

        {showSearch && (
          <div className="fixed inset-0 bg-[#141414]/95 z-50 p-4 overflow-y-auto">
            <div className="max-w-5xl mx-auto pt-20">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchYear('');
                      setSearchGenre('');
                      setSearchCast([]);
                      setSearchDirector([]);
                      setSearchRating(0);
                      setShowAdvancedSearch(false);
                      setSearchResults([]);
                    }}
                    className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors text-[#ea384c]"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchYear('');
                        setSearchGenre('');
                        setSearchCast([]);
                        setSearchDirector([]);
                        setSearchRating(0);
                        setShowAdvancedSearch(false);
                        setSearchResults([]);
                      }
                    }}
                    placeholder="Search movies and TV shows..."
                    className="w-full p-4 bg-[#2a2a2a] rounded-lg text-white placeholder:text-white/50 border-none outline-none select-text"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className={`px-4 py-2 ${showAdvancedSearch ? 'bg-[rgba(234,56,76,0.1)] text-[#ea384c]' : ''}`}
                  >
                    Advanced
                  </Button>
                </div>
                
                {!showAdvancedSearch && searchResults.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8 pb-20 animate-fade-in">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        className={`relative group transition-transform duration-300 hover:scale-105 cursor-pointer animate-fade-in
                          ${result.media_type === 'person' ? 'aspect-square' : 'aspect-[2/3]'}`}
                        onClick={() => {
                          if (result.media_type === 'person') {
                            handlePersonClick(result.id);
                            setShowSearch(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          } else {
                            handleMediaClick(result);
                            setShowSearch(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }
                        }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${
                            result.media_type === 'person' ? result.profile_path : result.poster_path
                          }`}
                          alt={result.title || result.name}
                          className={`w-full h-full object-cover rounded-lg ${
                            result.media_type === 'person' ? 'rounded-full' : ''
                          }`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                          ${result.media_type === 'person' ? 'rounded-full' : 'rounded-lg'}"
                        >
                          <div className="absolute bottom-2 left-2 right-2 text-center text-white">
                            {result.title || result.name}
                            {result.media_type === 'person' && (
                              <p className="text-xs text-[#ea384c] mt-1">
                                {result.known_for_department || 'Actor'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showAdvancedSearch && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#2a2a2a] p-6 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Content Type</label>
                        <ToggleGroup
                          type="single"
                          value={contentType}
                          onValueChange={(value) => {
                            if (value) setContentType(value as 'movie' | 'tv');
                          }}
                          className="bg-[#1a1a1a] p-1 rounded-md w-full flex"
                        >
                          <ToggleGroupItem
                            value="movie"
                            aria-label="Movies Only"
                            className="flex-1 data-[state=on]:bg-[#ea384c] data-[state=on]:text-white"
                          >
                            Movies
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="tv"
                            aria-label="TV Series Only"
                            className="flex-1 data-[state=on]:bg-[#ea384c] data-[state=on]:text-white"
                          >
                            Series
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Year</label>
                        <input
                          type="text"
                          value={searchYear}
                          onChange={(e) => {
                            setSearchYear(e.target.value);
                          }}
                          placeholder="e.g., 2023 or 2000-2010"
                          className="w-full p-2 bg-[#1a1a1a] rounded-md text-white placeholder:text-white/30 border-none outline-none"
                        />
                      </div>
                  
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Genre</label>
                        <select
                          value={searchGenre}
                          onChange={(e) => {
                            setSearchGenre(e.target.value);
                          }}
                          className="w-full p-2 bg-[#1a1a1a] rounded-md text-white border-none outline-none"
                        >
                          <option value="">All Genres</option>
                          {Object.entries(contentType === 'tv' ? seriesCategories : 
                            contentType === 'movie' ? categories :
                            {...categories, ...seriesCategories}).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                          ))}
                        </select>
                      </div>
                  
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Cast & Crew</label>
                        <PersonSearch
                          selectedPeople={selectedPeople}
                          onPersonSelect={(person) => setSelectedPeople([...selectedPeople, person])}
                          onPersonRemove={(personId) => setSelectedPeople(selectedPeople.filter(p => p.id !== personId))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Minimum Rating</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={searchRating}
                            onChange={(e) => {
                              setSearchRating(parseFloat(e.target.value));
                            }}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">{searchRating > 0 ? searchRating : 'Any'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={performSearch}
                        className="bg-[#ea384c] hover:bg-[#ff4d63] px-12 py-6 text-lg font-medium"
                      >
                        Search
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showFavorites ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
            {favorites.map((movie, index) => (
              <div 
                key={`${movie.id}-${index}`}
                className="relative group transition-all duration-300 hover:scale-110 animate-fade-in aspect-[2/3]"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
                onClick={() => handleMediaClick(movie)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover rounded-lg shadow-[0_0_15px_rgba(234,56,76,0.3)] 
                           transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(234,56,76,0.5)]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              rounded-lg">
                  <p className="absolute bottom-2 left-2 right-2 text-center text-white text-sm
                              font-medium">
                    {movie.title || movie.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
            {movies.map((movie, index) => (
              <div 
                key={`${movie.id}-${index}`}
                className="relative group transition-all duration-300 hover:scale-110 animate-fade-in aspect-[2/3]"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
                onClick={() => handleMediaClick(movie)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover rounded-lg shadow-[0_0_15px_rgba(234,56,76,0.3)] 
                           transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(234,56,76,0.5)]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              rounded-lg">
                  <p className="absolute bottom-2 left-2 right-2 text-center text-white text-sm
                              font-medium">
                    {movie.title || movie.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showFavorites && movies.length > 0 && page < totalPages && (
          <div className="flex justify-center mt-8 mb-12">
            <Button
              onClick={loadMore}
              className="bg-[#ea384c] hover:bg-[#ff4d63]"
            >
              Load More
            </Button>
          </div>
        )}
      </main>

      <footer className="mt-8 pb-12 text-center text-sm text-gray-400">
        <p className="font-medium">
          © Copyright {new Date().getFullYear()} by{' '}
          <span className="text-[#ea384c] hover:text-[#ff4d63] transition-colors duration-300">
            Oz
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Index;