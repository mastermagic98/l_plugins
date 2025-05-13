/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./t2/api.js":
/*!*******************!*\
  !*** ./t2/api.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Api: () => (/* binding */ Api),
/* harmony export */   clear: () => (/* binding */ clear),
/* harmony export */   full: () => (/* binding */ full),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   getLocalMoviesInTheaters: () => (/* binding */ getLocalMoviesInTheaters),
/* harmony export */   getUpcomingMovies: () => (/* binding */ getUpcomingMovies),
/* harmony export */   main: () => (/* binding */ main),
/* harmony export */   videos: () => (/* binding */ videos)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./t2/utils.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

var network = new Lampa.Reguest();
var tmdb_api_key = Lampa.TMDB.key();
var tmdb_base_url = 'https://api.themoviedb.org/3';
var trailerCache = {};
var categoryCache = {};
var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 години в мілісекундах

// Очищення застарілого кешу
function clearExpiredCache() {
  // Очищення trailerCache
  for (var key in trailerCache) {
    if (trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp > CACHE_TTL) {
      delete trailerCache[key];
    }
  }
  // Очищення categoryCache
  for (var key in categoryCache) {
    if (categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp > CACHE_TTL) {
      delete categoryCache[key];
      Lampa.Storage.set('trailer_category_cache_' + key, null);
    }
  }
}
function get(url, page, resolve, reject) {
  var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getInterfaceLanguage)();
  network.silent(full_url, resolve, reject);
}
function getLocalMoviesInTheaters(page, resolve, reject) {
  var region = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getRegion)();
  var language = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getInterfaceLanguage)();
  var today = new Date();
  var daysThreshold = 45;
  var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  var now_playing_url = "".concat(tmdb_base_url, "/movie/now_playing?api_key=").concat(tmdb_api_key, "&language=").concat(language, "&page=").concat(page, "&region=").concat(region, "&primary_release_date.gte=").concat(startDate);
  network.silent(now_playing_url, function (data) {
    if (data.results && data.results.length) {
      var finalizeResults = function finalizeResults() {
        var filteredResults = data.results.filter(function (m) {
          if (m.release_details && m.release_details.results) {
            var regionRelease = m.release_details.results.find(function (r) {
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
        filteredResults.sort(function (a, b) {
          var _a$release_details, _b$release_details;
          var dateA = ((_a$release_details = a.release_details) === null || _a$release_details === void 0 || (_a$release_details = _a$release_details.results) === null || _a$release_details === void 0 || (_a$release_details = _a$release_details.find(function (r) {
            return r.iso_3166_1 === region;
          })) === null || _a$release_details === void 0 || (_a$release_details = _a$release_details.release_dates[0]) === null || _a$release_details === void 0 ? void 0 : _a$release_details.release_date) || a.release_date;
          var dateB = ((_b$release_details = b.release_details) === null || _b$release_details === void 0 || (_b$release_details = _b$release_details.results) === null || _b$release_details === void 0 || (_b$release_details = _b$release_details.find(function (r) {
            return r.iso_3166_1 === region;
          })) === null || _b$release_details === void 0 || (_b$release_details = _b$release_details.release_dates[0]) === null || _b$release_details === void 0 ? void 0 : _b$release_details.release_date) || b.release_date;
          return new Date(dateB) - new Date(dateA);
        });
        data.results = filteredResults;
        resolve(data);
      };
      var totalRequests = data.results.length;
      var completedRequests = 0;
      data.results.forEach(function (movie) {
        var movie_id = movie.id;
        if (movie_id) {
          var release_url = "".concat(tmdb_base_url, "/movie/").concat(movie_id, "/release_dates?api_key=").concat(tmdb_api_key);
          network.silent(release_url, function (release_data) {
            movie.release_details = release_data;
            completedRequests++;
            if (completedRequests === totalRequests) {
              finalizeResults();
            }
          }, function () {
            movie.release_details = {
              results: []
            };
            completedRequests++;
            if (completedRequests === totalRequests) {
              finalizeResults();
            }
          });
        } else {
          movie.release_details = {
            results: []
          };
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
  var region = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getRegion)();
  var today = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(0);
  var sixMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-180);
  var language = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getInterfaceLanguage)();
  var upcoming_url = "".concat(tmdb_base_url, "/discover/movie?api_key=").concat(tmdb_api_key, "&language=").concat(language, "&page=").concat(page, "&region=").concat(region, "&primary_release_date.gte=").concat(today, "&primary_release_date.lte=").concat(sixMonthsLater, "&sort_by=popularity.desc&vote_count.gte=1");
  network.silent(upcoming_url, function (data) {
    if (data.results && data.results.length) {
      var finalizeResults = function finalizeResults() {
        var filteredResults = data.results.filter(function (m) {
          if (m.release_details && m.release_details.results) {
            var regionRelease = m.release_details.results.find(function (r) {
              return r.iso_3166_1 === region;
            });
            if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
              return true;
            }
          }
          return !!m.release_date;
        });
        filteredResults.sort(function (a, b) {
          var _a$release_details2, _b$release_details2;
          var dateA = ((_a$release_details2 = a.release_details) === null || _a$release_details2 === void 0 || (_a$release_details2 = _a$release_details2.results) === null || _a$release_details2 === void 0 || (_a$release_details2 = _a$release_details2.find(function (r) {
            return r.iso_3166_1 === region;
          })) === null || _a$release_details2 === void 0 || (_a$release_details2 = _a$release_details2.release_dates[0]) === null || _a$release_details2 === void 0 ? void 0 : _a$release_details2.release_date) || a.release_date;
          var dateB = ((_b$release_details2 = b.release_details) === null || _b$release_details2 === void 0 || (_b$release_details2 = _b$release_details2.results) === null || _b$release_details2 === void 0 || (_b$release_details2 = _b$release_details2.find(function (r) {
            return r.iso_3166_1 === region;
          })) === null || _b$release_details2 === void 0 || (_b$release_details2 = _b$release_details2.release_dates[0]) === null || _b$release_details2 === void 0 ? void 0 : _b$release_details2.release_date) || b.release_date;
          return new Date(dateA) - new Date(dateB);
        });
        data.results = filteredResults;
        resolve(data);
      };
      var totalRequests = data.results.length;
      var completedRequests = 0;
      data.results.forEach(function (movie) {
        var movie_id = movie.id;
        if (movie_id) {
          var release_url = "".concat(tmdb_base_url, "/movie/").concat(movie_id, "/release_dates?api_key=").concat(tmdb_api_key);
          network.silent(release_url, function (release_data) {
            movie.release_details = release_data;
            completedRequests++;
            if (completedRequests === totalRequests) {
              finalizeResults();
            }
          }, function () {
            movie.release_details = {
              results: []
            };
            completedRequests++;
            if (completedRequests === totalRequests) {
              finalizeResults();
            }
          });
        } else {
          movie.release_details = {
            results: []
          };
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
function main(oncomplite, onerror) {
  var status = new Lampa.Status(6);
  status.onComplite = function () {
    var fulldata = [];
    var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
    keys.forEach(function (key) {
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
  var append = function append(title, name, url, json) {
    json.title = title;
    json.type = name;
    json.url = url;
    status.append(name, json);
  };
  var today = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(0);
  var sixMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-180);
  var threeMonthsAgo = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(90);
  var threeMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-90);
  get('/discover/movie?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
    append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', {
      results: json.results || []
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', {
      results: []
    });
  });
  getLocalMoviesInTheaters(1, function (json) {
    append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', {
      results: json.results || []
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', {
      results: []
    });
  });
  getUpcomingMovies(1, function (json) {
    append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', {
      results: json.results || []
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', {
      results: []
    });
  });
  get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
    var filteredResults = json.results ? json.results.filter(function (item) {
      return !item.genre_ids.includes(99) && !item.genre_ids.includes(10763) && !item.genre_ids.includes(10764);
    }) : [];
    append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', {
      results: filteredResults
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', {
      results: []
    });
  });
  get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
    if (json.results) {
      json.results.forEach(function (series) {
        series.release_details = {
          first_air_date: series.first_air_date
        };
      });
    }
    append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', {
      results: json.results || []
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', {
      results: []
    });
  });
  get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
    if (json.results) {
      json.results.forEach(function (series) {
        series.release_details = {
          first_air_date: series.first_air_date
        };
      });
    }
    append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', {
      results: json.results || []
    });
  }, function () {
    append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', {
      results: []
    });
  });
}
function full(params, oncomplite, onerror) {
  clearExpiredCache(); // Очищаємо застарілий кеш перед використанням
  if (params.type === 'in_theaters') {
    var _fetchNextPage = function fetchNextPage() {
      if (loadedPages.has(currentPage) || currentPage > maxPages || totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse) {
        finalizeResults();
        return;
      }
      loadedPages.add(currentPage);
      getLocalMoviesInTheaters(currentPage, function (result) {
        if (result && result.results && result.results.length) {
          accumulatedResults = accumulatedResults.concat(result.results);
          if (currentPage === 1) {
            totalPagesFromFirstResponse = result.total_pages || maxPages;
          }
          var startIdx = (params.page - 1) * targetCards;
          var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
          if (accumulatedResults.length >= startIdx + 1 || currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
            finalizeResults();
          } else {
            currentPage++;
            _fetchNextPage();
          }
        } else {
          if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
            currentPage++;
            _fetchNextPage();
          } else {
            finalizeResults();
          }
        }
      }, onerror);
    };
    var finalizeResults = function finalizeResults() {
      var finalResults = _toConsumableArray(new Set(accumulatedResults.map(JSON.stringify))).map(JSON.parse);
      finalResults.sort(function (a, b) {
        var _a$release_details3, _b$release_details3;
        var dateA = ((_a$release_details3 = a.release_details) === null || _a$release_details3 === void 0 || (_a$release_details3 = _a$release_details3.results) === null || _a$release_details3 === void 0 || (_a$release_details3 = _a$release_details3.find(function (r) {
          return r.iso_3166_1 === region;
        })) === null || _a$release_details3 === void 0 || (_a$release_details3 = _a$release_details3.release_dates[0]) === null || _a$release_details3 === void 0 ? void 0 : _a$release_details3.release_date) || a.release_date;
        var dateB = ((_b$release_details3 = b.release_details) === null || _b$release_details3 === void 0 || (_b$release_details3 = _b$release_details3.results) === null || _b$release_details3 === void 0 || (_b$release_details3 = _b$release_details3.find(function (r) {
          return r.iso_3166_1 === region;
        })) === null || _b$release_details3 === void 0 || (_b$release_details3 = _b$release_details3.release_dates[0]) === null || _b$release_details3 === void 0 ? void 0 : _b$release_details3.release_date) || b.release_date;
        return new Date(dateB) - new Date(dateA);
      });
      var startIdx = (params.page - 1) * targetCards;
      var endIdx = Math.min(params.page * targetCards, finalResults.length);
      var pageResults = finalResults.slice(startIdx, endIdx);
      var result = {
        dates: {
          maximum: today.toISOString().split('T')[0],
          minimum: startDate
        },
        page: params.page,
        results: pageResults.length > 0 ? pageResults : finalResults.slice(0, targetCards),
        total_pages: Math.ceil(finalResults.length / targetCards) || 1,
        total_results: finalResults.length
      };
      categoryCache['in_theaters'] = {
        results: finalResults,
        timestamp: Date.now()
      };
      Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
      oncomplite(result);
    };
    var region = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getRegion)();
    var today = new Date();
    var daysThreshold = 45;
    var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    var targetCards = 20;
    var accumulatedResults = [];
    var loadedPages = new Set();
    var currentPage = 1;
    var maxPages = 30;
    var totalPagesFromFirstResponse = 0;
    var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
    if (cachedData && cachedData.results && cachedData.results.length > 0) {
      accumulatedResults = cachedData.results;
      var startIdx = (params.page - 1) * targetCards;
      var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
      var pageResults = accumulatedResults.slice(startIdx, endIdx);
      var result = {
        dates: {
          maximum: today.toISOString().split('T')[0],
          minimum: startDate
        },
        page: params.page,
        results: pageResults,
        total_pages: Math.ceil(accumulatedResults.length / targetCards) || 1,
        total_results: accumulatedResults.length
      };
      if (accumulatedResults.length >= startIdx + 1 && pageResults.length > 0) {
        oncomplite(result);
        return;
      }
      currentPage = Math.ceil(accumulatedResults.length / targetCards) + 1;
    }
    _fetchNextPage();
  } else if (params.type === 'upcoming_movies') {
    var today = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(0);
    var sixMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-180);
    var targetCards = 20;
    var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
    if (cachedData && cachedData.results && cachedData.results.length > 0) {
      var filteredResults = cachedData.results.filter(function (m) {
        if (m.release_details && m.release_details.results) {
          var regionRelease = m.release_details.results.find(function (r) {
            return r.iso_3166_1 === (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getRegion)();
          });
          if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
            return true;
          }
        }
        return !!m.release_date;
      });
      var startIdx = (params.page - 1) * targetCards;
      var endIdx = Math.min(params.page * targetCards, filteredResults.length);
      var pageResults = filteredResults.slice(startIdx, endIdx);
      var result = {
        page: params.page,
        results: pageResults,
        total_pages: Math.ceil(filteredResults.length / targetCards) || 1,
        total_results: filteredResults.length
      };
      if (pageResults.length > 0) {
        oncomplite(result);
        return;
      }
    }
    getUpcomingMovies(params.page, function (result) {
      if (result && result.results && result.results.length) {
        var filteredResults = result.results.filter(function (m) {
          if (m.release_details && m.release_details.results) {
            var regionRelease = m.release_details.results.find(function (r) {
              return r.iso_3166_1 === (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getRegion)();
            });
            if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
              return true;
            }
          }
          return !!m.release_date;
        });
        result.results = filteredResults;
        result.total_results = filteredResults.length;
        result.total_pages = Math.ceil(filteredResults.length / targetCards) || 1;
        if (params.page === 1) {
          categoryCache['upcoming_movies'] = {
            results: filteredResults,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
        } else {
          var existingCache = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', {
            results: []
          });
          existingCache.results = existingCache.results.concat(filteredResults);
          existingCache.results = _toConsumableArray(new Set(existingCache.results.map(JSON.stringify))).map(JSON.parse);
          categoryCache['upcoming_movies'] = existingCache;
          Lampa.Storage.set('trailer_category_cache_upcoming_movies', existingCache);
        }
        oncomplite(result);
      } else {
        onerror();
      }
    }, onerror);
  } else if (params.type === 'new_series_seasons') {
    var threeMonthsAgo = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(90);
    var threeMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-90);
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
    get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function (result) {
      if (result && result.results && result.results.length) {
        result.results.forEach(function (series) {
          series.release_details = {
            first_air_date: series.first_air_date
          };
        });
        if (params.page === 1) {
          categoryCache['new_series_seasons'] = {
            results: result.results,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_new_series_seasons', categoryCache['new_series_seasons']);
        } else {
          var existingCache = categoryCache['new_series_seasons'] || Lampa.Storage.get('trailer_category_cache_new_series_seasons', {
            results: []
          });
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
    var today = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(0);
    var sixMonthsLater = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getFormattedDate)(-180);
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
    get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function (result) {
      if (result && result.results && result.results.length) {
        result.results.forEach(function (series) {
          series.release_details = {
            first_air_date: series.first_air_date
          };
        });
        if (params.page === 1) {
          categoryCache['upcoming_series'] = {
            results: result.results,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_upcoming_series', categoryCache['upcoming_series']);
        } else {
          var existingCache = categoryCache['upcoming_series'] || Lampa.Storage.get('trailer_category_cache_upcoming_series', {
            results: []
          });
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
    get(params.url, params.page, function (result) {
      if (result && result.results && result.results.length) {
        if (params.page === 1) {
          categoryCache[params.type] = {
            results: result.results,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
        } else {
          var existingCache = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, {
            results: []
          });
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
  clearExpiredCache(); // Очищаємо застарілий кеш перед використанням
  var type = card.name ? 'tv' : 'movie';
  var id = card.id;
  var cacheKey = type + '_' + id;
  if (trailerCache[cacheKey] && trailerCache[cacheKey].timestamp && Date.now() - trailerCache[cacheKey].timestamp < CACHE_TTL) {
    oncomplite(trailerCache[cacheKey]);
    return;
  }
  var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key;
  var preferredLangs = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.getPreferredLanguage)();
  var attempts = 0;
  var maxAttempts = preferredLangs.length + 1;
  var tmdbTrailers = [];
  function tryFetch(langIndex) {
    if (attempts >= maxAttempts) {
      var englishTrailer = tmdbTrailers.find(function (v) {
        return v.iso_639_1 === 'en';
      });
      if (englishTrailer) {
        trailerCache[cacheKey] = {
          id: id,
          results: [englishTrailer],
          timestamp: Date.now()
        };
        oncomplite({
          id: id,
          results: [englishTrailer]
        });
      } else {
        trailerCache[cacheKey] = {
          id: id,
          results: [],
          timestamp: Date.now()
        };
        onerror();
      }
      return;
    }
    var fetchUrl = url;
    if (langIndex < preferredLangs.length) {
      fetchUrl += '&language=' + preferredLangs[langIndex];
    }
    network.silent(fetchUrl, function (result) {
      var trailers = result.results ? result.results.filter(function (v) {
        return v.type === 'Trailer';
      }) : [];
      tmdbTrailers = tmdbTrailers.concat(trailers);
      var preferredTrailer = trailers.find(function (v) {
        return preferredLangs.includes(v.iso_639_1);
      });
      if (preferredTrailer) {
        trailerCache[cacheKey] = {
          id: id,
          results: [preferredTrailer],
          timestamp: Date.now()
        };
        oncomplite({
          id: id,
          results: [preferredTrailer]
        });
      } else {
        attempts++;
        tryFetch(langIndex + 1);
      }
    }, function () {
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
  ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
    Lampa.Storage.set('trailer_category_cache_' + key, null);
  });
}
var Api = {
  get: get,
  getLocalMoviesInTheaters: getLocalMoviesInTheaters,
  getUpcomingMovies: getUpcomingMovies,
  main: main,
  full: full,
  videos: videos,
  clear: clear
};

/***/ }),

/***/ "./t2/component.js":
/*!*************************!*\
  !*** ./t2/component.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component: () => (/* binding */ Component),
/* harmony export */   Component$1: () => (/* binding */ Component$1)
/* harmony export */ });
/* harmony import */ var _line_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./line.js */ "./t2/line.js");
/* harmony import */ var _trailer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./trailer.js */ "./t2/trailer.js");
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api.js */ "./t2/api.js");



function Component$1(object) {
  var scroll = new Lampa.Scroll({
    mask: true,
    over: true,
    scroll_by_item: true
  });
  var items = [];
  var html = $('<div></div>');
  var active = 0;
  var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
  this.create = function () {
    _api_js__WEBPACK_IMPORTED_MODULE_2__.Api.main(this.build.bind(this), this.empty.bind(this));
    return this.render();
  };
  this.empty = function () {
    var empty = new Lampa.Empty();
    html.append(empty.render());
    this.start = empty.start;
    this.activity.loader(false);
    this.activity.toggle();
  };
  this.build = function (data) {
    var _this = this;
    scroll.minus();
    html.append(scroll.render());
    data.forEach(this.append.bind(this));
    if (light) {
      scroll.onWheel = function (step) {
        if (step > 0) _this.down();else _this.up();
      };
    }
    this.activity.loader(false);
    this.activity.toggle();
  };
  this.append = function (element) {
    var item = new _line_js__WEBPACK_IMPORTED_MODULE_0__.Line(element);
    item.create();
    item.onDown = this.down.bind(this);
    item.onUp = this.up.bind(this);
    item.onBack = this.back.bind(this);
    item.onToggle = function () {
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
  this.back = function () {
    Lampa.Activity.backward();
  };
  this.detach = function () {
    if (light) {
      items.forEach(function (item) {
        item.render().detach();
      });
      items.slice(active, active + 2).forEach(function (item) {
        item.wrap.append(item.render());
      });
    }
  };
  this.down = function () {
    active++;
    active = Math.min(active, items.length - 1);
    this.detach();
    items[active].toggle();
    scroll.update(items[active].render());
  };
  this.up = function () {
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
  this.start = function () {
    var _this2 = this;
    if (Lampa.Activity.active().activity !== this.activity) return;
    Lampa.Controller.add('content', {
      toggle: function toggle() {
        if (items.length) {
          _this2.detach();
          items[active].toggle();
        }
      },
      left: function left() {
        if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
      },
      right: function right() {
        Navigator.move('right');
      },
      up: function up() {
        if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
      },
      down: function down() {
        if (Navigator.canmove('down')) Navigator.move('down');
      },
      back: this.back
    });
    Lampa.Controller.toggle('content');
  };
  this.pause = function () {};
  this.stop = function () {};
  this.render = function () {
    return html;
  };
  this.destroy = function () {
    Lampa.Arrays.destroy(items);
    scroll.destroy();
    html.remove();
    items = [];
  };
}
function Component(object) {
  var scroll = new Lampa.Scroll({
    mask: true,
    over: true,
    step: 250,
    end_ratio: 2
  });
  var items = [];
  var html = $('<div></div>');
  var body = $('<div class="category-full category-full--trailers"></div>');
  var newlampa = Lampa.Manifest.app_digital >= 166;
  var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
  var total_pages = 0;
  var last;
  var waitload = false;
  var active = 0;
  this.create = function () {
    _api_js__WEBPACK_IMPORTED_MODULE_2__.Api.full(object, this.build.bind(this), this.empty.bind(this));
    return this.render();
  };
  this.empty = function () {
    var empty = new Lampa.Empty();
    scroll.append(empty.render());
    this.start = empty.start;
    this.activity.loader(false);
    this.activity.toggle();
  };
  this.next = function () {
    var _this = this;
    if (waitload) return;
    if (object.page < total_pages && object.page < 30) {
      waitload = true;
      object.page++;
      _api_js__WEBPACK_IMPORTED_MODULE_2__.Api.full(object, function (result) {
        if (result.results && result.results.length) {
          _this.append(result, true);
        } else {
          Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        }
        waitload = false;
      }, function () {
        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        waitload = false;
      });
    } else {
      Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
    }
  };
  this.cardImgBackground = function (card_data) {
    if (Lampa.Storage.field('background')) {
      if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
      }
      return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
    }
    return '';
  };
  this.append = function (data, append) {
    var _this2 = this;
    if (!append) body.empty();
    data.results.forEach(function (element) {
      var card = new _trailer_js__WEBPACK_IMPORTED_MODULE_1__.Trailer(element, {
        type: object.type
      });
      card.create();
      card.visible();
      card.onFocus = function (target, card_data) {
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
  this.build = function (data) {
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
        scroll.onWheel = function (step) {
          if (!Lampa.Controller.own(_this3)) _this3.start();
          if (step > 0) Navigator.move('down');else if (active > 0) Navigator.move('up');
        }.bind(this);
        var debouncedLoad = debounce(function () {
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
  this.more = function () {
    var _this = this;
    var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
    more.on('hover:enter', function () {
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
  this.back = function () {
    last = items[0].render()[0];
    var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
    more.on('hover:enter', function () {
      if (object.page > 1) {
        Lampa.Activity.backward();
      } else {
        Lampa.Controller.toggle('head');
      }
    });
    body.prepend(more);
  };
  this.start = function () {
    if (Lampa.Activity.active().activity !== this.activity) return;
    Lampa.Controller.add('content', {
      link: this,
      toggle: function toggle() {
        Lampa.Controller.collectionSet(scroll.render());
        Lampa.Controller.collectionFocus(last || false, scroll.render());
      },
      left: function left() {
        if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
      },
      right: function right() {
        Navigator.move('right');
      },
      up: function up() {
        if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
      },
      down: function down() {
        if (Navigator.canmove('down')) Navigator.move('down');
      },
      back: function back() {
        Lampa.Activity.backward();
      }
    });
    Lampa.Controller.toggle('content');
  };
  this.pause = function () {};
  this.stop = function () {};
  this.render = function () {
    return html;
  };
  this.destroy = function () {
    Lampa.Arrays.destroy(items);
    scroll.destroy();
    html.remove();
    body.remove();
    items = [];
  };
}

/***/ }),

/***/ "./t2/line.js":
/*!********************!*\
  !*** ./t2/line.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _trailer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./trailer.js */ "./t2/trailer.js");

function Line(data) {
  this.data = data;
  this.cards = [];
  this.create = function () {
    var _this = this;
    this.cards = [];
    this.data.results.forEach(function (item) {
      var card = new _trailer_js__WEBPACK_IMPORTED_MODULE_0__.Trailer(item, {
        type: _this.data.type
      });
      card.create();
      _this.cards.push(card);
    });
  };
  this.render = function () {
    var element = Lampa.Template.get('line', {
      title: this.data.title
    });
    this.cards.forEach(function (card) {
      element.find('.line__cards').append(card.render());
    });
    return element;
  };
  this.destroy = function () {
    this.cards.forEach(function (card) {
      card.destroy();
    });
    this.cards = [];
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Line);

/***/ }),

/***/ "./t2/templates.js":
/*!*************************!*\
  !*** ./t2/templates.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initTemplates: () => (/* binding */ initTemplates),
/* harmony export */   translations: () => (/* binding */ translations)
/* harmony export */ });
var translations = {
  trailers_popular: {
    ru: 'Популярное',
    uk: 'Популярне',
    en: 'Popular'
  },
  trailers_in_theaters: {
    ru: 'В прокате',
    uk: 'В прокаті',
    en: 'In Theaters'
  },
  trailers_upcoming_movies: {
    ru: 'Ожидаемые фильмы',
    uk: 'Очікувані фільми',
    en: 'Upcoming Movies'
  },
  trailers_popular_series: {
    ru: 'Популярные сериалы',
    uk: 'Популярні серіали',
    en: 'Popular Series'
  },
  trailers_new_series_seasons: {
    ru: 'Новые сериалы и сезоны',
    uk: 'Нові серіали та сезони',
    en: 'New Series and Seasons'
  },
  trailers_upcoming_series: {
    ru: 'Ожидаемые сериалы',
    uk: 'Очікувані серіали',
    en: 'Upcoming Series'
  },
  trailers_no_trailers: {
    ru: 'Нет трейлеров',
    uk: 'Немає трейлерів',
    en: 'No trailers'
  },
  trailers_no_ua_trailer: {
    ru: 'Нет украинского трейлера',
    uk: 'Немає українського трейлера',
    en: 'No Ukrainian trailer'
  },
  trailers_no_ru_trailer: {
    ru: 'Нет русского трейлера',
    uk: 'Немає російського трейлера',
    en: 'No Russian trailer'
  },
  trailers_view: {
    ru: 'Подробнее',
    uk: 'Докладніше',
    en: 'More'
  },
  title_trailers: {
    ru: 'Трейлеры',
    uk: 'Трейлери',
    en: 'Trailers'
  },
  trailers_filter: {
    ru: 'Фильтр',
    uk: 'Фільтр',
    en: 'Filter'
  },
  trailers_filter_today: {
    ru: 'Сегодня',
    uk: 'Сьогодні',
    en: 'Today'
  },
  trailers_filter_week: {
    ru: 'Неделя',
    uk: 'Тиждень',
    en: 'Week'
  },
  trailers_filter_month: {
    ru: 'Месяц',
    uk: 'Місяць',
    en: 'Month'
  },
  trailers_filter_year: {
    ru: 'Год',
    uk: 'Рік',
    en: 'Year'
  },
  trailers_movies: {
    ru: 'Фильмы',
    uk: 'Фільми',
    en: 'Movies'
  },
  trailers_series: {
    ru: 'Сериалы',
    uk: 'Серіали',
    en: 'Series'
  },
  trailers_more: {
    ru: 'Ещё',
    uk: 'Ще',
    en: 'More'
  },
  trailers_popular_movies: {
    ru: 'Популярные фильмы',
    uk: 'Популярні фільми',
    en: 'Popular Movies'
  },
  trailers_last_movie: {
    ru: 'Это последний фильм: [title]',
    uk: 'Це останній фільм: [title]',
    en: 'This is the last movie: [title]'
  },
  trailers_no_more_data: {
    ru: 'Больше нет данных для загрузки',
    uk: 'Більше немає даних для завантаження',
    en: 'No more data to load'
  }
};
function initTemplates() {
  Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
  Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase;font-size:1.2em}.card.card--trailer .card__release-date{position:absolute;top:2em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');
}

/***/ }),

/***/ "./t2/trailer.js":
/*!***********************!*\
  !*** ./t2/trailer.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Trailer: () => (/* binding */ Trailer)
/* harmony export */ });
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api.js */ "./t2/api.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./t2/utils.js");
// Клас для створення картки трейлера


function Trailer(data, params) {
  // Створення DOM-структури картки
  this.build = function () {
    this.card = Lampa.Template.get('trailer', data);
    this.img = this.card.find('img')[0];
    this.is_youtube = params.type === 'rating';
    this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
    this.trailer_lang = '';
    this.release_date = '-';
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

  // Встановлення фонового зображення картки
  this.cardImgBackground = function (card_data) {
    if (Lampa.Storage.field('background')) {
      if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
      }
      return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
    }
    return '';
  };

  // Обробка завантаження зображення
  this.image = function () {
    var _this = this;
    this.img.onload = function () {
      _this.card.addClass('card--loaded');
    };
    this.img.onerror = function () {
      _this.img.src = './img/img_broken.svg';
    };
  };

  // Завантаження інформації про трейлер
  this.loadTrailerInfo = function () {
    var _this = this;
    if (!this.is_youtube && !this.trailer_lang) {
      _api_js__WEBPACK_IMPORTED_MODULE_0__.Api.videos(data, function (videos) {
        var trailers = videos.results ? videos.results.filter(function (v) {
          return v.type === 'Trailer';
        }) : [];
        var preferredLangs = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getPreferredLanguage)();
        var video = trailers.find(function (v) {
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
            var region = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getRegion)();
            var releaseInfo = data.release_details.results.find(function (r) {
              return r.iso_3166_1 === region;
            });
            if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
              var releaseDate = releaseInfo.release_dates[0].release_date;
              _this.release_date = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.formatDateToDDMMYYYY)(releaseDate);
            } else if (data.release_date) {
              _this.release_date = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.formatDateToDDMMYYYY)(data.release_date);
            }
          } else if (data.release_date) {
            _this.release_date = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.formatDateToDDMMYYYY)(data.release_date);
          }
        } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
          if (data.release_details && data.release_details.first_air_date) {
            _this.release_date = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.formatDateToDDMMYYYY)(data.release_details.first_air_date);
          }
        }
        _this.card.find('.card__release-date').text(_this.release_date);
      }, function () {
        _this.trailer_lang = '-';
        _this.card.find('.card__trailer-lang').text('-');
        _this.card.find('.card__release-date').text('-');
      });
    }
  };

  // Відтворення трейлера
  this.play = function (id) {
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

  // Ініціалізація картки
  this.create = function () {
    var _this2 = this;
    this.build();
    this.card.on('hover:focus', function (e, is_mouse) {
      Lampa.Background.change(_this2.cardImgBackground(data));
      _this2.onFocus(e.target, data, is_mouse);
      _this2.loadTrailerInfo();
    }).on('hover:enter', function () {
      if (_this2.is_youtube) {
        _this2.play(data.id);
      } else {
        _api_js__WEBPACK_IMPORTED_MODULE_0__.Api.videos(data, function (videos) {
          var preferredLangs = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getPreferredLanguage)();
          var trailers = videos.results ? videos.results.filter(function (v) {
            return v.type === 'Trailer';
          }) : [];
          var video = trailers.find(function (v) {
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
        }, function () {
          Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        });
      }
    }).on('hover:long', function () {
      if (!_this2.is_youtube) {
        var items = [{
          title: Lampa.Lang.translate('trailers_view'),
          view: true
        }];
        Lampa.Loading.start(function () {
          _api_js__WEBPACK_IMPORTED_MODULE_0__.Api.clear();
          Lampa.Loading.stop();
        });
        _api_js__WEBPACK_IMPORTED_MODULE_0__.Api.videos(data, function (videos) {
          Lampa.Loading.stop();
          var preferredLangs = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getPreferredLanguage)();
          var trailers = videos.results ? videos.results.filter(function (v) {
            return v.type === 'Trailer';
          }) : [];
          if (trailers.length) {
            items.push({
              title: Lampa.Lang.translate('title_trailers'),
              separator: true
            });
            trailers.forEach(function (video) {
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
            onSelect: function onSelect(item) {
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
            onBack: function onBack() {
              Lampa.Controller.toggle('content');
            }
          });
        }, function () {
          Lampa.Loading.stop();
          Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        });
      }
    });
    this.image();
    this.loadTrailerInfo();
  };

  // Очищення ресурсів
  this.destroy = function () {
    this.img.onerror = null;
    this.img.onload = null;
    this.img.src = '';
    this.card.remove();
    this.card = null;
    this.img = null;
  };

  // Відображення зображення картки
  this.visible = function () {
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

  // Повернення DOM-елемента картки
  this.render = function () {
    return this.card;
  };
}


/***/ }),

/***/ "./t2/utils.js":
/*!*********************!*\
  !*** ./t2/utils.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   formatDateToDDMMYYYY: () => (/* binding */ formatDateToDDMMYYYY),
/* harmony export */   getFormattedDate: () => (/* binding */ getFormattedDate),
/* harmony export */   getInterfaceLanguage: () => (/* binding */ getInterfaceLanguage),
/* harmony export */   getPreferredLanguage: () => (/* binding */ getPreferredLanguage),
/* harmony export */   getRegion: () => (/* binding */ getRegion)
/* harmony export */ });
function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./t2/index.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _trailer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./trailer.js */ "./t2/trailer.js");
/* harmony import */ var _line_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./line.js */ "./t2/line.js");
/* harmony import */ var _component_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./component.js */ "./t2/component.js");
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api.js */ "./t2/api.js");
/* harmony import */ var _templates_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./templates.js */ "./t2/templates.js");





function startPlugin() {
  if (window.plugin_trailers_ready) return;
  window.plugin_trailers_ready = true;

  // Додаємо переклади 
  Lampa.Lang.add(_templates_js__WEBPACK_IMPORTED_MODULE_4__.translations);

  // Реєструємо компоненти
  Lampa.Component.add('trailers_main', _component_js__WEBPACK_IMPORTED_MODULE_2__.Component$1);
  Lampa.Component.add('trailers_full', _component_js__WEBPACK_IMPORTED_MODULE_2__.Component);

  // Додаємо шаблони та стилі
  (0,_templates_js__WEBPACK_IMPORTED_MODULE_4__.initTemplates)();
  function add() {
    var button = $('<li class="menu__item selector"><div class="menu__ico"><svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg></div><div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div></li>');
    button.on('hover:enter', function () {
      Lampa.Activity.push({
        url: '',
        title: Lampa.Lang.translate('title_trailers'),
        component: 'trailers_main',
        page: 1
      });
    });
    $('.menu .menu__list').eq(0).append(button);
    $('body').append(Lampa.Template.get('trailer_style', {}, true));
    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'language') {
        _api_js__WEBPACK_IMPORTED_MODULE_3__.Api.clear();
      }
    });
  }
  if (Lampa.TMDB && Lampa.TMDB.key()) {
    add();
  } else {
    Lampa.Noty.show('TMDB API key is missing. Trailers plugin cannot be loaded.');
  }
}

// Запускаємо плагін
if (!window.appready) {
  Lampa.Listener.follow('app', function (e) {
    if (e.type === 'ready') {
      startPlugin();
    }
  });
} else {
  startPlugin();
}
})();

/******/ })()
;