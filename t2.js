(function () {
    'use strict';
    // Версія 1.32: Виправлено помилки для Популярні фільми, У прокаті, Популярні серіали, змінено мову на en, прибрано region

    // Власна функція debounce для обробки подій із затримкою
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

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';
    var trailerCache = {};

    function getFormattedDate(daysAgo) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
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

    function get(url, page, resolve, reject, useRegion, noLang) {
        var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page;
        if (!noLang) full_url += '&language=en'; // Змінено на en замість uk-UA
        if (useRegion) full_url += '&region=' + getRegion(); // Виправлено: коректний параметр region
        console.log('Сформований URL:', full_url);
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result);
            resolve(result);
        }, function (error) {
            console.log('API Error:', url, error, 'Status:', error.status, 'Status Text:', error.statusText);
            reject(error);
        });
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6); // 6 категорій
        status.onComplite = function () {
            var fulldata = [];
            var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
            keys.forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                } else {
                    console.log('No results for category:', key);
                }
            });
            console.log('Main completed:', fulldata);
            if (fulldata.length) {
                oncomplite(fulldata);
            } else {
                console.log('No data to display for any category');
                onerror();
            }
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            // Завжди додаємо категорію, навіть якщо результатів немає
            status.append(name, json);
        };

        // Дати для фільтрації
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180); // 6 місяців вперед
        var threeMonthsAgo = getFormattedDate(90);   // 3 місяці назад
        var threeMonthsLater = getFormattedDate(-90); // 3 місяці вперед

        // Популярні фільми
        get('/trending/movie/day', 1, function (json) {
            console.log('Популярні фільми results:', json.results);
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/day', { results: json.results || [] });
        }, function (error) {
            console.log('Помилка для Популярні фільми:', error);
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/day', { results: [] });
        }, false);

        // У прокаті (замінено на popular як резервний варіант)
        get('/movie/popular', 1, function (json) {
            console.log('У прокаті results:', json.results);
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/popular', { results: json.results || [] });
        }, function (error) {
            console.log('Помилка для У прокаті:', error);
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/popular', { results: [] });
        }, false);

        // Очікувані фільми (використовуємо /discover/movie)
        get('/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&popularity.gte=1&vote_count.gte=1', 1, function (json) {
            console.log('Очікувані фільми results:', json.results);
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function (error) {
            console.log('Помилка для Очікувані фільми:', error);
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
        }, false, true);

        // Популярні серіали (тренди TMDB)
        get('/trending/tv/day', 1, function (json) {
            console.log('Популярні серіали results:', json.results);
            var filteredResults = json.results ? json.results.filter(function (item) {
                return !item.genre_ids.includes(99) && !item.genre_ids.includes(10763) && !item.genre_ids.includes(10764);
            }) : [];
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/trending/tv/day', { results: filteredResults });
        }, function (error) {
            console.log('Помилка для Популярні серіали:', error);
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/trending/tv/day', { results: [] });
        }, false);

        // Нові сезони серіалів (використовуємо /discover/tv із air_date)
        get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&popularity.gte=1&vote_count.gte=1', 1, function (json) {
            console.log('Нові сезони серіалів results:', json.results);
            append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function (error) {
            console.log('Помилка для Нові сезони серіалів:', error);
            append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: [] });
        }, false, true);

        // Очікувані серіали (використовуємо /discover/tv із first_air_date)
        get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&popularity.gte=1&vote_count.gte=1', 1, function (json) {
            console.log('Очікувані серіали results:', json.results);
            append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function (error) {
            console.log('Помилка для Очікувані серіали:', error);
            append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
        }, false, true);
    }

    function full(params, oncomplite, onerror) {
        get(params.url, params.page, function (result) {
            if (result && result.results && result.results.length) {
                console.log('Full results:', result);
                oncomplite(result);
            } else {
                console.log('Full: No results for', params.url);
                onerror();
            }
        }, function (error) {
            console.log('Full error:', params.url, error, 'Status:', error.status, 'Status Text:', error.statusText);
            onerror();
        }, params.type === 'in_theaters' || params.type === 'upcoming_movies' || params.type === 'new_series_seasons' || params.type === 'upcoming_series', false);
    }

    function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var id = card.id;
        var cacheKey = type + '_' + id;

        if (trailerCache[cacheKey]) {
            console.log('Using cached trailer data for ' + cacheKey + ':', trailerCache[cacheKey]);
            oncomplite(trailerCache[cacheKey]);
            return;
        }

        var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key;
        var preferredLangs = getPreferredLanguage();
        var attempts = 0;
        var maxAttempts = preferredLangs.length + 1;
        var tmdbTrailers = [];

        function tryFetch(langIndex) {
            if (attempts >= maxAttempts) {
                console.log('Max attempts reached for ' + cacheKey + ', no TMDB trailers found in preferred languages. Languages tried:', preferredLangs);
                var englishTrailer = tmdbTrailers.find(function (v) {
                    return v.iso_639_1 === 'en';
                });
                if (englishTrailer) {
                    console.log('Found English trailer on TMDB:', englishTrailer);
                    trailerCache[cacheKey] = { id: id, results: [englishTrailer] };
                    oncomplite({ id: id, results: [englishTrailer] });
                } else {
                    console.log('No English trailer found on TMDB for ' + cacheKey);
                    trailerCache[cacheKey] = { id: id, results: [] };
                    onerror();
                }
                return;
            }

            var fetchUrl = url;
            if (langIndex < preferredLangs.length) {
                fetchUrl += '&language=' + preferredLangs[langIndex];
                console.log('Trying language for ' + cacheKey + ':', preferredLangs[langIndex]);
            } else {
                console.log('Trying without language for ' + cacheKey);
            }
            network.silent(fetchUrl, function (result) {
                console.log('Videos result for ' + cacheKey + ':', result.results.map(v => ({ type: v.type, iso_639_1: v.iso_639_1, name: v.name })));
                var trailers = result.results ? result.results.filter(function (v) {
                    return v.type === 'Trailer';
                }) : [];
                tmdbTrailers = tmdbTrailers.concat(trailers);
                var preferredTrailer = trailers.find(function (v) {
                    return preferredLangs.includes(v.iso_639_1);
                });
                if (preferredTrailer) {
                    console.log('Found TMDB trailer in preferred language for ' + cacheKey + ':', preferredTrailer);
                    trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
                    oncomplite({ id: id, results: [preferredTrailer] });
                } else {
                    attempts++;
                    tryFetch(langIndex + 1);
                }
            }, function (error) {
                console.log('Videos error for ' + cacheKey + ':', error);
                attempts++;
                tryFetch(langIndex + 1);
            });
        }

        tryFetch(0);
    }

    function clear() {
        network.clear();
        trailerCache = {};
    }

    var Api = {
        get: get,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };

    function Trailer(data, params) {
        this.build = function () {
            this.card = Lampa.Template.get('trailer', data);
            this.img = this.card.find('img')[0];
            this.is_youtube = params.type === 'rating';
            this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
            this.trailer_lang = '';

            if (!this.is_youtube) {
                var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
                this.card.find('.card__title').text(data.title || data.name);
                this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
                if (this.rating !== '-') {
                    this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div>');
                } else {
                    this.card.find('.card__view').append('<div class="card__rating">-</div>');
                }
                this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
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
                    console.log('Trailer info for ' + data.id + ': Available languages:', trailers.map(t => t.iso_639_1), 'Selected language:', _this.trailer_lang);
                    if (_this.trailer_lang !== '-') {
                        _this.card.find('.card__trailer-lang').text(_this.trailer_lang.toUpperCase());
                    } else {
                        _this.card.find('.card__trailer-lang').text('-');
                    }
                }, function () {
                    console.log('Failed to load trailer info for ' + data.id);
                    _this.trailer_lang = '-';
                    _this.card.find('.card__trailer-lang').text('-');
                });
            }
        };

        this.play = function (id) {
            if (!id) {
                console.error('Invalid video ID:', id);
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
            console.log('Attempting to play video ID:', id);
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
                    console.log('Playing via Lampa.Player:', item);
                    Lampa.Player.play(item);
                    Lampa.Player.playlist([item]);
                } else {
                    console.log('Playing via Lampa.YouTube:', id);
                    Lampa.YouTube.play(id);
                }
            } catch (e) {
                console.error('Error playing video:', e);
                Lampa.Noty.show('Помилка відтворення трейлера: ' + e.message);
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
                _this2.loadTrailerInfo();
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    console.log('Playing YouTube card directly:', data.id);
                    _this2.play(data.id);
                } else {
                    console.log('Fetching videos for card:', data.id);
                    Api.videos(data, function (videos) {
                        var preferredLangs = getPreferredLanguage();
                        var trailers = videos.results ? videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        }) : [];
                        console.log('Filtered trailers:', trailers);

                        var video = trailers.find(function (v) {
                            return preferredLangs.includes(v.iso_639_1);
                        }) || trailers[0];

                        if (video && video.key) {
                            console.log('Selected trailer:', video);
                            if (preferredLangs[0] === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
                            } else if (preferredLangs[0] === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                            }
                            _this2.play(video.key);
                        } else {
                            console.log('No playable trailer found');
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        console.log('Failed to fetch videos for card:', data.id);
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
                        Api.clear();
                        Lampa.Loading.stop();
                    });
                    Api.videos(data, function (videos) {
                        Lampa.Loading.stop();
                        var preferredLangs = getPreferredLanguage();
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
                            onSelect: function (item) {
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
                            onBack: function () {
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

        this.destroy = function () {
            this.img.onerror = null;
            this.img.onload = null;
            this.img.src = '';
            this.card.remove();
            this.card = null;
            this.img = null;
        };

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

        this.render = function () {
            return this.card;
        };
    }

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

        this.create = function () {
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
            filter.on('hover:enter', function () {
                var items = [
                    { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                    { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                    { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
                    { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
                ];
                Lampa.Select.show({
                    title: Lampa.Lang.translate('trailers_filter'),
                    items: items,
                    onSelect: function (item) {
                        Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                        Lampa.Activity.push({
                            url: item.value === 'day' ? '/trending/' + (data.type.includes('movie') ? 'movie' : 'tv') + '/' + item.value :
                                 item.value === 'week' ? '/trending/' + (data.type.includes('movie') ? 'movie' : 'tv') + '/' + item.value :
                                 item.value === 'month' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(30) :
                                 '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(365),
                            title: data.title,
                            component: 'trailers_main',
                            type: data.type,
                            page: 1
                        });
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('content');
                    }
                });
            });

            moreButton = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
            moreButton.on('hover:enter', function () {
                console.log('More button clicked:', data.title);
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

            var debouncedLoad = debounce(function () {
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
                remainingCards.forEach(function (element) {
                    var card = new Trailer(element, { type: data.type });
                    card.create();
                    card.visible();
                    card.onFocus = function (target, card_data, is_mouse) {
                        last = target;
                        active = items.indexOf(card);
                        if (_this.onFocus) _this.onFocus(card_data);
                        scroll.update(card.render(), true);
                    };
                    scroll.append(card.render());
                    items.push(card);
                });
                loadedIndex += remainingCards.length;
                Lampa.Layer.update();
                isLoading = false;
            } else {
                console.log('No more cards to load in this line');
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

        this.bind = function () {
            console.log('Binding data:', data.results);
            loadMoreCards();
            this.more();
            Lampa.Layer.update();
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

        this.more = function () {
            more = Lampa.Template.get('more');
            more.addClass('more--trailers');
            more.on('hover:enter', function () {
                console.log('More card clicked:', data.title);
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
            });
            more.on('hover:focus', function (e) {
                last = e.target;
                scroll.update(more, true);
            });
            scroll.append(more);
        };

        this.toggle = function () {
            var _this2 = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                    if (last && items.length) {
                        scroll.update($(last), true);
                    }
                },
                right: function () {
                    if (Navigator.canmove('right')) {
                        Navigator.move('right');
                        if (last && items.length) {
                            scroll.update($(last), true);
                        }
                    }
                    Lampa.Controller.enable('items_line');
                },
                left: function () {
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
                gone: function () {},
                back: this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () {
            return content;
        };

        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            content.remove();
            more && more.remove();
            filter && filter.remove();
            moreButton && moreButton.remove();
            items = [];
        };
    }

    function Component$1(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div></div>');
        var active = 0;
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;

        this.create = function () {
            console.log('Initial load: All categories');
            Api.main(this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Displaying empty state');
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            console.log('Building with data:', data);
            scroll.minus();
            html.append(scroll.render());
            data.forEach(this.append.bind(this));
            if (light) {
                scroll.onWheel = function (step) {
                    if (step > 0) _this.down();
                    else _this.up();
                };
            }
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (element) {
            console.log('Appending element:', element);
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
                toggle: function () {
                    if (items.length) {
                        _this2.detach();
                        items[active].toggle();
                    }
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
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
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="category-full category-full--trailers"></div>');
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var total_pages = 0;
        var last;
        var waitload = false;

        this.create = function () {
            Api.full(object, this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Displaying empty state for full view');
            var empty = new Lampa.Empty();
            scroll.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.next = function () {
            var _this = this;
            if (waitload) return;
            if (object.page < 30 && object.page < total_pages) {
                waitload = true;
                object.page++;
                Api.full(object, function (result) {
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
                console.log('No more pages to load');
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
            data.results.forEach(function (element) {
                var card = new Trailer(element, { type: object.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    scroll.update(card.render(), true);
                    if (!light && !newlampa && scroll.isEnd()) _this2.next();
                };
                body.append(card.render());
                items.push(card);
                if (append) Lampa.Controller.collectionAppend(card.render());
            });
        };

        this.build = function (data) {
            var _this3 = this;
            console.log('Building full view with data:', data);
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                scroll.minus();
                html.append(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && items.length) this.more();
                scroll.append(body);
                if (newlampa) {
                    scroll.onEnd = this.next.bind(this);
                    scroll.onWheel = function (step) {
                        if (!Lampa.Controller.own(_this3)) _this3.start();
                        if (step > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    };
                    var debouncedLoad = debounce(function () {
                        console.log('Scroll event: isEnd=', scroll.isEnd(), 'waitload=', waitload);
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
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
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

    Lampa.Lang.add({
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
        }
    });

    function startPlugin() {
        if (window.plugin_trailers_ready) return;
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
        Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');

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
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') add();
            });
        }
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
