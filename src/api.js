(function() {
  'use strict';

  var network = new Lampa.Reguest();
  var tmdb_api_key = Lampa.TMDB.key();
  var tmdb_base_url = 'https://api.themoviedb.org/3';
  var trailerCache = {};
  var categoryCache = {};

  function get(url, page, resolve, reject, overrideLanguage) {
    var lang = TrailerPlugin.Utils.getInterfaceLanguage();
    var language = overrideLanguage || (lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US');
    var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + language;
    console.log('API Request:', full_url);
    network.silent(full_url, function(data) {
      console.log('API Response:', url, 'Page:', page, 'Results:', data.results?.length || 0);
      resolve(data);
    }, function(error) {
      console.error('API Request Failed:', url, 'Page:', page, 'Error:', error);
      reject(error);
    });
  }

  function getLocalMoviesInTheaters(page, resolve, reject) {
    var region = TrailerPlugin.Utils.getRegion();
    var lang = TrailerPlugin.Utils.getInterfaceLanguage();
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
    var today = new Date();
    var daysThreshold = 45;
    var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    var now_playing_url = tmdb_base_url + '/movie/now_playing?api_key=' + tmdb_api_key + '&language=' + language + '&page=' + page + '®ion=' + region + '&primary_release_date.gte=' + startDate;
    console.log('In Theaters Request:', now_playing_url);
    network.silent(now_playing_url, function(data) {
      console.log('In Theaters Raw Results:', data.results?.length || 0);
      if (data.results && data.results.length) {
        var totalRequests = data.results.length;
        var completedRequests = 0;

        function finalizeResults() {
          var filteredResults = data.results.filter(function(m) {
            return m.id; // Мінімальна фільтрація
          });
          filteredResults.sort(function(a, b) {
            var dateA = a.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
            var dateB = b.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
            return new Date(dateB) - new Date(dateA);
          });
          data.results = filteredResults;
          console.log('In Theaters Filtered Results:', filteredResults.length);
          resolve(data);
        }

        data.results.forEach(function(movie) {
          var movie_id = movie.id;
          if (movie_id) {
            var release_url = tmdb_base_url + '/movie/' + movie_id + '/release_dates?api_key=' + tmdb_api_key;
            network.silent(release_url, function(release_data) {
              movie.release_details = release_data;
              completedRequests++;
              if (completedRequests === totalRequests) {
                finalizeResults();
              }
            }, function() {
              movie.release_details = { results: [] };
              completedRequests++;
              if (completedRequests === totalRequests) {
                finalizeResults();
              }
            });
          } else {
            movie.release_details = { results: [] };
            completedRequests++;
            if (completedRequests === totalRequests) {
                finalizeResults();
            }
          }
        });
      } else {
        console.log('In Theaters: No Results');
        resolve(data);
      }
    }, function(error) {
      console.error('In Theaters Request Failed:', error);
      reject(error);
    });
  }

  function getUpcomingMovies(page, resolve, reject) {
    var region = TrailerPlugin.Utils.getRegion();
    var today = TrailerPlugin.Utils.getFormattedDate(0);
    var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);
    var lang = TrailerPlugin.Utils.getInterfaceLanguage();
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
    var maxPages = 30;
    var allMovies = [];
    var currentPage = 1;
    var totalPages = 1;

    function fetchPage(pageToFetch) {
      var upcoming_url = tmdb_base_url + '/movie/upcoming?api_key=' + tmdb_api_key + '&language=' + language + '&page=' + pageToFetch + '®ion=' + region;
      console.log('Upcoming Movies Request:', upcoming_url);
      network.silent(upcoming_url, function(data) {
        console.log('Upcoming Movies Raw Results:', data.results?.length || 0);
        if (data.results && data.results.length) {
          totalPages = Math.min(data.total_pages || maxPages, maxPages);
          var totalRequests = data.results.length;
          var completedRequests = 0;

          function processPageResults() {
            completedRequests++;
            if (completedRequests === totalRequests) {
              if (currentPage < totalPages && pageToFetch === currentPage) {
                currentPage++;
                fetchPage(currentPage);
              } else {
                finalizeResults();
              }
            }
          }

          data.results.forEach(function(movie) {
            var movie_id = movie.id;
            if (movie_id) {
              var release_url = tmdb_base_url + '/movie/' + movie_id + '/release_dates?api_key=' + tmdb_api_key;
              network.silent(release_url, function(release_data) {
                movie.release_details = release_data;
                allMovies.push(movie);
                processPageResults();
              }, function() {
                movie.release_details = { results: [] };
                processPageResults();
              });
            } else {
              processPageResults();
            }
          });
        } else {
          finalizeResults();
        }
      }, function(error) {
        console.error('Upcoming Movies Request Failed:', error);
        if (pageToFetch === 1) {
          reject(error);
        } else {
          finalizeResults();
        }
      });
    }

    function finalizeResults() {
      var filteredResults = allMovies.filter(function(m) {
        return m.id; // Мінімальна фільтрація
      });
      filteredResults.sort(function(a, b) {
        var dateA = a.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
        var dateB = b.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
        return new Date(dateA) - new Date(dateB);
      });
      var result = {
        page: page,
        results: filteredResults,
        total_pages: 1,
        total_results: filteredResults.length
      };
      console.log('Upcoming Movies Filtered Results:', filteredResults.length);
      resolve(result);
    }

    fetchPage(page);
  }

  function main(oncomplite, onerror) {
    var status = new Lampa.Status(6);
    status.onComplite = function() {
      var fulldata = [];
      var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
      keys.forEach(function(key) {
        if (status.data[key] && status.data[key].results && status.data[key].results.length > 0) {
          console.log('Category Loaded:', key, 'Results:', status.data[key].results.length);
          categoryCache[key] = {
            results: status.data[key].results,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
          fulldata.push(status.data[key]);
        } else {
          console.warn('Category Empty or Failed:', key, 'Data:', status.data[key]?.results?.length || 0);
        }
      });
      console.log('Total Categories Loaded:', fulldata.length);
      if (fulldata.length > 0) {
        oncomplite(fulldata);
      } else {
        console.error('No Categories Loaded, Calling onerror');
        onerror();
      }
    };

    var append = function(title, name, url, json) {
      json.title = title;
      json.type = name;
      json.url = url;
      console.log('Appending Category:', name, 'Results:', json.results.length);
      status.append(name, json);
    };

    var today = TrailerPlugin.Utils.getFormattedDate(0);
    var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);
    var threeMonthsAgo = TrailerPlugin.Utils.getFormattedDate(90);
    var threeMonthsLater = TrailerPlugin.Utils.getFormattedDate(-90);

    get('/trending/movie/day', 1, function(json) {
      console.log('Popular Movies Raw Results:', json.results?.length || 0);
      var filteredResults = json.results ? json.results.filter(function(movie) {
        return movie.id;
      }) : [];
      console.log('Popular Movies Filtered Results:', filteredResults.length);
      append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/day', { results: filteredResults });
    }, function(error) {
      console.warn('Popular Movies Request Failed:', error);
      append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/day', { results: [] });
    });

    getLocalMoviesInTheaters(1, function(json) {
      append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: json.results || [] });
    }, function(error) {
      console.warn('In Theaters Request Failed:', error);
      append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: [] });
    });

    getUpcomingMovies(1, function(json) {
      append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: json.results || [] });
    }, function(error) {
      console.warn('Upcoming Movies Request Failed:', error);
      append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: [] });
    });

    get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      console.log('Popular Series Raw Results:', json.results?.length || 0);
      var filteredResults = json.results ? json.results.filter(function(item) {
        return item.id;
      }) : [];
      filteredResults.forEach(function(series) {
        series.release_details = { first_air_date: series.first_air_date };
      });
      console.log('Popular Series Filtered Results:', filteredResults.length);
      append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: filteredResults });
    }, function(error) {
      console.warn('Popular Series Request Failed:', error);
      append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      console.log('New Series/Seasons Raw Results:', json.results?.length || 0);
      var filteredResults = json.results ? json.results.filter(function(item) {
        return item.id;
      }) : [];
      filteredResults.forEach(function(series) {
        series.release_details = { first_air_date: series.first_air_date };
      });
      console.log('New Series/Seasons Filtered Results:', filteredResults.length);
      append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater, { results: filteredResults });
    }, function(error) {
      console.warn('New Series/Seasons Request Failed:', error);
      append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater, { results: [] });
    });

    get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      console.log('Upcoming Series Raw Results:', json.results?.length || 0);
      var filteredResults = json.results ? json.results.filter(function(item) {
        return item.id;
      }) : [];
      filteredResults.forEach(function(series) {
        series.release_details = { first_air_date: series.first_air_date };
      });
      console.log('Upcoming Series Filtered Results:', filteredResults.length);
      append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater, { results: filteredResults });
    }, function(error) {
      console.warn('Upcoming Series Request Failed:', error);
      append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater, { results: [] });
    });
  }

  function full(params, oncomplite, onerror) {
    if (params.type === 'in_theaters') {
      var region = TrailerPlugin.Utils.getRegion();
      var today = new Date();
      var daysThreshold = 45;
      var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      var accumulatedResults = [];
      var loadedPages = new Set();
      var currentPage = 1;
      var maxPages = 30;
      var totalPagesFromFirstResponse = 0;

      var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
      if (cachedData && cachedData.results && cachedData.results.length > 0) {
        accumulatedResults = cachedData.results;
        var result = {
          dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
          page: params.page,
          results: accumulatedResults,
          total_pages: 1,
          total_results: accumulatedResults.length
        };
        console.log('In Theaters Cache:', accumulatedResults.length, 'Page:', params.page);
        oncomplite(result);
        return;
      }

      function fetchNextPage() {
        if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
          finalizeResults();
          return;
        }

        loadedPages.add(currentPage);
        getLocalMoviesInTheaters(currentPage, function(result) {
          if (result && result.results && result.results.length) {
            accumulatedResults = accumulatedResults.concat(result.results);
            if (currentPage === 1) {
              totalPagesFromFirstResponse = result.total_pages || maxPages;
            }
            if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
              finalizeResults();
            } else {
              currentPage++;
              fetchNextPage();
            }
          } else {
            if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
              currentPage++;
              fetchNextPage();
            } else {
              finalizeResults();
            }
          }
        }, onerror);
      }

      function finalizeResults() {
        var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
        finalResults.sort(function(a, b) {
          var dateA = a.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
          var dateB = b.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
          return new Date(dateB) - new Date(dateA);
        });
        finalResults = finalResults.filter(function(m) {
          return m.id;
        });
        var result = {
          dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
          page: params.page,
          results: finalResults,
          total_pages: 1,
          total_results: finalResults.length
        };
        console.log('In Theaters Final Results:', finalResults.length, 'Page:', params.page);
        categoryCache['in_theaters'] = {
          results: finalResults,
          timestamp: Date.now()
        };
        Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
        oncomplite(result);
      }

      fetchNextPage();
    } else if (params.type === 'upcoming_movies') {
      var region = TrailerPlugin.Utils.getRegion();
      var today = TrailerPlugin.Utils.getFormattedDate(0);
      var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);
      var accumulatedResults = [];
      var loadedPages = new Set();
      var currentPage = 1;
      var maxPages = 30;
      var totalPagesFromFirstResponse = 0;

      var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
      if (cachedData && cachedData.results && cachedData.results.length > 0) {
        accumulatedResults = cachedData.results;
        var result = {
          dates: { maximum: sixMonthsLater, minimum: today },
          page: params.page,
          results: accumulatedResults,
          total_pages: 1,
          total_results: accumulatedResults.length
        };
        console.log('Upcoming Movies Cache:', accumulatedResults.length, 'Page:', params.page);
        oncomplite(result);
        return;
      }

      function fetchNextPage() {
        if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
          finalizeResults();
          return;
        }

        loadedPages.add(currentPage);
        getUpcomingMovies(currentPage, function(result) {
          if (result && result.results && result.results.length) {
            accumulatedResults = accumulatedResults.concat(result.results);
            if (currentPage === 1) {
              totalPagesFromFirstResponse = result.total_pages || maxPages;
            }
            if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
              finalizeResults();
            } else {
              currentPage++;
              fetchNextPage();
            }
          } else {
            if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
              currentPage++;
              fetchNextPage();
            } else {
              finalizeResults();
            }
          }
        }, function() {
          finalizeResults();
        });
      }

      function finalizeResults() {
        var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
        finalResults.sort(function(a, b) {
          var dateA = a.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
          var dateB = b.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
          return new Date(dateA) - new Date(dateB);
        });
        finalResults = finalResults.filter(function(m) {
          return m.id;
        });
        var result = {
          dates: { maximum: sixMonthsLater, minimum: today },
          page: params.page,
          results: finalResults,
          total_pages: 1,
          total_results: finalResults.length
        };
        console.log('Upcoming Movies Final Results:', finalResults.length, 'Page:', params.page);
        categoryCache['upcoming_movies'] = {
          results: finalResults,
          timestamp: Date.now()
        };
        Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
        oncomplite(result);
      }

      fetchNextPage();
    } else if (params.type === 'popular_series' || params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
      var threeMonthsAgo = TrailerPlugin.Utils.getFormattedDate(90);
      var threeMonthsLater = TrailerPlugin.Utils.getFormattedDate(-90);
      var today = TrailerPlugin.Utils.getFormattedDate(0);
      var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);

      var cachedData = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, null);
      if (cachedData && cachedData.results && cachedData.results.length > 0) {
        var targetCards = 20;
        var startIdx = (params.page - 1) * targetCards;
        var endIdx = params.page * targetCards;
        var result = {
          page: params.page,
          results: cachedData.results.slice(startIdx, endIdx),
          total_pages: Math.ceil(cachedData.results.length / targetCards),
          total_results: cachedData.results.length
        };
        console.log(params.type + ' Cache:', result.results.length, 'Page:', params.page);
        oncomplite(result);
        return;
      }

      var url = params.type === 'popular_series' ? '/discover/tv?sort_by=popularity.desc&vote_count.gte=1' :
                params.type === 'new_series_seasons' ? '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1' :
                '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1';

      get(url, params.page, function(result) {
        console.log(params.type + ' Raw Results:', result.results?.length || 0);
        if (result && result.results && result.results.length) {
          result.results.forEach(function(series) {
            series.release_details = { first_air_date: series.first_air_date };
          });
          result.results = result.results.filter(function(item) {
            return item.id;
          });
          console.log(params.type + ' Filtered Results:', result.results.length);
          if (params.page === 1) {
            categoryCache[params.type] = {
              results: result.results,
              timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
          } else {
            var existingCache = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, { results: [] });
            existingCache.results = existingCache.results.concat(result.results);
            categoryCache[params.type] = existingCache;
            Lampa.Storage.set('trailer_category_cache_' + params.type, existingCache);
          }
          console.log(params.type + ' Results:', result.results.length, 'Page:', params.page);
          oncomplite(result);
        } else {
          console.warn(params.type + ' No Results');
          onerror();
        }
      }, onerror);
    } else {
      var cachedData = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, null);
      if (cachedData && cachedData.results && cachedData.results.length > 0) {
        var targetCards = 20;
        var startIdx = (params.page - 1) * targetCards;
        var endIdx = params.page * targetCards;
        var result = {
          page: params.page,
          results: cachedData.results.slice(startIdx, endIdx),
          total_pages: Math.ceil(cachedData.results.length / targetCards),
          total_results: cachedData.results.length
        };
        console.log(params.type + ' Cache:', result.results.length, 'Page:', params.page);
        oncomplite(result);
        return;
      }

      get(params.url, params.page, function(result) {
        console.log(params.type + ' Raw Results:', result.results?.length || 0);
        if (result && result.results && result.results.length) {
          result.results = result.results.filter(function(item) {
            return item.id;
          });
          console.log(params.type + ' Filtered Results:', result.results.length);
          if (params.page === 1) {
            categoryCache[params.type] = {
              results: result.results,
              timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
          } else {
            var existingCache = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, { results: [] });
            existingCache.results = existingCache.results.concat(result.results);
            categoryCache[params.type] = existingCache;
            Lampa.Storage.set('trailer_category_cache_' + params.type, existingCache);
          }
          console.log(params.type + ' Results:', result.results.length, 'Page:', params.page);
          oncomplite(result);
        } else {
          console.warn(params.type + ' No Results');
          onerror();
        }
      }, onerror);
    }
  }

  function videos(card, oncomplite, onerror) {
    var type = card.name ? 'tv' : 'movie';
    var id = card.id;
    var cacheKey = type + '_' + id;

    if (trailerCache[cacheKey]) {
      console.log('Videos Cache Hit:', cacheKey);
      oncomplite(trailerCache[cacheKey]);
      return;
    }

    var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key;
    var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
    var attempts = 0;
    var maxAttempts = preferredLangs.length + 1;
    var tmdbTrailers = [];

    function tryFetch(langIndex) {
      if (attempts >= maxAttempts) {
        var englishTrailer = tmdbTrailers.find(function(v) {
          return v.iso_639_1 === 'en';
        });
        if (englishTrailer) {
          trailerCache[cacheKey] = { id: id, results: [englishTrailer] };
          console.log('Videos Fallback to English:', cacheKey);
          oncomplite({ id: id, results: [englishTrailer] });
        } else {
          trailerCache[cacheKey] = { id: id, results: [] };
          console.log('Videos No Trailers:', cacheKey);
          onerror();
        }
        return;
      }

      var fetchUrl = url;
      if (langIndex < preferredLangs.length) {
        fetchUrl += '&language=' + preferredLangs[langIndex];
      }
      console.log('Videos Request:', fetchUrl);
      network.silent(fetchUrl, function(result) {
        var trailers = result.results ? result.results.filter(function(v) {
          return v.type === 'Trailer';
        }) : [];
        console.log('Videos Response:', trailers.length, 'Lang:', preferredLangs[langIndex] || 'default');
        tmdbTrailers = tmdbTrailers.concat(trailers);
        var preferredTrailer = trailers.find(function(v) {
          return preferredLangs.includes(v.iso_639_1);
        });
        if (preferredTrailer) {
          trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
          console.log('Videos Found Preferred:', cacheKey);
          oncomplite({ id: id, results: [preferredTrailer] });
        } else {
          attempts++;
          tryFetch(langIndex + 1);
        }
      }, function(error) {
        console.error('Videos Request Failed:', fetchUrl, 'Error:', error);
        attempts++;
        tryFetch(langIndex + 1);
      });
    }

    tryFetch(0);
  }

  function clear() {
    console.log('Clearing API Cache');
    network.clear();
    trailerCache = {};
    categoryCache = {};
    ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function(key) {
      Lampa.Storage.set('trailer_category_cache_' + key, null);
    });
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Api = {
    get: get,
    getLocalMoviesInTheaters: getLocalMoviesInTheaters,
    getUpcomingMovies: getUpcomingMovies,
    main: main,
    full: full,
    videos: videos,
    clear: clear
  };
})();
