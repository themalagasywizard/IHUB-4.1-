import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import MediaDetails from '../components/MediaDetails';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import StarryBackground from '../components/StarryBackground';
import { filterCategory, fetchTrending, fetchTopRated, fetchInCinema, fetchClassics, fetchTopSeries, fetchPersonMovies, fetchDirectorMovies } from '../utils/mediaUtils';
import Settings from '../components/Settings';
import MediaNavigation from '../components/MediaNavigation';
import { Button } from '@/components/ui/button';

interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  media_type?: string;
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

const homeCategories = [
  { 
    id: 'trending', 
    name: 'Trending Now'
  },
  { 
    id: 'top-rated', 
    name: 'Top Rated'
  },
  { 
    id: 'in-cinema', 
    name: 'In Cinema'
  },
  { 
    id: 'genre-spotlight', 
    name: 'Genre'
  },
  { 
    id: 'classics', 
    name: 'Classic Collections'
  },
  { 
    id: 'top-series', 
    name: 'Top Series'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [categoryContent, setCategoryContent] = useState<Record<string, Movie[]>>({});
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [selectedMediaDetails, setSelectedMediaDetails] = useState<any | null>(null);
  const [currentGenre, setCurrentGenre] = useState<string>('');
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [personMovies, setPersonMovies] = useState<Movie[]>([]);
  const [personPage, setPersonPage] = useState(1);
  const [personTotalPages, setPersonTotalPages] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const apiKey = '650ff50a48a7379fd245c173ad422ff8';

  const loadCategoryContent = async () => {
    try {
      const content: Record<string, Movie[]> = {};
      const usedIds = new Set<string>();
      const usedTitles = new Set<string>();

      for (const category of homeCategories) {
        try {
          let results: Movie[] = [];
          let response;
          
          // Function to check if content is unique
          const isUnique = (item: Movie) => {
            const title = item.title?.toLowerCase() || item.name?.toLowerCase();
            if (usedIds.has(item.id) || (title && usedTitles.has(title))) {
              return false;
            }
            usedIds.add(item.id);
            if (title) usedTitles.add(title);
            return true;
          };

          switch (category.id) {
            case 'trending':
              response = await fetchTrending(1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: item.media_type || 'movie'
              })).slice(0, 20);
              break;
              
            case 'top-rated':
              response = await fetchTopRated('movie', 1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: 'movie'
              })).slice(0, 20);
              break;
              
            case 'in-cinema':
              response = await fetchInCinema(1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: 'movie'
              })).slice(0, 20);
              break;
              
            case 'genre-spotlight':
              const genreIds = Object.keys(categories);
              const randomGenreId = genreIds[Math.floor(Math.random() * genreIds.length)];
              setCurrentGenre(categories[randomGenreId]);
              response = await filterCategory(randomGenreId, 1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: 'movie'
              })).slice(0, 20);
              break;
              
            case 'classics':
              response = await fetchClassics(1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: 'movie'
              })).slice(0, 20);
              break;
              
            case 'top-series':
              response = await fetchTopSeries(1);
              results = response.results
              .filter(isUnique)
              .map(item => ({
                ...item,
                media_type: 'tv'
              })).slice(0, 20);
              break;
              
            default:
              results = [];
          }

          content[category.id] = results;
        } catch (error) {
          console.error(`Error loading content for ${category.name}:`, error);
          content[category.id] = [];
        }
      }

      setCategoryContent(content);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleGenreSpotlightClick = async () => {
    try {
      const genreIds = Object.keys(categories);
      const randomGenreId = genreIds[Math.floor(Math.random() * genreIds.length)];
      setCurrentGenre(categories[randomGenreId]);
      const response = await filterCategory(randomGenreId, 1);
      const results = response.results
        .map(item => ({
          ...item,
          media_type: 'movie'
        }))
        .slice(0, 20);
      
      setCategoryContent(prev => ({
        ...prev,
        'genre-spotlight': results
      }));
    } catch (error) {
      console.error('Error updating genre spotlight:', error);
    }
  };

  useEffect(() => {
    loadCategoryContent(); // Load all categories initially
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

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

  const navigateToSearch = () => {
    // Navigate to browse page with search context
    navigate('/browse', { 
      state: { 
        showSearch: true 
      }
    });
  };

  const handleFilterCategory = (categoryId: string) => {
    navigate('/browse', { state: { selectedCategory: categoryId } });
  };

  const handleFetchTVSeries = () => {
    navigate('/browse', { state: { contentType: 'tv' } });
  };

  const handleFetchTVSeriesByCategory = (categoryId: string) => {
    navigate('/browse', { state: { contentType: 'tv', selectedCategory: categoryId } });
  };

  const handleMediaClick = async (media: Movie) => {
    setSelectedMedia(media);
    const mediaType = media.media_type || 'movie';
    
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

  const handleEpisodeSelect = (seasonNum: number, episodeNum: number) => {
    if (selectedMedia) {
      const url = `https://vidsrc.to/embed/tv/${selectedMedia.id}/${seasonNum}/${episodeNum}`;
      playMedia(selectedMedia.id, 'tv', url);
    }
  };

  const playMedia = (id: string, type: string, specificUrl?: string) => {
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

      // Clear media details after video is loaded
      setSelectedMedia(null);
      setSelectedMediaDetails(null);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePersonClick = async (personId: number) => {
    // Close media details immediately
    setSelectedMedia(null);
    setSelectedMediaDetails(null);

    setSelectedPerson(personId);
    setPersonPage(1);

    try {
      // First check if the person is a director
      const personResponse = await fetch(
        `https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}`
      );
      const personData = await personResponse.json();

      // If they are known for directing, use fetchDirectorMovies
      if (personData.known_for_department === 'Directing') {
        const { results, total_pages } = await fetchDirectorMovies(personId);
        setPersonMovies(results);
        setPersonTotalPages(total_pages);
      } else {
        // Otherwise use fetchPersonMovies for actors and other crew
        const { results, total_pages } = await fetchPersonMovies(personId);
        setPersonMovies(results);
        setPersonTotalPages(total_pages);
      }

      setShowFavorites(false);
    } catch (error) {
      console.error('Error fetching person movies:', error);
    }
  };

  const loadMorePersonMovies = async () => {
    if (selectedPerson && personPage < personTotalPages) {
      const nextPage = personPage + 1;
      try {
        // First check if the person is a director
        const personResponse = await fetch(
          `https://api.themoviedb.org/3/person/${selectedPerson}?api_key=${apiKey}`
        );
        const personData = await personResponse.json();

        // Use appropriate function based on their role
        const { results } = personData.known_for_department === 'Directing'
          ? await fetchDirectorMovies(selectedPerson, nextPage)
          : await fetchPersonMovies(selectedPerson, nextPage);

        setPersonMovies(prevMovies => [...prevMovies, ...results]);
        setPersonPage(nextPage);
      } catch (error) {
        console.error('Error loading more movies:', error);
      }
    }
  };

  const renderContent = () => {
    if (showFavorites) {
      return (
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(movie);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-[rgba(234,56,76,0.1)] text-[#ea384c]"
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (selectedPerson) {
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
            {personMovies.map((movie, index) => (
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(movie);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                      isFavorite(movie.id) 
                        ? 'bg-[rgba(234,56,76,0.1)] text-[#ea384c]' 
                        : 'hover:bg-[rgba(234,56,76,0.1)]'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {personPage < personTotalPages && (
            <div className="flex justify-center mt-8 mb-12">
              <Button
                onClick={loadMorePersonMovies}
                className="bg-[#ea384c] hover:bg-[#ff4d63]"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="space-y-12">
          {homeCategories.map((category) => (
            <section key={category.id} className="relative">
              <div className="flex items-center justify-between mb-4">
                {category.id === 'genre-spotlight' ? (
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <select
                      value={Object.entries(categories).find(([_, name]) => name === currentGenre)?.[0] || ''}
                      onChange={(e) => {
                        const genreId = e.target.value;
                        setCurrentGenre(categories[genreId]);
                        filterCategory(genreId, 1).then(response => {
                          setCategoryContent(prev => ({
                            ...prev,
                            'genre-spotlight': response.results.map(item => ({
                              ...item,
                              media_type: 'movie'
                            }))
                          }));
                        });
                      }}
                      className="bg-[#2a2a2a] text-white border-none rounded-lg px-4 py-2 text-lg font-medium
                               hover:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#ea384c] transition-colors"
                    >
                      {Object.entries(categories).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                    <Button
                      onClick={() => {
                        const genreId = Object.entries(categories).find(([_, name]) => name === currentGenre)?.[0] || '';
                        filterCategory(genreId, 1).then(response => {
                          // Shuffle the results array to get random order
                          const shuffledResults = [...response.results]
                            .sort(() => Math.random() - 0.5)
                            .map(item => ({
                              ...item,
                              media_type: 'movie'
                            }));
                          
                          setCategoryContent(prev => ({
                            ...prev,
                            'genre-spotlight': shuffledResults
                          }));
                        });
                      }}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-[rgba(234,56,76,0.1)]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                )}
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: true
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 cursor-grab active:cursor-grabbing">
                  {categoryContent[category.id]?.map((item) => (
                    <CarouselItem key={item.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <div 
                        className="relative aspect-[2/3] cursor-pointer group"
                        onClick={() => handleMediaClick(item)}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover rounded-lg shadow-[0_0_15px_rgba(234,56,76,0.3)] 
                                   transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(234,56,76,0.5)]
                                   group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                    rounded-lg">
                          <p className="absolute bottom-2 left-2 right-2 text-center text-white text-sm
                                    font-medium">
                            {item.title || item.name}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                              isFavorite(item.id) 
                                ? 'bg-[rgba(234,56,76,0.1)] text-[#ea384c]' 
                                : 'hover:bg-[rgba(234,56,76,0.1)]'
                            }`}
                          >
                            <Star className={`w-5 h-5 ${isFavorite(item.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </section>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white relative">
      <StarryBackground />

      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(20,20,20,0.95)] backdrop-blur-md shadow-lg shadow-black/50 border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex items-center">
            <MediaNavigation
              categories={categories}
              seriesCategories={seriesCategories}
              onShowAll={() => navigate('/browse')}
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
              onClick={navigateToSearch}
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

      <div id="video-container" className="container mx-auto pt-24 pb-8 relative" />

      <main className="container mx-auto pt-8 pb-12">
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

        {renderContent()}
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

export default Home;