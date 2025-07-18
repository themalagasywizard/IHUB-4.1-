// Real-time sports data service - Aggregates data from multiple APIs for live streaming

// Simple time formatting utility to replace date-fns
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 0) return 'now';
  if (diffMins < 60) return `${diffMins} minutes`;
  if (diffHours < 24) return `${diffHours} hours`;
  return `${Math.floor(diffHours / 24)} days`;
};

// Sports API configuration
const SPORTS_APIS = {
  theSportsDB: {
    baseUrl: 'https://www.thesportsdb.com/api/v1/json/123',
    rateLimitMs: 1000, // 1 second between requests
  },
  // API-Sports free tier (100 requests/day)
  apisports: {
    baseUrl: 'https://api-sports.io',
    apiKey: '', // Free tier - 100 requests/day
    rateLimitMs: 3000, // 3 seconds between requests - conservative for free tier
  },
  // Sports Open Data API (free)
  sportsopendata: {
    baseUrl: 'https://api.openligadb.de/api',
    rateLimitMs: 2000, // 2 seconds between requests
  }
};

// Standardized sport types
export type SportType = 
  | 'football' | 'soccer' | 'tennis' | 'basketball' | 'baseball' 
  | 'rugby' | 'cricket' | 'golf' | 'hockey' | 'volleyball'
  | 'americanfootball' | 'motorsport' | 'boxing' | 'mma';

// Normalized sports event interface
export interface LiveSportsEvent {
  id: string;
  sport: SportType;
  league: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'live' | 'scheduled' | 'finished';
  startTime: Date;
  venue?: string;
  country?: string;
  isHighProfile: boolean;
  streamingSources: StreamingSource[];
  liveScoreUrl?: string;
  thumbnailUrl?: string;
}

// Streaming source interface
export interface StreamingSource {
  id: string;
  name: string;
  url: string;
  quality: 'hd' | 'sd' | 'auto';
  reliability: number; // 0-100 score
  language: string;
  isOfficial: boolean;
}

// Enhanced channel mapping for known streaming sources
const STREAMING_SOURCES_MAP: Record<string, StreamingSource[]> = {
  // Tennis sources - enhanced for current tournaments
  'tennis': [
    {
      id: 'tennis-channel-1',
      name: 'Tennis TV',
      url: 'https://daddylive2.top/my/stream-tennis-1.php',
      quality: 'hd',
      reliability: 95,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'eurosport-tennis',
      name: 'Eurosport Tennis',
      url: 'https://daddylive2.top/my/stream-15.php',
      quality: 'hd',
      reliability: 90,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'bein-sports-tennis',
      name: 'beIN Sports Tennis',
      url: 'https://daddylive2.top/my/stream-116.php',
      quality: 'hd',
      reliability: 88,
      language: 'fr',
      isOfficial: false
    }
  ],
  // Football sources - enhanced for major leagues
  'football': [
    {
      id: 'sky-sports-main',
      name: 'Sky Sports Main Event',
      url: 'https://daddylive2.top/my/stream-1.php',
      quality: 'hd',
      reliability: 95,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'bt-sport-1',
      name: 'BT Sport 1',
      url: 'https://daddylive2.top/my/stream-2.php',
      quality: 'hd',
      reliability: 90,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'espn-football',
      name: 'ESPN Football',
      url: 'https://daddylive2.top/my/stream-8.php',
      quality: 'hd',
      reliability: 87,
      language: 'en',
      isOfficial: false
    }
  ],
  // Basketball sources
  'basketball': [
    {
      id: 'espn-basketball',
      name: 'ESPN Basketball',
      url: 'https://daddylive2.top/my/stream-8.php',
      quality: 'hd',
      reliability: 85,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'sky-sports-mix',
      name: 'Sky Sports Mix',
      url: 'https://daddylive2.top/my/stream-5.php',
      quality: 'hd',
      reliability: 80,
      language: 'en',
      isOfficial: false
    }
  ],
  // Baseball sources
  'baseball': [
    {
      id: 'espn-baseball',
      name: 'ESPN Baseball',
      url: 'https://daddylive2.top/my/stream-8.php',
      quality: 'hd',
      reliability: 85,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'fox-sports-baseball',
      name: 'Fox Sports Baseball',
      url: 'https://daddylive2.top/my/stream-3.php',
      quality: 'hd',
      reliability: 82,
      language: 'en',
      isOfficial: false
    }
  ],
  // Default sports sources
  'default': [
    {
      id: 'espn-usa',
      name: 'ESPN USA',
      url: 'https://daddylive2.top/my/stream-8.php',
      quality: 'hd',
      reliability: 85,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'eurosport-1',
      name: 'Eurosport 1',
      url: 'https://daddylive2.top/my/stream-15.php',
      quality: 'hd',
      reliability: 80,
      language: 'en',
      isOfficial: false
    },
    {
      id: 'bein-sports-1',
      name: 'beIN Sports 1',
      url: 'https://daddylive2.top/my/stream-116.php',
      quality: 'hd',
      reliability: 85,
      language: 'fr',
      isOfficial: false
    }
  ]
};

// High-profile events that should be prioritized
const HIGH_PROFILE_EVENTS = [
  // Tennis
  'wimbledon', 'us open', 'french open', 'australian open', 'atp finals',
  'indian wells', 'miami open', 'monte carlo', 'madrid open', 'rome masters',
  'gstaad', 'basel', 'vienna', 'paris masters', 'hamburg', 'bastad',
  // Football
  'premier league', 'champions league', 'europa league', 'world cup', 'euros',
  'la liga', 'serie a', 'bundesliga', 'ligue 1',
  // Other sports
  'nba finals', 'super bowl', 'world series', 'stanley cup'
];

class SportsDataService {
  private cache = new Map<string, { data: LiveSportsEvent[]; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache for real-time data
  private lastApiCall = new Map<string, number>();

  // Clear cache method for manual refresh
  clearCache() {
    this.cache.clear();
  }

  // Fetch live sports events with intelligent aggregation
  async getLiveSportsEvents(sport?: SportType): Promise<LiveSportsEvent[]> {
    const cacheKey = `live-events-${sport || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const events = await this.aggregateFromMultipleSources(sport);
      this.cache.set(cacheKey, { data: events, timestamp: Date.now() });
      return events;
    } catch (error) {
      console.warn('Failed to fetch live sports events:', error);
      return cached?.data || [];
    }
  }

  // Aggregate data from multiple sources with fallback
  private async aggregateFromMultipleSources(sport?: SportType): Promise<LiveSportsEvent[]> {
    const results = await Promise.allSettled([
      this.fetchFromTheSportsDB(sport),
      this.fetchFromAPISports(sport),
    ]);

    const allEvents: LiveSportsEvent[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allEvents.push(...result.value);
      }
    });

    console.log(`Fetched ${allEvents.length} real sports events from APIs`);

    // Deduplicate and sort by importance
    return this.deduplicateAndSort(allEvents);
  }

  // Updated TheSportsDB API fetch with correct endpoints
  private async fetchFromTheSportsDB(sport?: SportType): Promise<LiveSportsEvent[]> {
    if (!this.canMakeApiCall('theSportsDB')) return [];

    try {
      const events: LiveSportsEvent[] = [];
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log(`Fetching events from TheSportsDB for date: ${today}`);
      
      // Get today's events using the correct endpoint
      const response = await fetch(
        `${SPORTS_APIS.theSportsDB.baseUrl}/eventsday.php?d=${today}`,
        { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('TheSportsDB response:', data);
        
        if (data.events && Array.isArray(data.events)) {
          const normalizedEvents = data.events
            .filter((event: any) => {
              // Filter by sport if specified
              if (sport) {
                const eventSport = this.mapSportFromTheSportsDB(event.strSport);
                return eventSport === sport;
              }
              return true;
            })
            .map((event: any) => this.normalizeTheSportsDBEvent(event))
            .filter((event: LiveSportsEvent | null) => event !== null);
          
          events.push(...normalizedEvents);
          console.log(`TheSportsDB returned ${normalizedEvents.length} events`);
        } else {
          console.log('No events found in TheSportsDB response');
        }
      } else {
        console.warn(`TheSportsDB API returned status: ${response.status}`);
      }
      
      this.updateApiCallTime('theSportsDB');
      return events;
    } catch (error) {
      console.warn('TheSportsDB API error:', error);
      return [];
    }
  }

  // Fetch from API-Sports (free tier)
  private async fetchFromAPISports(sport?: SportType): Promise<LiveSportsEvent[]> {
    if (!this.canMakeApiCall('apisports')) return [];

    try {
      const events: LiveSportsEvent[] = [];
      
      // Try to fetch from API-Sports free tier
      // Note: This requires an API key for the free tier
      console.log('API-Sports integration would require API key setup');
      
      this.updateApiCallTime('apisports');
      return events;
    } catch (error) {
      console.warn('API-Sports error:', error);
      return [];
    }
  }

  // Map sport from TheSportsDB to our standardized format
  private mapSportFromTheSportsDB(sportStr: string): SportType {
    const sport = sportStr?.toLowerCase() || '';
    
    if (sport.includes('soccer') || sport.includes('football')) return 'football';
    if (sport.includes('tennis')) return 'tennis';
    if (sport.includes('basketball')) return 'basketball';
    if (sport.includes('baseball')) return 'baseball';
    if (sport.includes('rugby')) return 'rugby';
    if (sport.includes('cricket')) return 'cricket';
    if (sport.includes('golf')) return 'golf';
    if (sport.includes('hockey')) return 'hockey';
    if (sport.includes('volleyball')) return 'volleyball';
    if (sport.includes('american football')) return 'americanfootball';
    if (sport.includes('motorsport') || sport.includes('racing')) return 'motorsport';
    if (sport.includes('boxing')) return 'boxing';
    if (sport.includes('mma')) return 'mma';
    
    return 'football'; // Default fallback
  }

  // Normalize TheSportsDB event data
  private normalizeTheSportsDBEvent(event: any): LiveSportsEvent | null {
    try {
      const sport = this.mapSportFromTheSportsDB(event.strSport);
      const startTime = event.strTimestamp ? new Date(event.strTimestamp) : 
                       event.dateEvent && event.strTime ? 
                       new Date(`${event.dateEvent}T${event.strTime}`) : 
                       new Date();
      
      // Only include events that are today or in the future
      const now = new Date();
      const eventDate = new Date(startTime);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (eventDate < todayStart) {
        return null; // Skip past events
      }
      
      return {
        id: event.idEvent || `thesportsdb-${Date.now()}-${Math.random()}`,
        sport,
        league: event.strLeague || 'Unknown League',
        tournament: event.strEvent || event.strLeague || 'Unknown Tournament',
        homeTeam: event.strHomeTeam || event.strPlayer || 'Team A',
        awayTeam: event.strAwayTeam || event.strPlayer || 'Team B',
        homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : undefined,
        awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : undefined,
        status: this.normalizeStatus(event.strStatus),
        startTime,
        venue: event.strVenue,
        country: event.strCountry,
        isHighProfile: this.isHighProfileEvent(event.strEvent || event.strLeague || ''),
        streamingSources: this.getStreamingSourcesForEvent(event.strLeague, sport),
        liveScoreUrl: `https://www.thesportsdb.com/event/${event.idEvent}`,
        thumbnailUrl: event.strThumb || event.strSquare
      };
    } catch (error) {
      console.warn('Error normalizing TheSportsDB event:', error);
      return null;
    }
  }

  // Get streaming sources for specific event
  private getStreamingSourcesForEvent(league: string, sport: SportType): StreamingSource[] {
    const leagueLower = league?.toLowerCase() || '';
    
    // Get sport-specific sources
    const sportSources = STREAMING_SOURCES_MAP[sport];
    if (sportSources) {
      return sportSources;
    }
    
    // Fallback to default sources
    return STREAMING_SOURCES_MAP['default'];
  }

  // Utility methods
  private normalizeStatus(status: string): 'live' | 'scheduled' | 'finished' {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('live') || statusLower.includes('in progress') || 
        statusLower === '1h' || statusLower === '2h' || statusLower.includes("'")) {
      return 'live';
    }
    
    if (statusLower.includes('finished') || statusLower.includes('ft') || 
        statusLower.includes('final') || statusLower.includes('ended')) {
      return 'finished';
    }
    
    return 'scheduled';
  }

  private isHighProfileEvent(eventName: string): boolean {
    const nameLower = eventName.toLowerCase();
    return HIGH_PROFILE_EVENTS.some(event => nameLower.includes(event));
  }

  private canMakeApiCall(apiName: string): boolean {
    const lastCall = this.lastApiCall.get(apiName) || 0;
    const rateLimitMs = SPORTS_APIS[apiName]?.rateLimitMs || 1000;
    return Date.now() - lastCall >= rateLimitMs;
  }

  private updateApiCallTime(apiName: string): void {
    this.lastApiCall.set(apiName, Date.now());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Deduplicate and sort events by importance
  private deduplicateAndSort(events: LiveSportsEvent[]): LiveSportsEvent[] {
    const uniqueEvents = new Map<string, LiveSportsEvent>();
    
    events.forEach(event => {
      const key = `${event.homeTeam}-${event.awayTeam}-${event.startTime.getTime()}`;
      if (!uniqueEvents.has(key) || event.isHighProfile) {
        uniqueEvents.set(key, event);
      }
    });

    return Array.from(uniqueEvents.values()).sort((a, b) => {
      // Prioritize live events
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      
      // Then high profile events
      if (a.isHighProfile && !b.isHighProfile) return -1;
      if (b.isHighProfile && !a.isHighProfile) return 1;
      
      // Then by start time (soonest first)
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }

  // Public methods for component use
  async getEventsBySport(sport: SportType): Promise<LiveSportsEvent[]> {
    return this.getLiveSportsEvents(sport);
  }

  async getLiveEvents(): Promise<LiveSportsEvent[]> {
    const allEvents = await this.getLiveSportsEvents();
    return allEvents.filter(event => event.status === 'live');
  }

  async getUpcomingEvents(hours: number = 6): Promise<LiveSportsEvent[]> {
    const allEvents = await this.getLiveSportsEvents();
    const cutoff = new Date(Date.now() + hours * 3600000);
    
    return allEvents.filter(event => 
      event.status === 'scheduled' && 
      event.startTime <= cutoff
    );
  }

  async getAvailableSports(): Promise<SportType[]> {
    const events = await this.getLiveSportsEvents();
    const sports = new Set(events.map(event => event.sport));
    return Array.from(sports);
  }
}

// Export utility functions
export const formatTimeUntilEvent = (startTime: Date): string => {
  const now = new Date();
  if (startTime <= now) {
    return 'Live Now';
  }
  return `in ${formatDistanceToNow(startTime)}`;
};

export const getSportEmoji = (sport: SportType): string => {
  const emojiMap: Record<SportType, string> = {
    football: '⚽',
    soccer: '⚽',
    tennis: '🎾',
    basketball: '🏀',
    baseball: '⚾',
    rugby: '🏉',
    cricket: '🏏',
    golf: '⛳',
    hockey: '🏒',
    volleyball: '🏐',
    americanfootball: '🏈',
    motorsport: '🏎️',
    boxing: '🥊',
    mma: '🥋'
  };
  
  return emojiMap[sport] || '🏆';
};

// Create and export service instance
export const sportsDataService = new SportsDataService(); 