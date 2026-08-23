const TMDB_API_KEY = '650ff50a48a7379fd245c173ad422ff8';
const STREMSRC_ADDON_URL = 'https://stremsrc.theditor.xyz';
const PREFERRED_SERVER_KEY = 'ihub-preferred-server';
export const DEFAULT_SERVER_ID = 'direct-unblock';

const siteOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '');

export type MediaKind = 'movie' | 'tv';
export type ServerKind = 'iframe' | 'direct';

export interface StreamServer {
  id: string;
  name: string;
  group: 'StremSRC' | 'Embed';
  kind: ServerKind;
  url: string;
}

export interface PlaybackRequest {
  tmdbId: string;
  imdbId?: string | null;
  mediaType: MediaKind;
  season?: number;
  episode?: number;
}

interface StremioStream {
  name?: string;
  title?: string;
  url?: string;
  description?: string;
}

const seasonOf = (request: PlaybackRequest) => request.season ?? 1;
const episodeOf = (request: PlaybackRequest) => request.episode ?? 1;

const withId = (request: PlaybackRequest) => request.imdbId || request.tmdbId;

export const getPreferredServerId = () => {
  try {
    return localStorage.getItem(PREFERRED_SERVER_KEY);
  } catch {
    return null;
  }
};

export const setPreferredServerId = (serverId: string) => {
  try {
    localStorage.setItem(PREFERRED_SERVER_KEY, serverId);
  } catch {
    // Ignore storage failures in private mode
  }
};

export const fetchImdbId = async (tmdbId: string, mediaType: MediaKind): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.imdb_id === 'string' && data.imdb_id.startsWith('tt')
      ? data.imdb_id
      : null;
  } catch {
    return null;
  }
};

export const getEmbedServers = (request: PlaybackRequest): StreamServer[] => {
  const id = withId(request);
  const tmdbId = request.tmdbId;
  const season = seasonOf(request);
  const episode = episodeOf(request);
  const isMovie = request.mediaType === 'movie';

  const origin = siteOrigin();
  const servers: StreamServer[] = [
    {
      id: 'direct-unblock',
      name: 'Direct Play',
      group: 'Direct',
      kind: 'iframe',
      url: isMovie
        ? `${origin}/watch-proxy/vidsrcme.ru/embed/movie?tmdb=${tmdbId}`
        : `${origin}/watch-proxy/vidsrcme.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    },
    {
      id: 'vidsrc-me',
      name: 'VidSrc Alt',
      group: 'Embed',
      kind: 'iframe',
      url: isMovie
        ? `https://vidsrcme.ru/embed/movie?tmdb=${tmdbId}`
        : `https://vidsrcme.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    },
    {
      id: 'stremsrc-vidsrc',
      name: 'StremSRC',
      group: 'StremSRC',
      kind: 'iframe',
      url: isMovie
        ? `https://vsembed.ru/embed/movie/${id}`
        : `https://vsembed.ru/embed/tv/${id}/${season}-${episode}`,
    },
    {
      id: 'vidsrc-to',
      name: 'VidSrc',
      group: 'Embed',
      kind: 'iframe',
      url: isMovie
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      id: 'vidsrc-cc',
      name: 'VidSrc CC',
      group: 'Embed',
      kind: 'iframe',
      url: isMovie
        ? `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
        : `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      id: 'vidlink',
      name: 'VidLink',
      group: 'Embed',
      kind: 'iframe',
      url: isMovie
        ? `https://vidlink.pro/movie/${tmdbId}`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
    },
  ];

  return servers;
};

const labelForStream = (stream: StremioStream, index: number) => {
  const raw = stream.title || stream.name || stream.description || `Server ${index + 1}`;
  return raw.replace(/\s+/g, ' ').trim();
};

export const fetchStremSrcServers = async (
  request: PlaybackRequest
): Promise<StreamServer[]> => {
  const imdbId = request.imdbId;
  if (!imdbId) return [];

  const stremioType = request.mediaType === 'tv' ? 'series' : 'movie';
  const streamId =
    request.mediaType === 'tv'
      ? `${imdbId}:${seasonOf(request)}:${episodeOf(request)}`
      : imdbId;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `${STREMSRC_ADDON_URL}/stream/${stremioType}/${streamId}.json`,
      { signal: controller.signal }
    );
    if (!response.ok) return [];

    const data = await response.json();
    const streams: StremioStream[] = Array.isArray(data?.streams) ? data.streams : [];

    return streams
      .filter((stream) => typeof stream.url === 'string' && stream.url.length > 0)
      .map((stream, index) => ({
        id: `stremsrc-stream-${index}-${stream.url}`,
        name: labelForStream(stream, index),
        group: 'StremSRC' as const,
        kind: /\.m3u8(\?|$)/i.test(stream.url || '') || /\.(mp4|mkv|webm)(\?|$)/i.test(stream.url || '')
          ? 'direct'
          : 'iframe',
        url: stream.url as string,
      }));
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeout);
  }
};

export const resolveServers = async (request: PlaybackRequest): Promise<StreamServer[]> => {
  const embedServers = getEmbedServers(request);
  const extracted = await fetchStremSrcServers(request);
  const seen = new Set(embedServers.map((server) => server.url));

  return [
    ...embedServers,
    ...extracted.filter((server) => {
      if (seen.has(server.url)) return false;
      seen.add(server.url);
      return true;
    }),
  ];
};

export const pickDefaultServer = (servers: StreamServer[]) => {
  return (
    servers.find((server) => server.id === DEFAULT_SERVER_ID) ||
    servers.find((server) => server.id === getPreferredServerId()) ||
    servers[0] ||
    null
  );
};
