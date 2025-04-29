(function () {
    console.log('Trailers plugin: Script execution started at', new Date().toISOString());
    'use strict';

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';

    function getFormattedDate(offsetDays, isEnd) {
        var today = new Date();
        if (offsetDays) today.setDate(today.getDate() + offsetDays);
        var year = today.getFullYear();
        var month = String(isEnd ? 12 : today.getMonth() + 1).padStart(2, '0');
        var day = String(isEnd ? 31 : today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatReleaseDate(date) {
        if (!date) return '-';
        var d = new Date(date);
        var day = String(d.getDate()).padStart(2, '0');
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    function get(url, page, resolve, reject, useRegion) {
        var lang = Lampa.Storage.get('language', 'ru');
        var full_url = `${tmdb_base_url}${url}&api_key=${tmdb_api_key}&language=${lang}&page=${page}`;
        if (useRegion) full_url += `&region=${getRegion()}`;
        console.log('API Request:', full_url);
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result);
            resolve(result);
        }, function (error) {
            console.log('API Error:', url, error);
            reject(error);
        });
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(3);
        var mediaType = Lampa.Storage.get('trailers_media_type', 'movie');
        var popularPeriod = Lampa.Storage.get('trailers_popular_period', 'week');
        var upcomingPeriod = Lampa.Storage.get('trailers_upcoming_period', 'week');

        status.onComplite = function () {
            var fulldata = [];
            ['popular', 'now_playing', 'upcoming'].forEach(function (key) {
                if (status.data[key]) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main completed:', fulldata);
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            if (name === 'now_playing') {
                json.results = shuffle(json.results);
            }
            status.append(name, json);
        };

        var popularDate = popularPeriod === 'week' ? getFormattedDate(-7) :
                         popularPeriod === 'month' ? getFormattedDate(-30) :
                         getFormattedDate(-365);
        get(`/${mediaType}/popular?sort_by=vote_average.desc&primary_release_date.gte=${popularDate}&without_genres=99,10763`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular'), 'popular', `/${mediaType}/popular?sort_by=vote_average.desc&primary_release_date.gte=${popularDate}&without_genres=99,10763`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get(`/${mediaType}/${mediaType === 'movie' ? 'now_playing' : 'on_the_air'}?release_date.gte=${getFormattedDate(-30)}&release_date.lte=${getFormattedDate(0)}&without_genres=99,10763`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'now_playing', `/${mediaType}/${mediaType === 'movie' ? 'now_playing' : 'on_the_air'}?release_date.gte=${getFormattedDate(-30)}&release_date.lte=${getFormattedDate(0)}&without_genres=99,10763`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        var upcomingDate = upcomingPeriod === 'week' ? getFormattedDate(7) :
                          upcomingPeriod === 'month' ? getFormattedDate(30) :
                          getFormattedDate(365);
        get(`/${mediaType}/${mediaType === 'movie' ? 'upcoming' : 'discover'}?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0)}&release_date.lte=${upcomingDate}&without_genres=99,10763`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming'), 'upcoming', `/${mediaType}/${mediaType === 'movie' ? 'upcoming' : 'discover'}?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0)}&release_date.lte=${upcomingDate}&without_genres=99,10763`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);
    }

    function full(params, oncomplite, onerror) {
        get(params.url, params.page, function (result) {
            if (result && result.results && result.results.length) {
                if (params.type === 'now_playing') {
                    result.results = shuffle(result.results);
                }
                oncomplite(result);
            } else {
                console.log('Full: No results for', params.url);
                onerror();
            }
        }, function (error) {
            console.log('Full error:', params.url, error);
            onerror();
        }, params.type === 'popular' || params.type === 'now_playing');
    }

    async function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var userLang = Lampa.Storage.get('language', 'ru');
        var langPriority = userLang === 'uk' ? ['uk', 'en'] :
                          userLang === 'ru' ? ['ru', 'en'] :
                          ['en'];
        var allTrailers = [];
        var selectedTrailer = null;

        for (var lang of langPriority) {
            try {
                var url = `${tmdb_base_url}/${type}/${card.id}/videos?api_key=${tmdb_api_key}&language=${lang}`;
                console.log('Videos request:', url);
                var response = await fetch(url);
                var result = await response.json();
                console.log('Videos result for', lang, ':', result);

                if (result.results && result.results.length) {
                    result.results.forEach(function (video) {
                        if (video.type === 'Trailer' && video.site === 'YouTube' && !['zh', 'ja', 'ko', 'tr', 'es', 'pt'].includes(video.iso_639_1)) {
                            video.requested_lang = lang;
                            allTrailers.push(video);
                        }
                    });
                }
            } catch (error) {
                console.log('Videos error for', lang, ':', error);
            }
        }

        console.log('All trailers found:', allTrailers);

        for (var lang of langPriority) {
            selectedTrailer = allTrailers.find(function (video) {
                return (video.iso_639_1 === lang || video.requested_lang === lang) && video.type === 'Trailer' && video.site === 'YouTube';
            });
            if (selectedTrailer) {
                selectedTrailer.iso_639_1 = lang;
                break;
            }
        }

        if (selectedTrailer) {
            console.log('Selected trailer:', selectedTrailer);
            oncomplite({ results: [selectedTrailer] });
        } else {
            console.log('No trailers found for card:', card.id);
            onerror();
        }
    }

    function clear() {
        network.clear();
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

            if (!this.is_youtube) {
                var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
                this.card.find('.card__title').text(data.title || data.name);
                this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
                this.card.find('.card__view').append('<div class="card__lang">-</div>');
                if (params.type === 'popular' || params.type === 'now_playing') {
                    this.card.find('.card__info').text(data.vote_average ? data.vote_average.toFixed(1) : '-');
                } else if (params.type === 'upcoming') {
                    this.card.find('.card__info').text(formatReleaseDate(data.release_date || data.first_air_date));
                }
            } else {
                this.card.find('.card__title').text(data.name);
                this.card.find('.card__details').remove();
                this.card.find('.card__info').remove();
            }
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? `https://img.youtube.com/vi/${data.id}/hqdefault.jpg` : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? `https://img.youtube.com/vi/${data.id}/hqdefault.jpg` : '';
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

        this.play = function (id) {
            if (!id) {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
            console.log('Playing video ID:', id);
            if (Lampa.Manifest.app_digital >= 183) {
                var poster = data.poster_path ? Lampa.Api.img(data.poster_path) : data.backdrop_path ? Lampa.Api.img(data.backdrop_path, 'w500') : '';
                var item = {
                    title: Lampa.Utils.shortText(data.title || data.name, 50),
                    id: id,
                    youtube: true,
                    url: `https://www.youtube.com/watch?v=${id}`,
                    icon: `<img class="size-youtube" src="https://img.youtube.com/vi/${id}/hqdefault.jpg" onerror="this.src='${poster}'" />`,
                    template: 'selectbox_icon'
                };
                Lampa.Player.play(item);
                Lampa.Player.playlist([item]);
            } else {
                Lampa.YouTube.play(id);
            }
        };

        this.setTrailerLanguage = function (lang) {
            if (!this.is_youtube) {
                console.log('Setting trailer language:', lang || '-');
                this.card.find('.card__lang').text(lang ? lang.toUpperCase() : '-');
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();

            if (!_this2.is_youtube) {
                Api.videos(data, function (videos) {
                    var userLang = Lampa.Storage.get('language', 'ru');
                    var video = videos.results[0];
                    if (video) {
                        _this2.setTrailerLanguage(video.iso_639_1);
                    }
                }, function () {
                    _this2.setTrailerLanguage('-');
                });
            }

            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    Api.videos(data, function (videos) {
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var video = videos.results[0];
                        if (video && video.key) {
                            _this2.play(video.key);
                            _this2.setTrailerLanguage(video  .iso_639_1);
                            if (userLang === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                            } else if (userLang === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                            } else if (userLang === 'uk' && video.iso_639_1 !== 'uk') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_uk_trailer'));
                            } else if (userLang === 'ru' && video.iso_639_1 !== 'ru') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                            }
                        } else {
                            _this2.setTrailerLanguage('-');
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        _this2.setTrailerLanguage('-');
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
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var video = videos.results[0];
                        if (video && video.key) {
                            items.push({
                                title: Lampa.Lang.translate('title_trailers'),
                                separator: true
                            });
                            items.push({
                                title: video.name || 'Trailer',
                                id: video.key,
                                subtitle: video.iso_639_1 === userLang ? 'Local' : video.iso_639_1
                            });
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
                                        _this2.setTrailerLanguage(videos.results[0].iso_639_1);
                                        if (userLang === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                                        } else if (userLang === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                                        } else if (userLang === 'uk' && video.iso_639_1 !== 'uk') {
                                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_uk_trailer'));
                                        } else if (userLang === 'ru' && video.iso_639_1 !== 'ru') {
                                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                                        }
                                    }
                                },
                                onBack: function () {
                                    Lampa.Controller.toggle('content');
                                }
                            });
                        } else {
                            Lampa.Loading.stop();
                            _this2.setTrailerLanguage('-');
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        Lampa.Loading.stop();
                        _this2.setTrailerLanguage('-');
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    });
                }
            });
            this.image();
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
                this.img.src = `https://img.youtube.com/vi/${data.id}/hqdefault.jpg`;
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
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var items = [];
        var active = 0;
        var more;
        var last;

        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);

            if (data.type === 'popular' || data.type === 'upcoming') {
                var periodSelect = $('<div class="period-select"></div>');
                var periods = ['week', 'month', 'year'];
                periods.forEach(function (period) {
                    var periodButton = $(`<span class="period-button selector">${Lampa.Lang.translate('trailers_period_' + period)}</span>`);
                    if ((data.type === 'popular' && period === Lampa.Storage.get('trailers_popular_period', 'week')) ||
                        (data.type === 'upcoming' && period === Lampa.Storage.get('trailers_upcoming_period', 'week'))) {
                        periodButton.addClass('active focused');
                    }
                    periodButton.on('hover:enter', function () {
                        Lampa.Storage.set(data.type === 'popular' ? 'trailers_popular_period' : 'trailers_upcoming_period', period);
                        $('.period-button').removeClass('focused');
                        periodButton.addClass('focused');
                        Lampa.Activity.push({
                            url: '',
                            title: Lampa.Lang.translate('title_trailers'),
                            component: 'trailers_main',
                            page: 1
                        });
                    });
                    periodButton.on('hover:focus', function () {
                        $('.period-button').removeClass('focused');
                        periodButton.addClass('focused');
                    });
                    periodSelect.append(periodButton);
                });
                content.find('.items-line__title').after(periodSelect);
            }

            this.bind();
            body.append(scroll.render());
        };

        this.bind = async function () {
            for (var element of data.results) {
                try {
                    var trailer = await new Promise(function (resolve, reject) {
                        Api.videos(element, function (videos) {
                            resolve(videos.results[0]);
                        }, function () {
                            reject();
                        });
                    });
                    if (trailer) {
                        this.append(element);
                    }
                } catch (e) {
                    console.log('No trailer for:', element.id);
                }
            }
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

        this.append = function (element) {
            var _this = this;
            var card = new Trailer(element, { type: data.type });
            card.create();
            card.visible();
            card.onFocus = function (target, card_data, is_mouse) {
                last = target;
                active = items.indexOf(card);
                if (!is_mouse) scroll.update(items[active].render(), true);
                if (_this.onFocus) _this.onFocus(card_data);
            };
            scroll.append(card.render());
            items.push(card);
        };

        this.more = function () {
            more = Lampa.Template.get('more');
            more.addClass('more--trailers');
            more.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: 2
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
                },
                right: function () {
                    Navigator.move('right');
                    Lampa.Controller.enable('items_line');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else if (_this2.onLeft) _this2.onLeft();
                    else Lampa.Controller.toggle('menu');
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
            var switcher = $('<div class="trailers-switcher"></div>');
            var movieButton = $('<div class="menu__item selector"><div class="menu__text">Фільми</div></div>');
            var seriesButton = $('<div class="menu__item selector"><div class="menu__text">Серіали</div></div>');
            if (Lampa.Storage.get('trailers_media_type', 'movie') === 'movie') {
                movieButton.addClass('active focused');
            } else {
                seriesButton.addClass('active focused');
            }
            movieButton.on('hover:enter', function () {
                Lampa.Storage.set('trailers_media_type', 'movie');
                $('.trailers-switcher .menu__item').removeClass('focused');
                movieButton.addClass('focused');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            seriesButton.on('hover:enter', function () {
                Lampa.Storage.set('trailers_media_type', 'tv');
                $('.trailers-switcher .menu__item').removeClass('focused');
                seriesButton.addClass('focused');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            movieButton.on('hover:focus', function () {
                $('.trailers-switcher .menu__item').removeClass('focused');
                movieButton.addClass('focused');
            });
            seriesButton.on('hover:focus', function () {
                $('.trailers-switcher .menu__item').removeClass('focused');
                seriesButton.addClass('focused');
            });
            switcher.append(movieButton).append(seriesButton);
            html.append(switcher);

            Api.main(this.build.bind(this), this.empty.bind(this));
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
                    if (step > 0) _this.down();
                    else _this.up();
                };
            }
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (element) {
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

        this.append = async function (data, append) {
            var _this2 = this;
            for (var element of data.results) {
                try {
                    var trailer = await new Promise(function (resolve, reject) {
                        Api.videos(element, function (videos) {
                            resolve(videos.results[0]);
                        }, function () {
                            reject();
                        });
                    });
                    if (trailer) {
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
                    }
                } catch (e) {
                    console.log('No trailer for:', element.id);
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
                if (total_pages > data.page && items.length) this.more();
                scroll.append(body);
                if (newlampa) {
                    scroll.onEnd = this.next.bind(this);
                    scroll.onWheel = function (step) {
                        if (!Lampa.Controller.own(_this3)) _this3.start();
                        if (step > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    };
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
            ru: 'Популярные',
            uk: 'Популярні',
            en: 'Popular'
        },
        trailers_in_theaters: {
            ru: 'В прокате',
            uk: 'В прокаті',
            en: 'Now Playing'
        },
        trailers_upcoming: {
            ru: 'Скоро',
            uk: 'Незабаром',
            en: 'Upcoming'
        },
        trailers_no_trailers: {
            ru: 'Трейлеров не найдено',
            uk: 'Трейлерів не знайдено',
            en: 'No trailers found'
        },
        trailers_no_uk_trailer: {
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
        trailers_period_week: {
            ru: 'Неделя',
            uk: 'Тиждень',
            en: 'Week'
        },
        trailers_period_month: {
            ru: 'Месяц',
            uk: 'Місяць',
            en: 'Month'
        },
        trailers_period_year: {
            ru: 'Год',
            uk: 'Рік',
            en: 'Year'
        }
    });

    function startPlugin() {
        if (window.plugin_trailers_ready) {
            console.log('Trailers plugin: Already initialized, skipping at', new Date().toISOString());
            return;
        }
        console.log('Trailers plugin: startPlugin called at', new Date().toISOString());
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', `
            <div class="card selector card--trailer layer--render layer--visible">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="card__promo">
                        <div class="card__promo-text">
                            <div class="card__title"></div>
                        </div>
                        <div class="card__details"></div>
                    </div>
                    <div class="card__info"></div>
                </div>
                <div class="card__play">
                    <img src="./img/icons/player/play.svg">
                </div>
            </div>
        `);
        Lampa.Template.add('trailer_style', `
            <style>
            .card.card--trailer,
            .card-more.more--trailers {
                width: 25.7em;
            }
            .card.card--trailer .card__view {
                padding-bottom: 56%;
                margin-bottom: 0;
                position: relative;
            }
            .card.card--trailer .card__details {
                margin-top: 0.8em;
            }
            .card.card--trailer .card__play {
                position: absolute;
                top: 1.4em;
                left: 1.5em;
                background: #000000b8;
                width: 2.2em;
                height: 2.2em;
                border-radiusgester 100%;
                text-align: center;
                padding-top: 0.6em;
            }
            .card.card--trailer .card__play img {
                width: 0.9em;
                height: 1em;
            }
            .card.card--trailer .card__lang {
                position: absolute;
                top: 0.5em;
                right: 0.5em;
                background: #000000b8;
                color: white;
                padding: 0.2em 0.5em;
                border-radius: 3px;
                font-size: 0.9em;
            }
            .card.card--trailer .card__info {
                position: absolute;
                bottom: 0.5em;
                right: 0.5em;
                background: #000000b8;
                color: white;
                padding: 0.2em 0.5em;
                border-radius: 3px;
                font-size: 1.2em;
            }
            .card.card--trailer.card--focus {
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                transform: scale(1.05);
                z-index: 1;
            }
            .card-more.more--trailers .card-more__box {
                padding-bottom: 56%;
            }
            .category-full--trailers .card {
                margin-bottom: 1.5em;
            }
            .category-full--trailers .card {
                width: 33.3%;
            }
            .trailers-switcher {
                margin: 1em;
                display: flex;
                gap: 1em;
            }
            .period-select {
                margin-top: 0.5em;
                display: flex;
                gap: 0.5em;
            }
            @media screen and (max-width: 767px) {
                .category-full--trailers .card {
                    width: 50%;
                }
            }
            @media screen and (max-width: 400px) {
                .category-full--trailers .card {
                    width: 100%;
                }
            }
            </style>
        `);

        function add() {
            console.log('Trailers plugin: Adding menu button at', new Date().toISOString());
            var button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="menu__text">${Lampa.Lang.translate('title_trailers')}</div>
                </li>
            `);
            button.on('hover:enter', function () {
                console.log('Trailers plugin: Button clicked, pushing activity at', new Date().toISOString());
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });

            // Перевіряємо наявність меню
            var menuLists = $('.menu .menu__list');
            console.log('Trailers plugin: Available menu lists:', menuLists.length);
            
            // Спробуємо додати в друге меню
            var secondMenu = $('.menu .menu__list').eq(1);
            if (secondMenu.length) {
                console.log('Trailers plugin: Second menu exists, appending button');
                secondMenu.append(button);
                console.log('Trailers plugin: Button appended to second menu at', new Date().toISOString());
            } else {
                console.log('Trailers plugin: Second menu does not exist, trying first menu');
                // Якщо другого меню немає, додаємо в перше
                var firstMenu = $('.menu .menu__list').eq(0);
                if (firstMenu.length) {
                    console.log('Trailers plugin: First menu exists, appending button');
                    firstMenu.append(button);
                    console.log('Trailers plugin: Button appended to first menu at', new Date().toISOString());
                } else {
                    console.log('Trailers plugin: No menu lists available to append button');
                }
            }

            $('body').append(Lampa.Template.get('trailer_style', {}, true));
            console.log('Trailers plugin: Menu button added at', new Date().toISOString());
        }

        // Функція для повторного додавання кнопки, якщо меню з’явиться пізніше
        function tryAddButtonWithRetry(attempts, delay) {
            if (attempts <= 0) {
                console.log('Trailers plugin: Max attempts reached, stopping retry');
                return;
            }

            var menuLists = $('.menu .menu__list');
            if (menuLists.length) {
                console.log('Trailers plugin: Menu found during retry, adding button');
                add();
            } else {
                console.log('Trailers plugin: Menu not found, retrying in', delay, 'ms (attempts left:', attempts, ')');
                setTimeout(function () {
                    tryAddButtonWithRetry(attempts - 1, delay);
                }, delay);
            }
        }

        if (window.appready) {
            console.log('Trailers plugin: appready true, calling add at', new Date().toISOString());
            add();
        } else {
            console.log('Trailers plugin: waiting for app ready at', new Date().toISOString());
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    console.log('Trailers plugin: app ready event, calling add at', new Date().toISOString());
                    add();
                    // Додаємо повторну спробу на випадок, якщо меню ще не готове
                    tryAddButtonWithRetry(5, 1000); // 5 спроб з інтервалом 1 секунда
                }
            });
        }

        function checkMenuButton() {
            var secondMenuButton = $('.menu .menu__list').eq(1).find('.menu__item:contains("Трейлери")');
            var firstMenuButton = $('.menu .menu__list').eq(0).find('.menu__item:contains("Трейлери")');
            if (secondMenuButton.length) {
                console.log('Trailers plugin: Menu button present in second menu, count:', secondMenuButton.length);
            } else if (firstMenuButton.length) {
                console.log('Trailers plugin: Menu button present in first menu, count:', firstMenuButton.length);
            } else {
                console.log('Trailers plugin: Menu button missing, re-adding at', new Date().toISOString());
                add();
            }
        }
        setInterval(checkMenuButton, 5000); // Перевірка кожні 5 секунд

        // Додаємо обробник для перевірки після перезавантаження
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'reload') {
                console.log('Trailers plugin: App reloaded, re-adding button at', new Date().toISOString());
                add();
            }
        });
    }

    console.log('Trailers plugin: Forcing initialization at', new Date().toISOString());
    setTimeout(function () {
        if (!window.plugin_trailers_ready) {
            console.log('Trailers plugin: Calling startPlugin after delay at', new Date().toISOString());
            startPlugin();
        } else {
            console.log('Trailers plugin: startPlugin skipped, already initialized at', new Date().toISOString());
        }
    }, 5000); // Затримка 5 секунд
})();
