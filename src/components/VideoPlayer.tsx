import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Radio, X } from 'lucide-react';
import {
  fetchImdbId,
  getEmbedServers,
  pickDefaultServer,
  resolveServers,
  setPreferredServerId,
  type MediaKind,
  type StreamServer,
} from '@/utils/streamSources';

interface VideoPlayerProps {
  tmdbId: string;
  mediaType: MediaKind;
  title?: string;
  season?: number;
  episode?: number;
  onClose: () => void;
}

const VideoPlayer = ({
  tmdbId,
  mediaType,
  title,
  season,
  episode,
  onClose,
}: VideoPlayerProps) => {
  const [servers, setServers] = useState<StreamServer[]>(() =>
    getEmbedServers({ tmdbId, mediaType, season, episode })
  );
  const [activeServerId, setActiveServerId] = useState<string>(() => servers[0]?.id || '');
  const [isResolving, setIsResolving] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeServer = useMemo(
    () => servers.find((server) => server.id === activeServerId) || servers[0] || null,
    [servers, activeServerId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadServers = async () => {
      setIsResolving(true);
      setIframeReady(false);
      setLoadFailed(false);

      const imdbId = await fetchImdbId(tmdbId, mediaType);
      if (cancelled) return;

      const request = { tmdbId, imdbId, mediaType, season, episode };
      const nextServers = getEmbedServers(request);
      setServers(nextServers);

      const current = pickDefaultServer(nextServers);
      if (current) setActiveServerId(current.id);

      const resolved = await resolveServers(request);
      if (cancelled) return;

      setServers(resolved);
      setActiveServerId((currentId) => {
        const stillExists = resolved.some((server) => server.id === currentId);
        if (stillExists) return currentId;
        return pickDefaultServer(resolved)?.id || currentId;
      });
      setIsResolving(false);
    };

    loadServers();

    return () => {
      cancelled = true;
    };
  }, [tmdbId, mediaType, season, episode]);

  useEffect(() => {
    setIframeReady(false);
    setLoadFailed(false);
  }, [activeServer?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeServer?.kind !== 'direct' || !activeServer.url) return;

    video.pause();
    video.src = activeServer.url;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => setLoadFailed(true));
    }

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [activeServer]);

  const handleSelectServer = (server: StreamServer) => {
    setActiveServerId(server.id);
    setPreferredServerId(server.id);
    setIframeReady(false);
    setLoadFailed(false);
  };

  const groupedServers = useMemo(() => {
    return servers.reduce<Record<string, StreamServer[]>>((groups, server) => {
      groups[server.group] = groups[server.group] || [];
      groups[server.group].push(server);
      return groups;
    }, {});
  }, [servers]);

  const heading =
    mediaType === 'tv' && season && episode
      ? `${title || 'Now playing'} · S${season} E${episode}`
      : title || 'Now playing';

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#ea384c]">Now playing</p>
          <h2 className="text-lg md:text-xl font-semibold truncate">{heading}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full border border-[#2a2a2a] hover:border-[#ea384c]/60 hover:bg-[rgba(234,56,76,0.08)] transition-colors"
          aria-label="Close player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-video max-h-[600px] overflow-hidden rounded-lg bg-black shadow-lg">
        {!iframeReady && !loadFailed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <Loader2 className="w-10 h-10 text-[#ea384c] animate-spin" />
          </div>
        )}

        {loadFailed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black px-6 text-center">
            <div>
              <p className="mb-2 text-white">This server could not load the video.</p>
              <p className="text-sm text-white/60">Choose another server below.</p>
            </div>
          </div>
        )}

        {activeServer?.kind === 'direct' ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full bg-black"
            controls
            autoPlay
            playsInline
            onCanPlay={() => setIframeReady(true)}
            onError={() => setLoadFailed(true)}
          />
        ) : (
          activeServer && (
            <iframe
              key={activeServer.url}
              src={activeServer.url}
              className="absolute inset-0 h-full w-full bg-black"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="origin"
              onLoad={() => setIframeReady(true)}
              onError={() => setLoadFailed(true)}
            />
          )
        )}
      </div>

      <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Radio className="w-4 h-4 text-[#ea384c]" />
            <span>Select a server</span>
          </div>
          {isResolving && (
            <span className="text-xs text-white/40">Checking StremSRC links…</span>
          )}
        </div>

        <div className="space-y-3">
          {Object.entries(groupedServers).map(([group, groupServers]) => (
            <div key={group}>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/35">{group}</p>
              <div className="flex flex-wrap gap-2">
                {groupServers.map((server) => {
                  const isActive = server.id === activeServer?.id;
                  return (
                    <button
                      key={server.id}
                      onClick={() => handleSelectServer(server)}
                      className={`max-w-full truncate rounded-md border px-3 py-1.5 text-sm transition-all active:scale-[0.98] ${
                        isActive
                          ? 'border-[#ea384c] bg-[#ea384c] text-white'
                          : 'border-[#2a2a2a] bg-[#141414] text-white/80 hover:border-[#ea384c]/50'
                      }`}
                      title={server.name}
                    >
                      {server.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
