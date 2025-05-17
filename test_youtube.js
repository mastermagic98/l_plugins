(function() {
  'use strict';

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function getFormattedDate(daysAgo) {
    var today = new Date();
    if (daysAgo) today.setDate(today.getDate() - daysAgo);
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }

  function getRegion() {
    var lang = Lampa.Storage.get('language', 'ru');
    return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
  }

  function getInterfaceLanguage() {
    return Lampa.Storage.get('language', 'ru');
  }

  function getPreferredLanguage() {
    var lang = Lampa.Storage.get('language', 'ru');
    if (lang === 'uk') {
      return ['uk', 'en'];
    } else if (lang === 'ru') {
      return ['ru', 'en'];
    } else {
      return ['en'];
    }
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Utils = {
    debounce: debounce,
    getFormattedDate: getFormattedDate,
    formatDateToDDMMYYYY: formatDateToDDMMYYYY,
    getRegion: getRegion,
    getInterfaceLanguage: getInterfaceLanguage,
    getPreferredLanguage: getPreferredLanguage
  };
})();
(function() {
  'use strict';

  var network = new Lampa.Reguest();
  var tmdb_api_key = Lampa.TMDB.key();
  var tmdb_base_url = 'https://api.themoviedb.org/3';
  var trailerCache = {};
  var categoryCache = {};

  function get(url, page, resolve, reject) {
    var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + TrailerPlugin.Utils.getInterfaceLanguage();
    network.silent(full_url, resolve, reject);
  }

  function getLocalMoviesInTheaters(page, resolve, reject) {
    var region = TrailerPlugin.Utils.getRegion();
    var language = TrailerPlugin.Utils.getInterfaceLanguage();
    var today = new Date();
    var daysThreshold = 45;
    var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    var now_playing_url = tmdb_base_url + '/movie/now_playing?api_key=' + tmdb_api_key + '&language=' + language + '&page=' + page + '®ion=' + region + '&primary_release_date.gte=' + startDate;
    network.silent(now_playing_url, function(data) {
      if (data.results && data.results.length) {
        var totalRequests = data.results.length;
        var completedRequests = 0;

        function finalizeResults() {
          var filteredResults = data.results.filter(function(m) {
            if (m.release_details && m.release_details.results) {
              var regionRelease = m.release_details.results.find(function(r) {
                return r.iso_3166_1 === region;
              });
              if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
                var releaseDate = new Date(regionRelease.release_dates[0].release_date);
                return releaseDate >= new Date(startDate) && releaseDate <= today;
              }
            }
            if (m.release_date) {
              var globalReleaseDate = new Date(m.release_date);
              return globalReleaseDate >= new Date(startDate) && globalReleaseDate <= today;
            }
            return false;
          });
          filteredResults.sort(function(a, b) {
            var dateA = a.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
            var dateB = b.release_details?.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
            return new Date(dateB) - new Date(dateA);
          });
          data.results = filteredResults;
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
        resolve(data);
      }
    }, reject);
  }

  function getUpcomingMovies(page, resolve, reject) {
    var region = TrailerPlugin.Utils.getRegion();
    var today = TrailerPlugin.Utils.getFormattedDate(0);
    var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);
    var lang = Lampa.Storage.get('language', 'ru');
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
    var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
    var maxPages = 30;
    var allMoviesWithTrailers = [];
    var currentPage = 1;
    var totalPages = 1;

    function fetchPage(pageToFetch) {
      var upcoming_url = tmdb_base_url + '/movie/upcoming?api_key=' + tmdb_api_key + '&language=' + language + '&page=' + pageToFetch + '®ion=' + region;
      network.silent(upcoming_url, function(data) {
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
              var video_url = tmdb_base_url + '/movie/' + movie_id + '/videos?api_key=' + tmdb_api_key + '&language=' + (preferredLangs[0] || 'en');
              var cacheKey = 'movie_' + movie_id;

              if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                network.silent(release_url, function(release_data) {
                  movie.release_details = release_data;
                  var releaseDate = movie.release_date || (release_data.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date);
                  if (releaseDate && new Date(releaseDate) >= new Date(today) && new Date(releaseDate) <= new Date(sixMonthsLater)) {
                    allMoviesWithTrailers.push(movie);
                  }
                  processPageResults();
                }, function() {
                  movie.release_details = { results: [] };
                  processPageResults();
                });
              } else {
                network.silent(video_url, function(video_data) {
                  var trailers = video_data.results ? video_data.results.filter(function(v) {
                    return v.type === 'Trailer';
                  }) : [];
                  var hasTrailer = trailers.length > 0;

                  if (hasTrailer) {
                    trailerCache[cacheKey] = { id: movie_id, results: trailers };
                    network.silent(release_url, function(release_data) {
                      movie.release_details = release_data;
                      var releaseDate = movie.release_date || (release_data.results?.find(function(r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date);
                      if (releaseDate && new Date(releaseDate) >= new Date(today) && new Date(releaseDate) <= new Date(sixMonthsLater)) {
                        allMoviesWithTrailers.push(movie);
                      }
                      processPageResults();
                    }, function() {
                      movie.release_details = { results: [] };
                      processPageResults();
                    });
                  } else {
                    processPageResults();
                  }
                }, function() {
                  processPageResults();
                });
              }
            } else {
              processPageResults();
            }
          });
        } else {
          finalizeResults();
        }
      }, function() {
        if (pageToFetch === 1) {
          reject();
        } else {
          finalizeResults();
        }
      });
    }

    function finalizeResults() {
      var filteredResults = allMoviesWithTrailers.filter(function(m) {
        if (m.release_details && m.release_details.results) {
          var regionRelease = m.release_details.results.find(function(r) {
            return r.iso_3166_1 === region;
          });
          if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
            return true;
          }
        }
        return !!m.release_date;
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
      console.log('getUpcomingMovies results:', filteredResults.length, 'Page:', page);
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
        if (status.data[key] && status.data[key].results && status.data[key].results.length) {
          categoryCache[key] = {
            results: status.data[key].results,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
          fulldata.push(status.data[key]);
        }
      });
      if (fulldata.length) {
        oncomplite(fulldata);
      } else {
        onerror();
      }
    };

    var append = function(title, name, url, json) {
      json.title = title;
      json.type = name;
      json.url = url;
      status.append(name, json);
    };

    var today = TrailerPlugin.Utils.getFormattedDate(0);
    var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);
    var threeMonthsAgo = TrailerPlugin.Utils.getFormattedDate(90);
    var threeMonthsLater = TrailerPlugin.Utils.getFormattedDate(-90);

    get('/discover/movie?sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      if (json.results && json.results.length) {
        var totalRequests = json.results.length;
        var completedRequests = 0;
        var filteredResults = [];
        var lang = TrailerPlugin.Utils.getInterfaceLanguage();
        var targetLang = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';

        json.results.forEach(function(movie) {
          var movie_id = movie.id;
          var cacheKey = 'movie_' + movie_id;

          // Перевіряємо дубльовану назву
          var hasTranslatedTitle = lang === 'uk' ? !!movie.title : lang === 'ru' ? !!movie.title : true;

          if (movie_id && hasTranslatedTitle) {
            // Перевіряємо кеш трейлера
            if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
              // Додаємо release_details
              var release_url = tmdb_base_url + '/movie/' + movie_id + '/release_dates?api_key=' + tmdb_api_key;
              network.silent(release_url, function(release_data) {
                movie.release_details = release_data;
                filteredResults.push(movie);
                completedRequests++;
                if (completedRequests === totalRequests) {
                  finalizePopularMovies();
                }
              }, function() {
                movie.release_details = { results: [] };
                filteredResults.push(movie);
                completedRequests++;
                if (completedRequests === totalRequests) {
                  finalizePopularMovies();
                }
              });
            } else {
              var video_url = tmdb_base_url + '/movie/' + movie_id + '/videos?api_key=' + tmdb_api_key + '&language=' + targetLang;
              network.silent(video_url, function(video_data) {
                var trailers = video_data.results ? video_data.results.filter(function(v) {
                  return v.type === 'Trailer';
                }) : [];
                if (trailers.length > 0) {
                  trailerCache[cacheKey] = { id: movie_id, results: trailers };
                  // Додаємо release_details
                  var release_url = tmdb_base_url + '/movie/' + movie_id + '/release_dates?api_key=' + tmdb_api_key;
                  network.silent(release_url, function(release_data) {
                    movie.release_details = release_data;
                    filteredResults.push(movie);
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                      finalizePopularMovies();
                    }
                  }, function() {
                    movie.release_details = { results: [] };
                    filteredResults.push(movie);
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                      finalizePopularMovies();
                    }
                  });
                } else {
                  completedRequests++;
                  if (completedRequests === totalRequests) {
                    finalizePopularMovies();
                  }
                }
              }, function() {
                completedRequests++;
                if (completedRequests === totalRequests) {
                  finalizePopularMovies();
                }
              });
            }
          } else {
            completedRequests++;
            if (completedRequests === totalRequests) {
              finalizePopularMovies();
            }
          }
        });

        function finalizePopularMovies() {
          json.results = filteredResults;
          append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: json.results });
        }
      } else {
        append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: [] });
      }
    }, function() {
      append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: [] });
    });

    getLocalMoviesInTheaters(1, function(json) {
      append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: json.results || [] });
    }, function() {
      append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: [] });
    });

    getUpcomingMovies(1, function(json) {
      append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: json.results || [] });
    }, function() {
      append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: [] });
    });

    get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      var filteredResults = json.results ? json.results.filter(function(item) {
        return !item.genre_ids.includes(99) && !item.genre_ids.includes(10763) && !item.genre_ids.includes(10764);
      }) : [];
      append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: filteredResults });
    }, function() {
      append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      if (json.results) {
        json.results.forEach(function(series) {
          series.release_details = { first_air_date: series.first_air_date };
        });
      }
      append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
    }, function() {
      append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function(json) {
      if (json.results) {
        json.results.forEach(function(series) {
          series.release_details = { first_air_date: series.first_air_date };
        });
      }
      append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
    }, function() {
      append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
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
        console.log('In theaters cache:', accumulatedResults.length, 'Page:', params.page);
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
          return m.poster_path && m.poster_path !== '';
        });
        var result = {
          dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
          page: params.page,
          results: finalResults,
          total_pages: 1,
          total_results: finalResults.length
        };
        console.log('In theaters final results:', finalResults.length, 'Page:', params.page);
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
        console.log('Upcoming movies cache:', accumulatedResults.length, 'Page:', params.page);
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
          return m.poster_path && m.poster_path !== '';
        });
        var result = {
          dates: { maximum: sixMonthsLater, minimum: today },
          page: params.page,
          results: finalResults,
          total_pages: 1,
          total_results: finalResults.length
        };
        console.log('Upcoming movies final results:', finalResults.length, 'Page:', params.page);
        categoryCache['upcoming_movies'] = {
          results: finalResults,
          timestamp: Date.now()
        };
        Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
        oncomplite(result);
      }

      fetchNextPage();
    } else if (params.type === 'new_series_seasons') {
      var threeMonthsAgo = TrailerPlugin.Utils.getFormattedDate(90);
      var threeMonthsLater = TrailerPlugin.Utils.getFormattedDate(-90);

      var cachedData = categoryCache['new_series_seasons'] || Lampa.Storage.get('trailer_category_cache_new_series_seasons', null);
      if (cachedData && cachedData.results) {
        var targetCards = 20;
        var startIdx = (params.page - 1) * targetCards;
        var endIdx = params.page * targetCards;
        var result = {
          page: params.page,
          results: cachedData.results.slice(startIdx, endIdx),
          total_pages: Math.ceil(cachedData.results.length / targetCards),
          total_results: cachedData.results.length
        };
        if (result.results.length > 0) {
          oncomplite(result);
          return;
        }
      }

      get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function(result) {
        if (result && result.results && result.results.length) {
          result.results.forEach(function(series) {
            series.release_details = { first_air_date: series.first_air_date };
          });
          if (params.page === 1) {
            categoryCache['new_series_seasons'] = {
              results: result.results,
              timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_new_series_seasons', categoryCache['new_series_seasons']);
          } else {
            var existingCache = categoryCache['new_series_seasons'] || Lampa.Storage.get('trailer_category_cache_new_series_seasons', { results: [] });
            existingCache.results = existingCache.results.concat(result.results);
            categoryCache['new_series_seasons'] = existingCache;
            Lampa.Storage.set('trailer_category_cache_new_series_seasons', existingCache);
          }
          oncomplite(result);
        } else {
          onerror();
        }
      }, onerror);
    } else if (params.type === 'upcoming_series') {
      var today = TrailerPlugin.Utils.getFormattedDate(0);
      var sixMonthsLater = TrailerPlugin.Utils.getFormattedDate(-180);

      var cachedData = categoryCache['upcoming_series'] || Lampa.Storage.get('trailer_category_cache_upcoming_series', null);
      if (cachedData && cachedData.results) {
        var targetCards = 20;
        var startIdx = (params.page - 1) * targetCards;
        var endIdx = params.page * targetCards;
        var result = {
          page: params.page,
          results: cachedData.results.slice(startIdx, endIdx),
          total_pages: Math.ceil(cachedData.results.length / targetCards),
          total_results: cachedData.results.length
        };
        if (result.results.length > 0) {
          oncomplite(result);
          return;
        }
      }

      get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function(result) {
        if (result && result.results && result.results.length) {
          result.results.forEach(function(series) {
            series.release_details = { first_air_date: series.first_air_date };
          });
          if (params.page === 1) {
            categoryCache['upcoming_series'] = {
              results: result.results,
              timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_upcoming_series', categoryCache['upcoming_series']);
          } else {
            var existingCache = categoryCache['upcoming_series'] || Lampa.Storage.get('trailer_category_cache_upcoming_series', { results: [] });
            existingCache.results = existingCache.results.concat(result.results);
            categoryCache['upcoming_series'] = existingCache;
            Lampa.Storage.set('trailer_category_cache_upcoming_series', existingCache);
          }
          oncomplite(result);
        } else {
          onerror();
        }
      }, onerror);
    } else {
      var cachedData = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, null);
      if (cachedData && cachedData.results) {
        var targetCards = 20;
        var startIdx = (params.page - 1) * targetCards;
        var endIdx = params.page * targetCards;
        var result = {
          page: params.page,
          results: cachedData.results.slice(startIdx, endIdx),
          total_pages: Math.ceil(cachedData.results.length / targetCards),
          total_results: cachedData.results.length
        };
        if (result.results.length > 0) {
          oncomplite(result);
          return;
        }
      }

      get(params.url, params.page, function(result) {
        if (result && result.results && result.results.length) {
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
          oncomplite(result);
        } else {
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
          oncomplite({ id: id, results: [englishTrailer] });
        } else {
          trailerCache[cacheKey] = { id: id, results: [] };
          onerror();
        }
        return;
      }

      var fetchUrl = url;
      if (langIndex < preferredLangs.length) {
        fetchUrl += '&language=' + preferredLangs[langIndex];
      }
      network.silent(fetchUrl, function(result) {
        var trailers = result.results ? result.results.filter(function(v) {
          return v.type === 'Trailer';
        }) : [];
        tmdbTrailers = tmdbTrailers.concat(trailers);
        var preferredTrailer = trailers.find(function(v) {
          return preferredLangs.includes(v.iso_639_1);
        });
        if (preferredTrailer) {
          trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
          oncomplite({ id: id, results: [preferredTrailer] });
        } else {
          attempts++;
          tryFetch(langIndex + 1);
        }
      }, function() {
        attempts++;
        tryFetch(langIndex + 1);
      });
    }

    tryFetch(0);
  }

  function clear() {
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
(function() {
  'use strict';

  function Trailer(data, params) {
    var _this = this;
    this.card = null;
    this.img = null;
    this.is_youtube = params.type === 'rating';
    this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
    this.trailer_lang = '';
    this.release_date = '-';
    this.visibled = false;

    this.build = function() {
      this.card = Lampa.Template.get('trailer', data);
      this.img = this.card.find('img')[0];

      if (!this.is_youtube) {
        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var title = data.title || data.name || data.original_title || data.original_name;
        this.card.find('.card__title').text(title);
        this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
        if (this.rating !== '-') {
          this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div>');
        } else {
          this.card.find('.card__view').append('<div class="card__rating">-</div>');
        }
        this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
        this.card.find('.card__view').append('<div class="card__release-date"></div>');
      } else {
        this.card.find('.card__title').text(data.name);
        this.card.find('.card__details').remove();
      }
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
      }
      return '';
    };

    this.image = function() {
      this.img.onload = function() {
        _this.card.addClass('card--loaded');
      };
      this.img.onerror = function() {
        _this.img.src = './img/img_broken.svg';
      };
    };

    this.loadTrailerInfo = function() {
      if (!this.is_youtube && !this.trailer_lang) {
        TrailerPlugin.Api.videos(data, function(videos) {
          var trailers = videos.results ? videos.results.filter(function(v) {
            return v.type === 'Trailer';
          }) : [];
          var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
          var video = trailers.find(function(v) {
            return preferredLangs.includes(v.iso_639_1);
          }) || trailers[0];
          _this.trailer_lang = video ? video.iso_639_1 : '-';
          if (_this.trailer_lang !== '-') {
            _this.card.find('.card__trailer-lang').text(_this.trailer_lang.toUpperCase());
          } else {
            _this.card.find('.card__trailer-lang').text('-');
          }

          if (params.type === 'in_theaters' || params.type === 'upcoming_movies') {
            if (data.release_details && data.release_details.results) {
              var region = TrailerPlugin.Utils.getRegion();
              var releaseInfo = data.release_details.results.find(function(r) {
                return r.iso_3166_1 === region;
              });
              if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
                var releaseDate = releaseInfo.release_dates[0].release_date;
                _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(releaseDate);
              } else if (data.release_date) {
                _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date);
              }
            } else if (data.release_date) {
              _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date);
            }
          } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
            if (data.release_details && data.release_details.first_air_date) {
              _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_details.first_air_date);
            }
          }
          _this.card.find('.card__release-date').text(_this.release_date);
        }, function() {
          _this.trailer_lang = '-';
          _this.card.find('.card__trailer-lang').text('-');
          _this.card.find('.card__release-date').text('-');
        });
      }
    };

    this.play = function(id) {
      if (!id) {
        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        return;
      }
      try {
        if (Lampa.Manifest.app_digital >= 183) {
          var item = {
            title: Lampa.Utils.shortText(data.title || data.name, 50),
            id: id,
            youtube: true,
            url: 'https://www.youtube.com/watch?v=' + id,
            icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
            template: 'selectbox_icon'
          };
          Lampa.Player.play(item);
          Lampa.Player.playlist([item]);
        } else {
          Lampa.YouTube.play(id);
        }
      } catch (e) {
        Lampa.Noty.show('Помилка відтворення трейлера: ' + e.message);
      }
    };

    this.create = function() {
      var _this2 = this;
      this.build();
      this.card.on('hover:focus', function(e, is_mouse) {
        Lampa.Background.change(_this2.cardImgBackground(data));
        _this2.onFocus(e.target, data, is_mouse);
        _this2.loadTrailerInfo();
      }).on('hover:enter', function() {
        if (_this2.is_youtube) {
          _this2.play(data.id);
        } else {
          TrailerPlugin.Api.videos(data, function(videos) {
            var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
            var trailers = videos.results ? videos.results.filter(function(v) {
              return v.type === 'Trailer';
            }) : [];
            var video = trailers.find(function(v) {
              return preferredLangs.includes(v.iso_639_1);
            }) || trailers[0];
            if (video && video.key) {
              if (preferredLangs[0] === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
              } else if (preferredLangs[0] === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
              }
              _this2.play(video.key);
            } else {
              Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            }
          }, function() {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          });
        }
      }).on('hover:long', function() {
        if (!_this2.is_youtube) {
          var items = [{
            title: Lampa.Lang.translate('trailers_view'),
            view: true
          }];
          Lampa.Loading.start(function() {
            TrailerPlugin.Api.clear();
            Lampa.Loading.stop();
          });
          TrailerPlugin.Api.videos(data, function(videos) {
            Lampa.Loading.stop();
            var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
            var trailers = videos.results ? videos.results.filter(function(v) {
              return v.type === 'Trailer';
            }) : [];
            if (trailers.length) {
              items.push({
                title: Lampa.Lang.translate('title_trailers'),
                separator: true
              });
              trailers.forEach(function(video) {
                if (video.key && preferredLangs.includes(video.iso_639_1)) {
                  items.push({
                    title: video.name || 'Trailer',
                    id: video.key,
                    subtitle: video.iso_639_1
                  });
                }
              });
            }
            Lampa.Select.show({
              title: Lampa.Lang.translate('title_action'),
              items: items,
              onSelect: function(item) {
                Lampa.Controller.toggle('content');
                if (item.view) {
                  Lampa.Activity.push({
                    url: '',
                    component: 'full',
                    id: data.id,
                    method: data.name ? 'tv' : 'movie',
                    card: data,
                    source: 'tmdb'
                  });
                } else {
                  _this2.play(item.id);
                }
              },
              onBack: function() {
                Lampa.Controller.toggle('content');
              }
            });
          }, function() {
            Lampa.Loading.stop();
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          });
        }
      });
      this.image();
      this.loadTrailerInfo();
    };

    this.destroy = function() {
      this.img.onerror = null;
      this.img.onload = null;
      this.img.src = '';
      this.card.remove();
      this.card = null;
      this.img = null;
    };

    this.visible = function() {
      if (this.visibled) return;
      if (params.type === 'rating') {
        this.img.src = 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg';
      } else if (data.backdrop_path) {
        this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
      } else if (data.poster_path) {
        this.img.src = Lampa.Api.img(data.poster_path);
      } else {
        this.img.src = './img/img_broken.svg';
      }
      this.visibled = true;
    };

    this.render = function() {
      return this.card;
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Trailer = Trailer;
})();
(function() {
  'use strict';

  function Line(data) {
    var _this = this;
    var content = Lampa.Template.get('items_line', { title: data.title });
    var body = content.find('.items-line__body');
    var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
    var items = [];
    var active = 0;
    var more;
    var filter;
    var moreButton;
    var last;
    var visibleCards = light ? 6 : 10;
    var loadedIndex = 0;
    var isLoading = false;

    this.create = function() {
      scroll.render().find('.scroll__body').addClass('items-cards');
      content.find('.items-line__title').text(data.title);

      filter = $('<div class="items-line__more selector"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
      filter.css({
        display: 'inline-block',
        marginLeft: '10px',
        cursor: 'pointer',
        padding: '0.5em',
        background: 'transparent',
        border: 'none'
      });
      filter.on('hover:enter', function() {
        var items = [
          { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
          { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
          { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
          { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
        ];
        Lampa.Select.show({
          title: Lampa.Lang.translate('trailers_filter'),
          items: items,
          onSelect: function(item) {
            Lampa.Storage.set('trailer_category_cache_' + data.type, null);
            TrailerPlugin.Api.categoryCache[data.type] = null;
            Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
            Lampa.Activity.push({
              url: item.value === 'day' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                   item.value === 'week' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                   item.value === 'month' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + TrailerPlugin.Utils.getFormattedDate(30) :
                   '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + TrailerPlugin.Utils.getFormattedDate(365),
              title: data.title,
              component: 'trailers_main',
              type: data.type,
              page: 1
            });
          },
          onBack: function() {
            Lampa.Controller.toggle('content');
          }
        });
      });

      moreButton = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
      moreButton.on('hover:enter', function() {
        Lampa.Activity.push({
          url: data.url,
          title: data.title,
          component: 'trailers_full',
          type: data.type,
          page: Math.floor(loadedIndex / visibleCards) + 2
        });
      });

      content.find('.items-line__title').after(filter);
      filter.after(moreButton);

      this.bind();
      body.append(scroll.render());

      var debouncedLoad = TrailerPlugin.Utils.debounce(function() {
        if (scroll.isEnd() && !isLoading) {
          loadMoreCards();
        }
      }, 200);
      scroll.render().on('scroll', debouncedLoad);
    };

    function loadMoreCards() {
      if (isLoading) return;
      isLoading = true;

      var remainingCards = data.results.slice(loadedIndex, loadedIndex + visibleCards);
      if (remainingCards.length > 0) {
        remainingCards.forEach(function(element) {
          var card = new TrailerPlugin.Trailer(element, { type: data.type });
          card.create();
          card.visible();
          card.onFocus = function(target, card_data, is_mouse) {
            last = target;
            active = items.indexOf(card);
            if (_this.onFocus) _this.onFocus(card_data);
            scroll.update(card.render(), true);
            if (items.length > 0 && items.indexOf(card) === items.length - 1) {
              var message = Lampa.Lang.translate('trailers_last_movie').replace('[title]', card_data.title || card_data.name);
              Lampa.Noty.show(message);
            }
          };
          scroll.append(card.render());
          items.push(card);
        });
        loadedIndex += remainingCards.length;
        Lampa.Layer.update();
        isLoading = false;
      } else {
        Lampa.Activity.push({
          url: data.url,
          title: data.title,
          component: 'trailers_full',
          type: data.type,
          page: Math.floor(loadedIndex / visibleCards) + 2
        });
        isLoading = false;
      }
    }

    this.bind = function() {
      loadMoreCards();
      this.more();
      Lampa.Layer.update();
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
      }
      return '';
    };

    this.more = function() {
      more = Lampa.Template.get('more');
      more.addClass('more--trailers');
      more.on('hover:enter', function() {
        Lampa.Activity.push({
          url: data.url,
          title: data.title,
          component: 'trailers_full',
          type: data.type,
          page: Math.floor(loadedIndex / visibleCards) + 2
        });
      });
      more.on('hover:focus', function(e) {
        last = e.target;
        scroll.update(more, true);
      });
      scroll.append(more);
    };

    this.toggle = function() {
      var _this2 = this;
      Lampa.Controller.add('items_line', {
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
          if (last && items.length) {
            scroll.update($(last), true);
          }
        },
        right: function() {
          if (Navigator.canmove('right')) {
            Navigator.move('right');
            if (last && items.length) {
              scroll.update($(last), true);
            }
          }
          Lampa.Controller.enable('items_line');
        },
        left: function() {
          if (Navigator.canmove('left')) {
            Navigator.move('left');
            if (last && items.length) {
              scroll.update($(last), true);
            }
          } else if (_this2.onLeft) {
            _this2.onLeft();
          } else {
            Lampa.Controller.toggle('menu');
          }
        },
        down: this.onDown,
        up: this.onUp,
        gone: function() {},
        back: this.onBack
      });
      Lampa.Controller.toggle('items_line');
    };

    this.render = function() {
      return content;
    };

    this.destroy = function() {
      Lampa.Arrays.destroy(items);
      scroll.destroy();
      content.remove();
      more && more.remove();
      filter && filter.remove();
      moreButton && moreButton.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Line = Line;
})();
(function() {
  'use strict';

  function Component$1(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
    var items = [];
    var html = $('<div></div>');
    var active = 0;
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;

    this.create = function() {
      TrailerPlugin.Api.main(this.build.bind(this), this.empty.bind(this));
      return this.render();
    };

    this.empty = function() {
      var empty = new Lampa.Empty();
      html.append(empty.render());
      this.start = empty.start;
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.build = function(data) {
      var _this = this;
      scroll.minus();
      html.append(scroll.render());
      data.forEach(this.append.bind(this));
      if (light) {
        scroll.onWheel = function(step) {
          if (step > 0) _this.down();
          else _this.up();
        };
      }
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.append = function(element) {
      var item = new TrailerPlugin.Line(element);
      item.create();
      item.onDown = this.down.bind(this);
      item.onUp = this.up.bind(this);
      item.onBack = this.back.bind(this);
      item.onToggle = function() {
        active = items.indexOf(item);
      };
      item.wrap = $('<div></div>');
      if (light) {
        scroll.append(item.wrap);
      } else {
        scroll.append(item.render());
      }
      items.push(item);
    };

    this.back = function() {
      Lampa.Activity.backward();
    };

    this.detach = function() {
      if (light) {
        items.forEach(function(item) {
          item.render().detach();
        });
        items.slice(active, active + 2).forEach(function(item) {
          item.wrap.append(item.render());
        });
      }
    };

    this.down = function() {
      active++;
      active = Math.min(active, items.length - 1);
      this.detach();
      items[active].toggle();
      scroll.update(items[active].render());
    };

    this.up = function() {
      active--;
      if (active < 0) {
        active = 0;
        this.detach();
        Lampa.Controller.toggle('head');
      } else {
        this.detach();
        items[active].toggle();
      }
      scroll.update(items[active].render());
    };

    this.start = function() {
      var _this2 = this;
      if (Lampa.Activity.active().activity !== this.activity) return;
      Lampa.Controller.add('content', {
        toggle: function() {
          if (items.length) {
            _this2.detach();
            items[active].toggle();
          }
        },
        left: function() {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function() {
          Navigator.move('right');
        },
        up: function() {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function() {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: this.back
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function() {};
    this.stop = function() {};
    this.render = function() {
      return html;
    };

    this.destroy = function() {
      Lampa.Arrays.destroy(items);
      scroll.destroy();
      html.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.ComponentMain = Component$1;
})();
(function() {
  'use strict';

  function Component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
    var items = [];
    var html = $('<div></div>');
    var body = $('<div class="category-full category-full--trailers"></div>');
    var newlampa = Lampa.Manifest.app_digital >= 166;
    var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
    var total_pages = 0;
    var last;
    var waitload = false;
    var active = 0;

    this.create = function() {
      TrailerPlugin.Api.full(object, this.build.bind(this), this.empty.bind(this));
      return this.render();
    };

    this.empty = function() {
      var empty = new Lampa.Empty();
      scroll.append(empty.render());
      this.start = empty.start;
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.next = function() {
      var _this = this;
      if (waitload) return;
      if (object.page < total_pages && object.page < 30) {
        waitload = true;
        object.page++;
        TrailerPlugin.Api.full(object, function(result) {
          if (result.results && result.results.length) {
            _this.append(result, true);
          } else {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          }
          waitload = false;
        }, function() {
          Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          waitload = false;
        });
      } else {
        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
      }
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
      }
      return '';
    };

    this.append = function(data, append) {
      var _this2 = this;
      if (!append) body.empty();
      data.results.forEach(function(element) {
        var card = new TrailerPlugin.Trailer(element, { type: object.type });
        card.create();
        card.visible();
        card.onFocus = function(target, card_data) {
          last = target;
          scroll.update(card.render(), true);
          if (!light && !newlampa && scroll.isEnd()) _this2.next();
          if (items.length > 0 && items.indexOf(card) === items.length - 1) {
            var message = Lampa.Lang.translate('trailers_last_movie').replace('[title]', card_data.title || card_data.name);
            Lampa.Noty.show(message);
          }
        };
        body.append(card.render());
        items.push(card);
      });
      var cardCount = data.results.length;
      if (cardCount < 20) {
        for (var i = cardCount; i < 20; i++) {
          var placeholder = $('<div class="card card--placeholder" style="width: 33.3%; margin-bottom: 1.5em; visibility: hidden;"></div>');
          body.append(placeholder);
        }
      }
    };

    this.build = function(data) {
      var _this3 = this;
      if (data.results && data.results.length) {
        total_pages = data.total_pages || 1;
        scroll.minus();
        html.append(scroll.render());
        this.append(data);
        if (light && items.length) this.back();
        if (total_pages > data.page && items.length) {
          this.more();
        }
        scroll.append(body);
        if (newlampa) {
          scroll.onEnd = this.next.bind(this);
          scroll.onWheel = function(step) {
            if (!Lampa.Controller.own(_this3)) _this3.start();
            if (step > 0) Navigator.move('down');
            else if (active > 0) Navigator.move('up');
          }.bind(this);
          var debouncedLoad = TrailerPlugin.Utils.debounce(function() {
            if (scroll.isEnd() && !waitload) {
              _this3.next();
            }
          }, 100);
          scroll.render().on('scroll', debouncedLoad);
        }
        this.activity.loader(false);
        this.activity.toggle();
      } else {
        html.append(scroll.render());
        this.empty();
      }
    };

    this.more = function() {
      var _this = this;
      var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
      more.on('hover:enter', function() {
        var next = Lampa.Arrays.clone(object);
        delete next.activity;
        next.page = (next.page || 1) + 1;
        Lampa.Activity.push({
          url: next.url,
          title: object.title || Lampa.Lang.translate('title_trailers'),
          component: 'trailers_full',
          type: next.type,
          page: next.page
        });
      });
      body.append(more);
    };

    this.back = function() {
      last = items[0].render()[0];
      var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
      more.on('hover:enter', function() {
        if (object.page > 1) {
          Lampa.Activity.backward();
        } else {
          Lampa.Controller.toggle('head');
        }
      });
      body.prepend(more);
    };

    this.start = function() {
      if (Lampa.Activity.active().activity !== this.activity) return;
      Lampa.Controller.add('content', {
        link: this,
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
        },
        left: function() {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function() {
          Navigator.move('right');
        },
        up: function() {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function() {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: function() {
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function() {};
    this.stop = function() {};
    this.render = function() {
      return html;
    };

    this.destroy = function() {
      Lampa.Arrays.destroy(items);
      scroll.destroy();
      html.remove();
      body.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.ComponentFull = Component;
})();
(function() {
  'use strict';
 
  function initPlugin() {
    Lampa.Lang.add({
      trailers_popular: { ru: 'Популярное', uk: 'Популярне', en: 'Popular' },
      trailers_in_theaters: { ru: 'В прокате', uk: 'В прокаті', en: 'In Theaters' },
      trailers_upcoming_movies: { ru: 'Ожидаемые фильмы', uk: 'Очікувані фільми', en: 'Upcoming Movies' },
      trailers_popular_series: { ru: 'Популярные сериалы', uk: 'Популярні серіали', en: 'Popular Series' },
      trailers_new_series_seasons: { ru: 'Новые сериалы и сезоны', uk: 'Нові серіали та сезони', en: 'New Series and Seasons' },
      trailers_upcoming_series: { ru: 'Ожидаемые сериалы', uk: 'Очікувані серіали', en: 'Upcoming Series' },
      trailers_no_trailers: { ru: 'Нет трейлеров', uk: 'Немає трейлерів', en: 'No trailers' },
      trailers_no_ua_trailer: { ru: 'Нет украинского трейлера', uk: 'Немає українського трейлера', en: 'No Ukrainian trailer' },
      trailers_no_ru_trailer: { ru: 'Нет русского трейлера', uk: 'Немає російського трейлера', en: 'No Russian trailer' },
      trailers_view: { ru: 'Подробнее', uk: 'Докладніше', en: 'More' },
      title_trailers: { ru: 'Трейлеры', uk: 'Трейлери', en: 'Trailers' },
      trailers_filter: { ru: 'Фильтр', uk: 'Фільтр', en: 'Filter' },
      trailers_filter_today: { ru: 'Сегодня', uk: 'Сьогодні', en: 'Today' },
      trailers_filter_week: { ru: 'Неделя', uk: 'Тиждень', en: 'Week' },
      trailers_filter_month: { ru: 'Месяц', uk: 'Місяць', en: 'Month' },
      trailers_filter_year: { ru: 'Год', uk: 'Рік', en: 'Year' },
      trailers_movies: { ru: 'Фильмы', uk: 'Фільми', en: 'Movies' },
      trailers_series: { ru: 'Сериалы', uk: 'Серіали', en: 'Series' },
      trailers_more: { ru: 'Ещё', uk: 'Ще', en: 'More' },
      trailers_popular_movies: { ru: 'Популярные фильмы', uk: 'Популярні фільми', en: 'Popular Movies' },
      trailers_last_movie: { ru: 'Это последний фильм: [title]', uk: 'Це останній фільм: [title]', en: 'This is the last movie: [title]' },
      trailers_no_more_data: { ru: 'Больше нет данных для загрузки', uk: 'Більше немає даних для завантаження', en: 'No more data to load' }
    });

    function startPlugin() {
      if (window.plugin_trailers_ready) return;
      window.plugin_trailers_ready = true;
      Lampa.Component.add('trailers_main', TrailerPlugin.ComponentMain);
      Lampa.Component.add('trailers_full', TrailerPlugin.ComponentFull);
      Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
      Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase;font-size:1.2em}.card.card--trailer .card__release-date{position:absolute;top:2.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');

      function add() {
        var button = $('<li class="menu__item selector"><div class="menu__ico"><svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg></div><div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div></li>');
        button.on('hover:enter', function() {
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_trailers'),
            component: 'trailers_main',
            page: 1
          });
        });
        $('.menu .menu__list').eq(0).append(button);
        $('body').append(Lampa.Template.get('trailer_style', {}, true));
        Lampa.Storage.listener.follow('change', function(event) {
          if (event.name === 'language') {
            TrailerPlugin.Api.clear();
          }
        });
      }

      if (Lampa.TMDB && Lampa.TMDB.key()) {
        add();
      } else {
        Lampa.Noty.show('TMDB API key is missing. Trailers plugin cannot be loaded.');
      }
    }

    if (!window.appready) {
      Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
          startPlugin();
        }
      });
    } else {
      startPlugin();
    }
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.init = initPlugin;
})();
(function() {  
  'use strict';
  TrailerPlugin.init();
})();
