/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/*!*********************************!*\
  !*** ./t2/index.js + 6 modules ***!
  \*********************************/

// NAMESPACE OBJECT: ./t2/component.js
var component_namespaceObject = {};
__webpack_require__.r(component_namespaceObject);
__webpack_require__.d(component_namespaceObject, {
  Component: () => (Component)
});

;// ./t2/utils.js
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
;// ./t2/api.js

var trailerCache = {};
var categoryCache = {};
var CACHE_TTL = 24 * 60 * 60 * 1000;
function clearExpiredCache() {
  console.log('Clearing expired cache'); // Діагностика
  for (var key in trailerCache) {
    if (trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp > CACHE_TTL) {
      delete trailerCache[key];
    }
  }
  for (var key in categoryCache) {
    if (categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp > CACHE_TTL) {
      delete categoryCache[key];
      Lampa.Storage.set('trailer_category_cache_' + key, null);
    }
  }
}
setInterval(clearExpiredCache, 3600 * 1000);
function finalizeResults(json, status, results, type) {
  console.log('finalizeResults called:', {
    json,
    type
  }); // Діагностика
  if (!json.results) {
    console.error('No results in JSON:', json);
    status.append({}, {});
    return;
  }
  var items = json.results.map(function (item) {
    return {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date,
      original_title: item.original_title,
      original_name: item.original_name,
      name: item.name,
      release_details: item.release_details || {}
    };
  });
  results[type] = {
    title: Lampa.Lang.translate('trailers_' + type),
    results: items,
    type: type
  };
  status.append({}, {});
}
var Api = {
  clear: function clear() {
    trailerCache = {};
    categoryCache = {};
  },
  videos: function videos(data, success, fail) {
    var key = data.id + '_' + (data.name ? 'tv' : 'movie');
    if (trailerCache[key] && trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp < CACHE_TTL) {
      success(trailerCache[key].data);
    } else {
      Lampa.TMDB.video(data.id, data.name ? 'tv' : 'movie', function (json) {
        trailerCache[key] = {
          data: json,
          timestamp: Date.now()
        };
        success(json);
      }, fail);
    }
  },
  getLocalMoviesInTheaters: function getLocalMoviesInTheaters(status, results) {
    console.log('getLocalMoviesInTheaters called'); // Діагностика
    var key = 'in_theaters_' + getRegion();
    if (categoryCache[key] && categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp < CACHE_TTL) {
      finalizeResults(categoryCache[key].data, status, results, 'in_theaters');
    } else {
      var today = new Date();
      var priorDate = new Date(new Date().setDate(today.getDate() - 30));
      var dateString = priorDate.getFullYear() + '-' + (priorDate.getMonth() + 1) + '-' + priorDate.getDate();
      Lampa.TMDB.api('discover/movie?region=' + getRegion() + '&language=' + getInterfaceLanguage() + '&sort_by=popularity.desc&release_date.gte=' + dateString + '&with_release_type=3|2', function (json) {
        console.log('TMDB response:', json); // Діагностика
        if (json.results) {
          var status = new Lampa.Status(json.results.length);
          status.onComplite = function () {
            finalizeResults(json, status, results, 'in_theaters');
          };
          json.results.forEach(function (item, i) {
            Lampa.TMDB.release(item.id, 'movie', function (release) {
              json.results[i].release_details = release;
              status.append(item.id, {});
            }, function () {
              status.append(item.id, {});
            });
          });
          categoryCache[key] = {
            data: json,
            timestamp: Date.now()
          };
          Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
        } else {
          console.error('No results for in_theaters'); // Діагностика
          status.append({}, {});
        }
      }, function () {
        console.error('TMDB request failed'); // Діагностика
        status.append({}, {});
      });
    }
  }
  // ... (інші методи, як getUpcomingMovies, getNewSeriesSeasons тощо, залишаються без змін)
};
function main(status, results) {
  console.log('main called:', {
    status,
    results
  }); // Діагностика
  if (!(status instanceof Lampa.Status)) {
    console.error('Invalid status object:', status);
    return;
  }
  Api.getLocalMoviesInTheaters(status, results);
  Api.getUpcomingMovies(status, results);
  Api.getNewSeriesSeasons(status, results);
  Api.getUpcomingSeries(status, results);
  Api.getPopularTrailers(status, results);
}

;// ./t2/trailer.js


function Trailer(data, params) {
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
  this.cardImgBackground = function (card_data) {
    if (Lampa.Storage.field('background')) {
      if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
      }
      return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
    }
    return '';
  };
  this.image = function () {
    var _this = this;
    this.img.onload = function () {
      _this.card.addClass('card--loaded');
    };
    this.img.onerror = function () {
      _this.img.src = './img/img_broken.svg';
    };
  };
  this.loadTrailerInfo = function () {
    var _this = this;
    if (!this.is_youtube && !this.trailer_lang) {
      Api.videos(data, function (videos) {
        var trailers = videos.results ? videos.results.filter(function (v) {
          return v.type === 'Trailer';
        }) : [];
        var preferredLangs = getPreferredLanguage();
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
            var region = getRegion();
            var releaseInfo = data.release_details.results.find(function (r) {
              return r.iso_3166_1 === region;
            });
            if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
              var releaseDate = releaseInfo.release_dates[0].release_date;
              _this.release_date = formatDateToDDMMYYYY(releaseDate);
            } else if (data.release_date) {
              _this.release_date = formatDateToDDMMYYYY(data.release_date);
            }
          } else if (data.release_date) {
            _this.release_date = formatDateToDDMMYYYY(data.release_date);
          }
        } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
          if (data.release_details && data.release_details.first_air_date) {
            _this.release_date = formatDateToDDMMYYYY(data.release_details.first_air_date);
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
  this.create = function () {
    var _this2 = this;
    this.build();
    if (!this.is_youtube) {
      Api.videos(data, function (videos) {
        var trailers = videos.results ? videos.results.filter(function (v) {
          return v.type === 'Trailer';
        }) : [];
        if (trailers.length === 0) {
          _this2.card = null;
          return;
        }
        _this2.card.on('hover:focus', function (e, is_mouse) {
          Lampa.Background.change(_this2.cardImgBackground(data));
          _this2.onFocus(e.target, data, is_mouse);
          _this2.loadTrailerInfo();
        }).on('hover:enter', function () {
          var preferredLangs = getPreferredLanguage();
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
        }).on('hover:long', function () {
          var items = [{
            title: Lampa.Lang.translate('trailers_view'),
            view: true
          }];
          Lampa.Loading.start(function () {
            Api.clear();
            Lampa.Loading.stop();
          });
          items.push({
            title: Lampa.Lang.translate('title_trailers'),
            separator: true
          });
          trailers.forEach(function (video) {
            if (video.key && getPreferredLanguage().includes(video.iso_639_1)) {
              items.push({
                title: video.name || 'Trailer',
                id: video.key,
                subtitle: video.iso_639_1
              });
            }
          });
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
        });
        _this2.image();
        _this2.loadTrailerInfo();
      }, function () {
        _this2.card = null;
      });
    } else {
      this.card.on('hover:focus', function (e, is_mouse) {
        Lampa.Background.change(_this2.cardImgBackground(data));
        _this2.onFocus(e.target, data, is_mouse);
      }).on('hover:enter', function () {
        _this2.play(data.id);
      });
      this.image();
    }
  };
  this.destroy = function () {
    if (this.img) {
      this.img.onerror = null;
      this.img.onload = null;
      this.img.src = '';
    }
    if (this.card) {
      this.card.remove();
      this.card = null;
    }
    this.img = null;
  };
  this.visible = function () {
    if (this.visibled || !this.card) return;
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
  this.render = function () {
    return this.card || $('<div></div>');
  };
}

;// ./t2/line.js

function Line(data) {
  console.log('Line constructor called'); // Діагностика
  this.data = data;
  this.cards = [];
  this.create = function () {
    console.log('Line.create called'); // Діагностика
    this.cards = [];
    this.data.results.forEach(item => {
      const card = new Trailer(item, {
        type: this.data.type
      });
      card.create();
      this.cards.push(card);
    });
  };
  this.render = function () {
    console.log('Line.render called'); // Діагностика
    const element = Lampa.Template.get('line', {
      title: this.data.title
    });
    this.cards.forEach(card => {
      const cardElement = card.render();
      if (cardElement && cardElement.length) {
        element.find('.line__cards').append(cardElement);
      }
    });
    return element;
  };
  this.destroy = function () {
    console.log('Line.destroy called'); // Діагностика
    this.cards.forEach(card => {
      card.destroy();
    });
    this.cards = [];
  };
  this.toggle = function () {
    if (this.cards.length) {
      Lampa.Controller.collectionSet(this.render());
      Lampa.Controller.collectionFocus(this.cards[0].render()[0], this.render());
    }
  };
  this.onDown = function () {};
  this.onUp = function () {};
  this.onBack = function () {};
}
 // Явний експорт
;// ./t2/component.js


function Component(object) {
  var scroll;
  var items = [];
  var active = 0;
  var light;
  this.create = function () {
    console.log('Component.create called'); // Діагностика
    try {
      scroll = $('<div class="trailers scroll--h"></div>');
      var menu = [];
      if (!Lampa.Platform.is('tizen')) {
        menu.push({
          title: Lampa.Lang.translate('settings_reset'),
          subtitle: Lampa.Lang.translate('trailers_clear_cache'),
          clear: true
        });
      }
      Lampa.Component.add('trailers', this);
      this.build();
    } catch (e) {
      console.error('Error in Component.create:', e);
      scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
    }
  };
  this.build = function () {
    console.log('Component.build called'); // Діагностика
    try {
      if (!Lampa.Status) {
        console.error('Lampa.Status is undefined');
        scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
        return;
      }
      var status = new Lampa.Status(5);
      var results = {};
      status.onComplite = function () {
        console.log('Status completed:', results); // Діагностика
        var hasItems = false;
        for (var i in results) {
          if (results[i].results && results[i].results.length) {
            this.append(results[i]);
            hasItems = true;
          }
        }
        if (!hasItems) {
          console.log('No items to display'); // Діагностика
          scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
        }
        if (light) Lampa.Background.immediately('');
        this.activity.loader(false);
        this.activity.toggle();
      }.bind(this);
      main(status, results);
    } catch (e) {
      console.error('Error in Component.build:', e);
      scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
    }
  };
  this.append = function (element) {
    console.log('Component.append called:', element); // Діагностика
    try {
      var item = new Line(element);
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
    } catch (e) {
      console.error('Error in Component.append:', e);
    }
  };
  this.down = function () {/* ... */};
  this.up = function () {/* ... */};
  this.back = function () {/* ... */};
  this.start = function () {/* ... */};
  this.activity = object.activity;
  this.destroy = function () {/* ... */};
}

;// ./t2/templates.js
const translations = {
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
;// ./t2/index.js





function startPlugin() {
  if (window.plugin_trailers_ready) return;
  window.plugin_trailers_ready = true;

  // Додаємо переклади 
  Lampa.Lang.add(translations);

  // Реєструємо компоненти
  Lampa.Component.add('trailers_main', component_namespaceObject.Component$1);
  Lampa.Component.add('trailers_full', Component);

  // Додаємо шаблони та стилі
  initTemplates();
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
        Api.clear();
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

//# sourceMappingURL=t2.js.map