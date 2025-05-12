// Модуль для роботи з API TMDB
const trailerCache = {};
const categoryCache = {};

const Api = {
  // Очищення кешу
  clear: function () {
    Object.keys(trailerCache).forEach((key) => delete trailerCache[key]);
    Object.keys(categoryCache).forEach((key) => delete categoryCache[key]);
  },

  // Отримання основних даних для головної сторінки
  main: function (onSuccess, onError) {
    const types = [
      { type: 'trailers_popular', url: '/discover/movie?sort_by=popularity.desc' },
      { type: 'trailers_in_theaters', url: '/movie/now_playing' },
      { type: 'trailers_upcoming_movies', url: '/movie/upcoming' },
      { type: 'trailers_popular_series', url: '/discover/tv?sort_by=popularity.desc' },
      { type: 'trailers_new_series_seasons', url: '/tv/on_the_air' },
      { type: 'trailers_upcoming_series', url: '/tv/on_the_air' },
    ];

    const results = [];
    let completed = 0;

    types.forEach((item) => {
      if (categoryCache[item.type]) {
        results.push(categoryCache[item.type]);
        completed++;
        if (completed === types.length) {
          onSuccess(results);
        }
        return;
      }

      Lampa.TMDB.get(item.url, { language: Lampa.Storage.get('language', 'ru') }, (data) => {
        const result = {
          title: Lampa.Lang.translate(item.type),
          results: data.results || [],
          url: item.url,
          type: item.type,
        };
        categoryCache[item.type] = result;
        results.push(result);
        completed++;
        if (completed === types.length) {
          onSuccess(results);
        }
      }, () => {
        completed++;
        if (completed === types.length) {
          onSuccess(results);
        }
      });
    });
  },

  // Отримання повних даних для сторінки трейлерів
  full: function (params, onSuccess, onError) {
    const lang = Lampa.Storage.get('language', 'ru');
    const cacheKey = `${params.type}_${params.page}_${lang}`;
    
    if (categoryCache[cacheKey]) {
      onSuccess(categoryCache[cacheKey]);
      return;
    }

    Lampa.TMDB.get(
      params.url,
      { language: lang, page: params.page },
      (data) => {
        const result = {
          results: data.results || [],
          page: data.page || 1,
          total_pages: data.total_pages || 1,
        };
        categoryCache[cacheKey] = result;
        onSuccess(result);
      },
      onError
    );
  },

  // Отримання відео для картки
  videos: function (data, onSuccess, onError) {
    const cacheKey = `video_${data.id}_${Lampa.Storage.get('language', 'ru')}`;
    
    if (trailerCache[cacheKey]) {
      onSuccess(trailerCache[cacheKey]);
      return;
    }

    Lampa.TMDB.get(
      `/${data.name ? 'tv' : 'movie'}/${data.id}/videos`,
      { language: Lampa.Storage.get('language', 'ru') },
      (videos) => {
        trailerCache[cacheKey] = videos;
        onSuccess(videos);
      },
      onError
    );
  },
};

// Функція для отримання бажаних мов
function getPreferredLanguage() {
  const lang = Lampa.Storage.get('language', 'ru');
  return lang === 'uk' ? ['uk', 'en'] : lang === 'ru' ? ['ru', 'en'] : ['en'];
}

export { Api, getPreferredLanguage };
