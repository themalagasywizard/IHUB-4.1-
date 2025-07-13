import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, ArrowLeft, Tv, Users, Calendar } from 'lucide-react';
import { protectIframe, initializeBlockers } from '../utils/contentBlocker';

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
    embedUrl: 'https://livecric.pk/s2w/337',
    category: 'Tennis',
    isLive: true,
    event: 'Wimbledon Final'
  },
  {
    id: 'bein-sports-2-fr',
    name: 'beIN Sports 2 FR',
    description: 'French sports channel with live football',
    embedUrl: 'https://stream2watch.pk/live/bein-sports-2-fr',
    category: 'Football',
    isLive: true,
    event: 'Live Football'
  },
  {
    id: 'sky-sports-main',
    name: 'Sky Sports Main Event',
    description: 'Premier UK sports channel',
    embedUrl: 'https://stream2watch.pk/live/sky-sports-main-event',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  },
  {
    id: 'espn-usa',
    name: 'ESPN USA',
    description: 'American sports network',
    embedUrl: 'https://stream2watch.pk/live/espn-usa',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  },
  {
    id: 'bt-sport-1',
    name: 'BT Sport 1',
    description: 'British sports channel',
    embedUrl: 'https://stream2watch.pk/live/bt-sport-1',
    category: 'Football',
    isLive: true,
    event: 'Premier League'
  },
  {
    id: 'eurosport-1',
    name: 'Eurosport 1',
    description: 'European sports channel',
    embedUrl: 'https://stream2watch.pk/live/eurosport-1',
    category: 'Mixed Sports',
    isLive: true,
    event: 'Live Sports'
  }
];

const SportsStreaming = () => {
  const [selectedChannel, setSelectedChannel] = useState<SportsChannel | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Tennis', 'Football', 'Mixed Sports'];

  useEffect(() => {
    // Initialize content blockers when component mounts (with error handling)
    try {
      initializeBlockers();
    } catch (error) {
      console.warn('Content blockers initialization failed:', error);
      // Continue without blockers if they fail
    }
  }, []);

  const filteredChannels = selectedCategory === 'All' 
    ? sportsChannels 
    : sportsChannels.filter(channel => channel.category === selectedCategory);

  const playChannel = (channel: SportsChannel) => {
    setSelectedChannel(channel);
    setShowPlayer(true);
    
    const videoContainer = videoContainerRef.current;
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

      // Create and configure iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'absolute inset-0 w-full h-full rounded-lg shadow-lg bg-black';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      iframe.setAttribute('loading', 'eager');
      iframe.setAttribute('importance', 'high');
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 0.3s ease';
      iframe.src = channel.embedUrl;

      // Apply content blocker protection (with error handling)
      try {
        protectIframe(iframe);
      } catch (error) {
        console.warn('Iframe protection failed:', error);
        // Continue without protection if it fails
      }

      // Add iframe to container
      iframeContainer.appendChild(iframe);

      const handleLoad = () => {
        iframe.style.opacity = '1';
        loadingDiv.remove();
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };

      const handleError = () => {
        loadingDiv.innerHTML = `
          <div class="text-center text-white">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <p class="text-lg font-medium mb-2">Unable to load ${channel.name}</p>
            <p class="text-sm text-gray-400 mb-4">The stream may be temporarily unavailable</p>
            <button onclick="location.reload()" class="px-4 py-2 bg-[#ea384c] rounded-md hover:bg-[#ff4d63] transition-colors">
              Retry
            </button>
          </div>
        `;
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Set a timeout for loading
      setTimeout(() => {
        if (loadingDiv.parentNode) {
          handleError();
        }
      }, 15000);

      // Scroll to player
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setSelectedChannel(null);
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      while (videoContainer.firstChild) {
        videoContainer.removeChild(videoContainer.firstChild);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white relative">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
            <Tv className="w-8 h-8 text-[#ea384c]" />
            Sports Streaming
          </h1>
          <p className="text-gray-400 text-lg">Watch live sports from around the world</p>
        </div>

        {/* Video Player Container */}
        <div ref={videoContainerRef} className="mb-8 relative" />

        {/* Back Button when player is active */}
        {showPlayer && selectedChannel && (
          <div className="mb-6">
            <Button
              onClick={closePlayer}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-none"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Channels
            </Button>
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
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
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
        </div>

        {/* Channels Grid */}
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

        {/* Featured Channel Highlight */}
        <div className="mt-12 p-6 bg-gradient-to-r from-[#ea384c]/20 to-[#ff4d63]/20 rounded-lg border border-[#ea384c]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-[#ea384c] rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-white">Featured: Wimbledon Final</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Watch the Wimbledon Final live on beIN Sports 1 FR. Don't miss this historic tennis match!
          </p>
          <Button
            onClick={() => playChannel(sportsChannels[0])}
            className="bg-[#ea384c] hover:bg-[#ff4d63] text-white border-none"
          >
            <Play className="w-4 h-4 mr-2" />
            Watch Wimbledon Final
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SportsStreaming; 