export const determineMediaType = (media: any): 'movie' | 'tv' => {
  // First check explicit media_type as it's most reliable
  if (media.media_type === 'tv' || media.media_type === 'movie') {
    return media.media_type;
  }

  // Check for TV show specific properties
  if (
    media.first_air_date ||
    media.number_of_seasons ||
    media.episode_run_time ||
    media.type === 'tv' ||
    media.origin_country ||
    media.original_name ||
    (media.name && !media.title)
  ) {
    return 'tv';
  }

  // Check for movie specific properties
  if (
    media.release_date ||
    media.runtime ||
    media.original_title ||
    (media.title && !media.name) ||
    media.type === 'movie'
  ) {
    return 'movie';
  }

  // Default to movie if we can't determine
  return 'movie';
};