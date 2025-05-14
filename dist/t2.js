(function () {
    'use strict';
(function () {
    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
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

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.utils = {
        debounce: debounce,
        getFormattedDate: getFormattedDate,
        formatDateToDDMMYYYY: formatDateToDDMMYYYY,
        getRegion: getRegion,
        getInterfaceLanguage: getInterfaceLanguage,
        getPreferredLanguage: getPreferredLanguage
    };
})();
(function () {
    var network = new Lampa.Reguest();
    var trailerCache = {};
    var categoryCache = {};

    function get(url, oncomplite, onerror) {
        network.silent(Lampa.TMDB.api(url), oncomplite, onerror);
    }

    function getLocalMoviesInTheaters(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region = window.plugin_upcoming.utils.getRegion();
        get('discover/movie?primary_release_date.lte=' + date + '&sort_by=popularity.desc&with_release_type=3|2®ion=' + region + '&page=' + page, oncomplite, onerror);
    }

    function getUpcomingMovies(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region = window.plugin_upcoming.utils.getRegion();
        get('discover/movie?primary_release_date.gte=' + date + '&sort_by=popularity.desc®ion=' + region + '&page=' + page, function (data) {
            if (data.results) {
                data.results = data.results.filter(function (item) {
                    return item.release_date;
                });
            }
            oncomplite(data);
        }, onerror);
    }

    function main(params, oncomplite, onerror) {
        var data = { lines: [] };
        var appendLine = function appendLine(key, title, filter) {
            data.lines.push({
                title: Lampa.Lang.translate(title),
                component: 'trailers_line',
                filter: filter,
                params: { category: key }
            });
        };
        appendLine('popular_movies', 'trailers_popular', true);
        appendLine('in_theaters', 'trailers_in_theaters', false);
        appendLine('upcoming_movies', 'trailers_upcoming_movies', true);
        appendLine('popular_series', 'trailers_popular_series', true);
        appendLine('new_series_seasons', 'trailers_new_series_seasons', true);
        appendLine('upcoming_series', 'trailers_upcoming_series', true);
        oncomplite(data);
    }

    function full(params, oncomplite, onerror) {
        var category = params.category;
        var page = params.page || 1;
        var cacheKey = category + '_' + page;
        if (categoryCache[cacheKey]) {
            return oncomplite(categoryCache[cacheKey]);
        }
        var onData = function onData(data) {
            var results = data.results || [];
            results = results.map(function (item) {
                return {
                    id: item.id,
                    title: item.title || item.name,
                    original_title: item.original_title || item.original_name,
                    poster_path: item.poster_path,
                    backdrop_path: item.backdrop_path,
                    release_date: item.release_date || item.first_air_date,
                    vote_average: item.vote_average,
                    media_type: category.indexOf('series') !== -1 ? 'tv' : 'movie'
                };
            });
            var response = {
                results: results,
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results
            };
            categoryCache[cacheKey] = response;
            Lampa.Storage.set('trailer_category_cache_' + cacheKey, response);
            oncomplite(response);
        };
        var cached = Lampa.Storage.get('trailer_category_cache_' + cacheKey);
        if (cached) {
            categoryCache[cacheKey] = cached;
            return oncomplite(cached);
        }
        if (category === 'popular_movies') {
            get('movie/popular?page=' + page, onData, onerror);
        } else if (category === 'in_theaters') {
            getLocalMoviesInTheaters(page, onData, onerror);
        } else if (category === 'upcoming_movies') {
            getUpcomingMovies(page, onData, onerror);
        } else if (category === 'popular_series') {
            get('tv/popular?page=' + page, onData, onerror);
        } else if (category === 'new_series_seasons') {
            get('tv/on_the_air?page=' + page, onData, onerror);
        } else if (category === 'upcoming_series') {
            var date = window.plugin_upcoming.utils.getFormattedDate();
            get('discover/tv?first_air_date.gte=' + date + '&sort_by=popularity.desc&page=' + page, onData, onerror);
        } else {
            onerror();
        }
    }

    function videos(id, media_type, oncomplite, onerror) {
        var cacheKey = media_type + '_' + id;
        if (trailerCache[cacheKey]) {
            return oncomplite(trailerCache[cacheKey]);
        }
        var onData = function onData(result) {
            var trailers = result.results ? result.results.filter(function (v) {
                return v.type === 'Trailer';
            }) : [];
            var preferredLangs = window.plugin_upcoming.utils.getPreferredLanguage();
            var video = trailers.find(function (v) {
                return preferredLangs.includes(v.iso_639_1);
            }) || trailers[0];
            var lang = Lampa.Storage.get('language', 'ru');
            if (!video) {
                var error = lang === 'uk' ? 'trailers_no_ua_trailer' : lang === 'ru' ? 'trailers_no_ru_trailer' : 'trailers_no_trailers';
                return onerror(Lampa.Lang.translate(error));
            }
            var response = {
                key: video.key,
                site: video.site,
                lang: video.iso_639_1,
                name: video.name
            };
            trailerCache[cacheKey] = response;
            oncomplite(response);
        };
        get(media_type + '/' + id + '/videos', onData, onerror);
    }

    function clear() {
        network.clear();
        trailerCache = {};
        categoryCache = {};
        ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
            Lampa.Storage.set('trailer_category_cache_' + key, null);
        });
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Api = {
        get: get,
        getLocalMoviesInTheaters: getLocalMoviesInTheaters,
        getUpcomingMovies: getUpcomingMovies,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };
})();
(function () {
    function Trailer(data, params) {
        var _this = this;
        this.card = Lampa.Template.get('trailer', true);
        this.data = data;
        this.params = params;
        this.card.addClass('card--trailer');
        var img = this.card.find('.card__img')[0];
        img.onerror = function () {
            img.src = './img/img_broken.svg';
        };
        img.src = Lampa.TMDB.image('w300' + data.poster_path);
        this.card.find('.card__title').text(data.title);
        this.card.find('.card__details').text(window.plugin_upcoming.utils.formatDateToDDMMYYYY(data.release_date));
        if (data.vote_average) {
            this.card.append('<div class="card__rating">' + data.vote_average.toFixed(1) + '</div>');
        }
        if (data.release_date) {
            this.card.append('<div class="card__release-date">' + window.plugin_upcoming.utils.formatDateToDDMMYYYY(data.release_date) + '</div>');
        }
        this.card.on('hover:enter', function () {
            window.plugin_upcoming.Api.videos(data.id, data.media_type, function (video) {
                _this.card.append('<div class="card__trailer-lang">' + video.lang + '</div>');
                Lampa.Player.play({
                    url: 'https://www.youtube.com/watch?v=' + video.key,
                    title: video.name
                });
                Lampa.Player.title(data.title);
            }, function (error) {
                Lampa.Noty.show(error);
            });
        });
        this.card.on('hover:focus', function () {
            Lampa.Scroll.update(_this.card);
        });
        this.card.on('hover:long', function () {
            window.plugin_upcoming.Api.clear();
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        });
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Trailer = Trailer;
})();
(function () {
    function Line(params) {
        var _this = this;
        this.params = params;
        this.cards = [];
        this.container = $('<div class="items-line category-full category-full--trailers"></div>');
        this.more = $('<div class="card-more more--trailers selector"><div class="card-more__box"><div class="card-more__title">' + Lampa.Lang.translate('trailers_more') + '</div></div></div>');
        this.container.append(this.more);
        this.page = 1;
        this.load = window.plugin_upcoming.utils.debounce(function () {
            _this.loading(true);
            window.plugin_upcoming.Api.full({
                category: _this.params.category,
                page: _this.page
            }, function (data) {
                _this.loading(false);
                data.results.forEach(function (item) {
                    var card = new window.plugin_upcoming.Trailer(item, _this.params);
                    _this.cards.push(card);
                    _this.container.append(card.card);
                });
                if (_this.page >= data.total_pages) {
                    _this.more.hide();
                    if (data.results.length === 1) {
                        var title = data.results[0].title;
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_last_movie').replace('[title]', title));
                    } else if (!data.results.length) {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
                    }
                }
            }, function () {
                _this.loading(false);
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            });
        }, 100);
        this.more.on('hover:enter', function () {
            _this.page++;
            _this.load();
        });
        this.loading(false);
        this.load();
    }

    Line.prototype.loading = function (status) {
        if (status) {
            this.container.addClass('loading');
        } else {
            this.container.removeClass('loading');
        }
    };

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Line = Line;
})();
(function () {
    function ComponentMain(params) {
        var _this = this;
        this.container = $('<div class="category-full"></div>');
        this.lines = [];

        this.start = function () {
            window.plugin_upcoming.Api.main(params, function (data) {
                data.lines.forEach(function (line) {
                    var l = new window.plugin_upcoming.Line(line.params);
                    _this.lines.push(l);
                    _this.container.append(l.container);
                    if (line.filter) {
                        var filter = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_filter') + '</div>');
                        l.container.append(filter);
                        filter.on('hover:enter', function () {
                            var menu = [];
                            ['day', 'week', 'month', 'year'].forEach(function (period) {
                                menu.push({
                                    title: Lampa.Lang.translate('trailers_filter_' + period),
                                    period: period
                                });
                            });
                            Lampa.Select.show({
                                title: Lampa.Lang.translate('trailers_filter'),
                                items: menu,
                                onSelect: function onSelect(item) {
                                    l.params.filter = item.period;
                                    l.cards.forEach(function (c) {
                                        return c.card.remove();
                                    });
                                    l.cards = [];
                                    l.page = 1;
                                    l.container.find('.card').remove();
                                    l.more.show();
                                    l.load();
                                }
                            });
                        });
                    }
                });
            }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            });
        };
    }

    function ComponentFull(params) {
        var _this = this;
        this.container = $('<div class="category-full category-full--trailers"></div>');
        this.line = new window.plugin_upcoming.Line(params);

        this.start = function () {
            _this.container.append(_this.line.container);
        };
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.ComponentMain = ComponentMain;
    window.plugin_upcoming.ComponentFull = ComponentFull;
})();
(function () {
    'use strict';
    // Версія 1.53: Виключено фільми без дати релізу в upcoming_movies, виправлено відображення на сторінці "Ще Очікувані фільми"

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

        Lampa.Component.add('trailers_main', window.plugin_upcoming.ComponentMain);
        Lampa.Component.add('trailers_full', window.plugin_upcoming.ComponentFull);

        Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
        Lampa.Template.add('trailer_style', [
            '<style>',
            '.card.card--trailer,.card-more.more--trailers{width:25.7em}',
            '.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}',
            '.card.card--trailer .card__details{margin-top:0.8em}',
            '.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}',
            '.card.card--trailer .card__play img{width:0.9em;height:1em}',
            '.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}',
            '.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase;font-size:1.2em}',
            '.card.card--trailer .card__release-date{position:absolute;top:2em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}',
            '.card-more.more--trailers .card-more__box{padding-bottom:56%}',
            '.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}',
            '.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}',
            '.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}',
            '.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}',
            '@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}',
            '@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}',
            '</style>'
        ].join('\n'));

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
                    window.plugin_upcoming.Api.clear();
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
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    } else {
        startPlugin();
    }
})();
})();
