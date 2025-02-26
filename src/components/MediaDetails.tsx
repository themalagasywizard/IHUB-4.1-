import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface MediaDetailsProps {
  id: string;
  title: string;
  overview: string;
  rating: number;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onSelectEpisode?: (seasonNum: number, episodeNum: number) => void;
  onPersonClick?: (personId: number) => void;
  onPlayMovie?: (id: string) => void;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

interface DetailedMetadata {
  genres?: { id: number; name: string; }[];
  runtime?: number;
  episode_run_time?: number[];
  release_date?: string;
  first_air_date?: string;
  status?: string;
  production_companies?: { name: string; }[];
  original_language?: string;
  vote_count?: number;
  cast?: any[];
  crew?: CrewMember[];
}

const MediaDetails = ({ 
  id, 
  title, 
  overview, 
  rating, 
  posterPath,
  mediaType,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectEpisode,
  onPersonClick,
  onPlayMovie
}: MediaDetailsProps) => {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<DetailedMetadata | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const apiKey = '650ff50a48a7379fd245c173ad422ff8';

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingCredits(true);
      try {
        // Fetch main details
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${apiKey}`
        );
        const detailsData = await detailsResponse.json();

        // Fetch cast and crew information
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${apiKey}`
        );
        const creditsData = await creditsResponse.json();

        // Process cast members
        const processedCast = creditsData.cast
          ?.slice(0, 6)
          .map((person: any) => ({
            ...person,
            id: parseInt(person.id.toString())
          })) || [];

        // Get directors (for movies) or creators (for TV shows)
        const directors = mediaType === 'movie' 
          ? creditsData.crew
              .filter((person: CrewMember) => person.job === 'Director')
              .map((person: CrewMember) => ({
                ...person,
                id: parseInt(person.id.toString())
              }))
          : creditsData.crew
              .filter((person: CrewMember) => person.job === 'Creator')
              .map((person: CrewMember) => ({
                ...person,
                id: parseInt(person.id.toString())
              }));

        setMetadata({
          ...detailsData,
          cast: processedCast,
          crew: directors // Store directors/creators
        });

        if (mediaType === 'tv' && detailsData.seasons) {
          // Filter out season 0 and store the rest
          const filteredSeasons = detailsData.seasons.filter(
            (season: any) => season.season_number > 0
          );
          setSeasons(filteredSeasons);
          
          // If there are seasons after filtering, select the first one
          if (filteredSeasons.length > 0) {
            handleSeasonSelect(filteredSeasons[0].season_number);
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchDetails();
  }, [id, mediaType]);

  const handleSeasonSelect = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`
      );
      const data = await response.json();
      if (data.episodes) {
        // Sort episodes by episode number
        const sortedEpisodes = [...data.episodes].sort((a, b) => a.episode_number - b.episode_number);
        setEpisodes(sortedEpisodes);
      } else {
        setEpisodes([]);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
      setEpisodes([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto pt-20">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#ea384c] hover:text-[#ff4d63] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to browsing
          </button>

          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-[rgba(234,56,76,0.1)] text-[#ea384c]' 
                : 'hover:bg-[rgba(234,56,76,0.1)]'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                alt={title}
                className="w-full md:w-40 h-auto md:h-60 rounded-lg shadow-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg">{rating.toFixed(1)}</span>
                  {metadata?.vote_count && (
                    <span className="text-sm text-gray-400">
                      ({metadata.vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </div>

                {metadata && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    {metadata.genres && (
                      <div>
                        <span className="text-gray-400">Genres: </span>
                        {metadata.genres.map(genre => genre.name).join(', ')}
                      </div>
                    )}
                    {(metadata.runtime || metadata.episode_run_time) && (
                      <div>
                        <span className="text-gray-400">Duration: </span>
                        {metadata.runtime 
                          ? `${metadata.runtime} minutes`
                          : `${metadata.episode_run_time?.[0]} minutes per episode`
                        }
                      </div>
                    )}
                    {(metadata.release_date || metadata.first_air_date) && (
                      <div>
                        <span className="text-gray-400">
                          {mediaType === 'movie' ? 'Release Date: ' : 'First Air Date: '}
                        </span>
                        {new Date(metadata.release_date || metadata.first_air_date || '').toLocaleDateString()}
                      </div>
                    )}
                    {metadata.status && (
                      <div>
                        <span className="text-gray-400">Status: </span>
                        {metadata.status}
                      </div>
                    )}
                    {metadata.production_companies && metadata.production_companies.length > 0 && (
                      <div>
                        <span className="text-gray-400">Production: </span>
                        {metadata.production_companies.map(company => company.name).join(', ')}
                      </div>
                    )}
                    {metadata.original_language && (
                      <div>
                        <span className="text-gray-400">Original Language: </span>
                        {new Intl.DisplayNames(['en'], { type: 'language' }).of(metadata.original_language)}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-300 mb-6">{overview}</p>

                {mediaType === 'movie' ? (
                  <Button 
                    onClick={() => onPlayMovie?.(id)}
                    className="bg-[#ea384c] hover:bg-[#ff4d63] mb-6"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Movie
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onSelectEpisode?.(1, 1)}
                    className="bg-[#ea384c] hover:bg-[#ff4d63] mb-6"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play First Episode
                  </Button>
                )}

                {metadata?.crew && metadata.crew.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      {mediaType === 'movie' ? 'Director' : 'Creator'}
                      {metadata.crew.length > 1 ? 's' : ''}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {metadata.crew.map((person) => (
                        <div 
                          key={person.id}
                          className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onPersonClick?.(person.id)}
                        >
                          <div className="aspect-square rounded-full overflow-hidden mb-2">
                            <img
                              src={person.profile_path 
                                ? `https://image.tmdb.org/t/p/w154${person.profile_path}`
                                : 'https://via.placeholder.com/154x154'
                              }
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium">{person.name}</p>
                          <p className="text-xs text-gray-400">{person.job}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metadata?.cast && metadata.cast.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Main Cast</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {metadata.cast.map((actor) => (
                        <div 
                          key={actor.id}
                          className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onPersonClick?.(actor.id)}
                        >
                          <div className="aspect-square rounded-full overflow-hidden mb-2">
                            <img
                              src={actor.profile_path 
                                ? `https://image.tmdb.org/t/p/w154${actor.profile_path}`
                                : 'https://via.placeholder.com/154x154'
                              }
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium">{actor.name}</p>
                          <p className="text-xs text-gray-400">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediaType === 'tv' && seasons.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Seasons</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {seasons.map((season) => (
                        <button
                          key={season.season_number}
                          onClick={() => handleSeasonSelect(season.season_number)}
                          className={`p-4 rounded-lg border transition-all ${
                            selectedSeason === season.season_number
                              ? 'border-[#ea384c] bg-[#ea384c]/10'
                              : 'border-[#2a2a2a] hover:border-[#ea384c]/50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">Season {season.season_number}</div>
                            <div className="text-sm text-gray-400">{season.episode_count} Episodes</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedSeason !== null && episodes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4">Episodes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {episodes.map((episode) => (
                            <button
                              key={episode.episode_number}
                              onClick={() => onSelectEpisode?.(selectedSeason, episode.episode_number)}
                              className="p-4 rounded-lg border border-[#2a2a2a] hover:border-[#ea384c]/50 transition-all"
                            >
                              <div className="text-center">
                                <h5 className="font-medium">Episode {episode.episode_number}</h5>
                                <p className="text-sm text-gray-400 line-clamp-1">{episode.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDetails;