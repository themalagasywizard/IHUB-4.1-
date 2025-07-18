import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, ArrowLeft, Tv, Users, Calendar, Search, Star, Clock, Trophy, RefreshCw } from 'lucide-react';
import { protectIframe, initializeBlockers } from '../utils/contentBlocker';
import { sportsDataService, LiveSportsEvent, SportType, formatTimeUntilEvent, getSportEmoji } from '../utils/sportsDataService';
import StarryBackground from './StarryBackground';
import Settings from './Settings';
import MediaNavigation from './MediaNavigation';

interface SportsChannel {
  id: string;
  name: string;
  description: string;
  embedUrl: string;
  category: string;
  isLive: boolean;
  event?: string;
}

const sportsChannels: SportsChannel[] = [
  {
    id: 'bein-sports-1-fr',
    name: 'beIN Sports 1 FR',
    description: 'French sports channel featuring Wimbledon Final',
    embedUrl: 'https://daddylive2.top/my/stream-116.php',
    category: 'Tennis',
    isLive: true,
    event: 'Wimbledon Final'
  },
  {
    id: 'bein-sports-2-fr',
    name: 'beIN Sports 2 FR',
    description: 'French sports channel with live football',
    embedUrl: 'https://daddylive2.top/my/stream-117.php',
    category: 'Football',
    isLive: true,
    event: 'Live Football'
  },
  {
    id: 'sky-sports-main',
    name: 'Sky Sports Main Event',
    description: 'Premier UK sports channel',
    embedUrl: 'https://daddylive2.top/my/stream-1.php',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  },
  {
    id: 'espn-usa',
    name: 'ESPN USA',
    description: 'American sports network',
    embedUrl: 'https://daddylive2.top/my/stream-8.php',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  },
  {
    id: 'bt-sport-1',
    name: 'BT Sport 1',
    description: 'British sports channel',
    embedUrl: 'https://daddylive2.top/my/stream-2.php',
    category: 'Football',
    isLive: true,
    event: 'Premier League'
  },
  {
    id: 'eurosport-1',
    name: 'Eurosport 1',
    description: 'European sports channel',
    embedUrl: 'https://daddylive2.top/my/stream-15.php',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  }
];

// Movie/Series categories for navigation consistency
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

const SportsStreaming = () => {
  const navigate = useNavigate();
  
  // Real-time sports data state
  const [liveEvents, setLiveEvents] = useState<LiveSportsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveSportsEvent | null>(null);
  const [selectedSport, setSelectedSport] = useState<SportType | 'All'>('All');
  const [availableSports, setAvailableSports] = useState<SportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Legacy channel state (will be phased out)
  const [selectedChannel, setSelectedChannel] = useState<SportsChannel | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const sportsCategories = ['All', 'Tennis', 'Football', 'Mixed Sports'];

  // Auto-refresh real-time sports data
  useEffect(() => {
    let refreshInterval: any;

    const fetchSportsData = async () => {
      try {
        setIsLoading(true);
        const [events, sports] = await Promise.all([
          sportsDataService.getLiveSportsEvents(),
          sportsDataService.getAvailableSports()
        ]);
        
        setLiveEvents(events);
        setAvailableSports(sports);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch sports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchSportsData();

    // Set up auto-refresh every 30 seconds
    refreshInterval = setInterval(fetchSportsData, 30000);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Filter channels based on selected category (legacy)
  const filteredChannels = selectedCategory === 'All' 
    ? sportsChannels 
    : sportsChannels.filter(channel => channel.category === selectedCategory);

  // Filter events based on selected sport (new)
  const filteredEvents = selectedSport === 'All' 
    ? liveEvents 
    : liveEvents.filter(event => event.sport === selectedSport);

  // Initialize enhanced content blockers on component mount
  useEffect(() => {
    console.log('Initializing enhanced content blockers for sports streaming...');
    initializeBlockers();
  }, []);

  // Navigation handlers to maintain consistency
  const handleShowAll = () => {
    navigate('/browse');
  };

  const handleFilterCategory = (categoryId: string) => {
    navigate('/browse', { state: { category: categoryId } });
  };

  const handleFetchTVSeries = () => {
    navigate('/browse', { state: { showSeries: true } });
  };

  const handleFetchTVSeriesByCategory = (categoryId: string) => {
    navigate('/browse', { state: { showSeries: true, category: categoryId } });
  };

  const handleShowSports = () => {
    // Already on sports page
  };

  const navigateToSearch = () => {
    navigate('/browse');
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const toggleDyslexicFont = () => {
    setIsDyslexicFont(!isDyslexicFont);
  };

  const refreshSportsData = async () => {
    setIsLoading(true);
    try {
      sportsDataService.clearCache();
      const [events, sports] = await Promise.all([
        sportsDataService.getLiveSportsEvents(),
        sportsDataService.getAvailableSports()
      ]);
      
      setLiveEvents(events);
      setAvailableSports(sports);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh sports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to play live events
  const playEvent = (event: LiveSportsEvent) => {
    setSelectedEvent(event);
    setSelectedChannel(null); // Clear legacy channel
    setShowPlayer(true);
    
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      // Clear existing content
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }

      // Create container for iframe
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'relative w-full aspect-video max-h-[600px] bg-black rounded-lg overflow-hidden';
      videoContainer.appendChild(iframeContainer);

      // Add loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-black rounded-lg';
      loadingDiv.innerHTML = `
        <div class="text-center text-white">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#ea384c] border-t-transparent mx-auto mb-4"></div>
          <p class="text-lg font-medium">Loading ${event.tournament}...</p>
          <p class="text-sm text-gray-400 mt-2">${event.homeTeam} vs ${event.awayTeam}</p>
        </div>
      `;
      iframeContainer.appendChild(loadingDiv);

      // Select best streaming source
      const bestSource = event.streamingSources
        .sort((a, b) => b.reliability - a.reliability)[0];

      if (bestSource) {
        // Create and configure iframe with better streaming compatibility
        const iframe = document.createElement('iframe');
        iframe.className = 'absolute inset-0 w-full h-full rounded-lg shadow-lg bg-black';
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; accelerometer; gyroscope');
        iframe.setAttribute('loading', 'eager');
        iframe.setAttribute('importance', 'high');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('referrerpolicy', 'origin-when-cross-origin');
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.3s ease';
        iframe.src = bestSource.url;

        // Apply content blocker protection
        try {
          protectIframe(iframe);
        } catch (error) {
          console.warn('Iframe protection failed:', error);
        }

        // Add iframe to container
        iframeContainer.appendChild(iframe);

        const handleLoad = () => {
          iframe.style.opacity = '1';
          loadingDiv.remove();
          console.log(`${event.tournament} loaded successfully from ${bestSource.name}`);
        };

        const handleError = () => {
          console.error(`Failed to load ${event.tournament} from ${bestSource.name}`);
          loadingDiv.innerHTML = `
            <div class="text-center text-white">
              <p class="text-lg font-medium text-red-400">Failed to load ${event.tournament}</p>
              <p class="text-sm text-gray-400 mt-2">Please try again later</p>
            </div>
          `;
        };

        iframe.addEventListener('load', handleLoad);
        iframe.addEventListener('error', handleError);

        // Scroll to video container
        videoContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Legacy function to play channels
  const playChannel = (channel: SportsChannel) => {
    setSelectedChannel(channel);
    setSelectedEvent(null); // Clear new event
    setShowPlayer(true);
    
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      // Clear existing content
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }

      // Create container for iframe
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'relative w-full aspect-video max-h-[600px] bg-black rounded-lg overflow-hidden';
      videoContainer.appendChild(iframeContainer);

      // Add loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-black rounded-lg';
      loadingDiv.innerHTML = `
        <div class="text-center text-white">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#ea384c] border-t-transparent mx-auto mb-4"></div>
          <p class="text-lg font-medium">Loading ${channel.name}...</p>
          <p class="text-sm text-gray-400 mt-2">${channel.event || 'Live Sports'}</p>
        </div>
      `;
      iframeContainer.appendChild(loadingDiv);

      // Create and configure iframe with better streaming compatibility
      const iframe = document.createElement('iframe');
      iframe.className = 'absolute inset-0 w-full h-full rounded-lg shadow-lg bg-black';
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; accelerometer; gyroscope');
      iframe.setAttribute('loading', 'eager');
      iframe.setAttribute('importance', 'high');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('referrerpolicy', 'origin-when-cross-origin');
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 0.3s ease';
      iframe.src = channel.embedUrl;

      // Apply content blocker protection
      try {
        protectIframe(iframe);
      } catch (error) {
        console.warn('Iframe protection failed:', error);
      }

      // Add iframe to container
      iframeContainer.appendChild(iframe);

      const handleLoad = () => {
        iframe.style.opacity = '1';
        loadingDiv.remove();
        console.log(`${channel.name} loaded successfully`);
      };

      const handleError = () => {
        console.error(`Failed to load ${channel.name}`);
        loadingDiv.innerHTML = `
          <div class="text-center text-white">
            <p class="text-lg font-medium text-red-400">Failed to load ${channel.name}</p>
            <p class="text-sm text-gray-400 mt-2">Please try again later</p>
          </div>
        `;
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Scroll to video container
      videoContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setSelectedChannel(null);
    setSelectedEvent(null);
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }
    }
  };

  const getEventStatusBadge = (event: LiveSportsEvent) => {
    switch (event.status) {
      case 'live':
        return (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center gap-1 text-xs text-blue-500">
            <Clock className="w-3 h-3" />
            {formatTimeUntilEvent(event.startTime)}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            FINISHED
          </div>
        );
    }
  };

  const getScoreDisplay = (event: LiveSportsEvent) => {
    if (event.homeScore !== undefined && event.awayScore !== undefined) {
      return `${event.homeScore} - ${event.awayScore}`;
    }
    return event.status === 'live' ? 'LIVE' : '';
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white relative">
      <StarryBackground />

      {/* Main iHub Header - Same as Home/Index */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(20,20,20,0.95)] backdrop-blur-md shadow-lg shadow-black/50 border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex items-center">
            <MediaNavigation
              categories={categories}
              seriesCategories={seriesCategories}
              onShowAll={handleShowAll}
              onFilterCategory={handleFilterCategory}
              onFetchTVSeries={handleFetchTVSeries}
              onFetchTVSeriesByCategory={handleFetchTVSeriesByCategory}
              onShowSports={handleShowSports}
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
                // Navigate to home
                navigate('/');
              }}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateToSearch}
              className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors"
              disabled
            >
              <Star className="w-5 h-5" />
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

      {/* Video Container - Same as Home/Index */}
      <div id="video-container" className="container mx-auto pt-24 pb-8 relative" />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8">
        {/* Back Button when player is active */}
        {showPlayer && (selectedChannel || selectedEvent) && (
          <div className="mb-6">
            <Button
              onClick={closePlayer}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-none"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Live Sports
            </Button>
            
            {/* Event Info */}
            {selectedEvent && (
              <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getSportEmoji(selectedEvent.sport)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedEvent.tournament}</h3>
                    <p className="text-gray-300">{selectedEvent.league}</p>
                  </div>
                  {selectedEvent.isHighProfile && (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold">
                    {selectedEvent.homeTeam} vs {selectedEvent.awayTeam}
                  </div>
                  <div className="text-lg font-bold text-[#ea384c]">
                    {getScoreDisplay(selectedEvent)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {getEventStatusBadge(selectedEvent)}
                  {selectedEvent.venue && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                  )}
                  {selectedEvent.country && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedEvent.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legacy Channel Info */}
            {selectedChannel && !selectedEvent && (
              <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                <h3 className="text-xl font-bold text-white mb-2">{selectedChannel.name}</h3>
                <p className="text-gray-300 mb-2">{selectedChannel.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedChannel.event || 'Live Sports'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedChannel.category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sports Content when no player is active */}
        {!showPlayer && (
          <>
            {/* Sports Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    <Tv className="w-8 h-8 text-[#ea384c]" />
                    Live Sports Streaming
                  </h1>
                  <Button
                    onClick={refreshSportsData}
                    disabled={isLoading}
                    className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-none"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <div className="text-sm text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
              <p className="text-gray-400 text-lg">Watch live sports from around the world - Updated every 30 seconds</p>
            </div>

            {/* Toggle between Real-time and Legacy */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setSelectedSport('All')}
                  className={`${
                    selectedSport !== 'Legacy'
                      ? 'bg-[#ea384c] hover:bg-[#ff4d63]'
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                  } text-white border-none transition-colors`}
                >
                  🔴 Live Events ({liveEvents.length})
                </Button>
                <Button
                  onClick={() => setSelectedSport('Legacy' as any)}
                  className={`${
                    selectedSport === 'Legacy'
                      ? 'bg-[#ea384c] hover:bg-[#ff4d63]'
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                  } text-white border-none transition-colors`}
                >
                  📺 Static Channels ({sportsChannels.length})
                </Button>
              </div>

              {/* Sport Filters for Real-time Events */}
              {selectedSport !== 'Legacy' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setSelectedSport('All')}
                    className={`${
                      selectedSport === 'All'
                        ? 'bg-[#ea384c] hover:bg-[#ff4d63]'
                        : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                    } text-white border-none transition-colors`}
                  >
                    🏆 All Sports
                  </Button>
                  {availableSports.map(sport => {
                    const eventCount = liveEvents.filter(event => event.sport === sport).length;
                    return (
                      <Button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`${
                          selectedSport === sport
                            ? 'bg-[#ea384c] hover:bg-[#ff4d63]'
                            : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                        } text-white border-none transition-colors`}
                      >
                        {getSportEmoji(sport)} {sport.charAt(0).toUpperCase() + sport.slice(1)} ({eventCount})
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Category Filters for Legacy Channels */}
              {selectedSport === 'Legacy' && (
                <div className="flex flex-wrap gap-2">
                  {sportsCategories.map(category => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category
                          ? 'bg-[#ea384c] hover:bg-[#ff4d63]'
                          : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                      } text-white border-none transition-colors`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && selectedSport !== 'Legacy' && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ea384c] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading live sports events...</p>
                </div>
              </div>
            )}

            {/* Real-time Events Grid */}
            {!isLoading && selectedSport !== 'Legacy' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map(event => (
                  <Card key={event.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#ea384c] transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getSportEmoji(event.sport)}</span>
                          <div className="text-xs text-gray-400 uppercase tracking-wide">
                            {event.league}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.isHighProfile && (
                            <Trophy className="w-4 h-4 text-yellow-500" />
                          )}
                          {getEventStatusBadge(event)}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg group-hover:text-[#ea384c] transition-colors">
                        {event.tournament}
                      </CardTitle>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{event.homeTeam}</span>
                        <span className="text-[#ea384c] font-bold">{getScoreDisplay(event)}</span>
                        <span className="font-medium">{event.awayTeam}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{event.venue || 'Unknown Venue'}</span>
                        </div>
                        {event.country && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{event.country}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-1">
                          Streaming sources: {event.streamingSources.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Best source: {event.streamingSources[0]?.name || 'Unknown'}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => playEvent(event)}
                        disabled={event.streamingSources.length === 0}
                        className="w-full bg-[#ea384c] hover:bg-[#ff4d63] text-white border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {event.status === 'live' ? 'Watch Live' : 'Watch Stream'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Legacy Channels Grid */}
            {selectedSport === 'Legacy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map(channel => (
                  <Card key={channel.id} className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#ea384c] transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg group-hover:text-[#ea384c] transition-colors">
                          {channel.name}
                        </CardTitle>
                        {channel.isLive && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{channel.description}</p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{channel.category}</span>
                        </div>
                        {channel.event && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{channel.event}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => playChannel(channel)}
                        className="w-full bg-[#ea384c] hover:bg-[#ff4d63] text-white border-none transition-colors"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Events State */}
            {!isLoading && selectedSport !== 'Legacy' && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Live Events Found</h3>
                <p className="text-gray-400 mb-4">
                  {selectedSport === 'All' 
                    ? 'No live sports events are currently available.' 
                    : `No live ${selectedSport} events are currently available.`}
                </p>
                <Button onClick={refreshSportsData} className="bg-[#ea384c] hover:bg-[#ff4d63] text-white border-none">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Events
                </Button>
              </div>
            )}

            {/* Featured Live Events */}
            {!isLoading && selectedSport !== 'Legacy' && liveEvents.some(event => event.status === 'live' && event.isHighProfile) && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-[#ea384c] rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-white">🔥 Featured Live Events</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {liveEvents
                    .filter(event => event.status === 'live' && event.isHighProfile)
                    .slice(0, 4)
                    .map(event => (
                      <div key={event.id} className="bg-gradient-to-r from-[#ea384c]/10 to-[#ff4d63]/10 p-4 rounded-lg border border-[#ea384c]/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getSportEmoji(event.sport)}</span>
                            <span className="text-sm font-medium text-[#ea384c]">{event.tournament}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                        </div>
                        <div className="text-white font-semibold mb-2">
                          {event.homeTeam} vs {event.awayTeam}
                        </div>
                        <Button
                          onClick={() => playEvent(event)}
                          className="w-full bg-[#ea384c] hover:bg-[#ff4d63] text-white border-none"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Live
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer - Same as Home/Index */}
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

export default SportsStreaming; 