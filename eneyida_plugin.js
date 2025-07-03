(function() {
    'use strict';

    var Defined = {
        api: 'eneyida',
        localhost: 'https://eneyida.tv/',
        apn: ''
    };

    var unic_id = Lampa.Storage.get('eneyida_unic_id', '');
    if (!unic_id) {
        unic_id = Lampa.Utils.uid(8).toLowerCase();
        Lampa.Storage.set('eneyida_unic_id', unic_id);
    }

    var plugin = {
        url: 'https://eneyida.tv',
        types: ['movie', 'series', 'anime', 'cartoon', 'cartoon-series'],
        catalog: [
            {type: 'movie', id: 'films', name: 'Фільми'},
            {type: 'series', id: 'series', name: 'Серіали'},
            {type: 'anime', id: 'anime', name: 'Аніме'},
            {type: 'cartoon', id: 'cartoon', name: 'Мультфільми'},
            {type: 'cartoon-series', id: 'cartoon-series', name: 'Мультсеріали'}
        ],
        search: {
            url: function(query) {
                return this.url + '?do=search&subaction=search&story=' + encodeURIComponent(query.replace(' ', '+'));
            },
            parse: function(html) {
                var items = [];
                $(html).find('article.short').each(function() {
                    var el = $(this);
                    var title = el.find('a.short_title').text().trim();
                    var href = el.find('a.short_title').attr('href');
                    var poster = plugin.url + el.find('a.short_img img').attr('data-src');

                    items.push({
                        title: title,
                        url: href,
                        poster: poster
                    });
                });
                return items;
            }
        },
        element: {
            url: function(type, id, page) {
                return this.url + '/' + id + '/page/' + page;
            },
            parse: function(html) {
                var items = [];
                $(html).find('article.short').each(function() {
                    var el = $(this);
                    var title = el.find('a.short_title').text().trim();
                    var href = el.find('a.short_title').attr('href');
                    var poster = plugin.url + el.find('a.short_img img').attr('data-src');

                    items.push({
                        title: title,
                        url: href,
                        poster: poster
                    });
                });
                return items;
            }
        },
        media: {
            url: function(url) {
                return url;
            },
            parse: function(html) {
                var $html = $(html);
                var fullInfo = $html.find('.full_info li');
                var title = $html.find('div.full_header-title h1').text().trim();
                var poster = plugin.url + $html.find('.full_content-poster img').attr('src');
                var banner = $html.find('.full_header__bg-img').css('background-image').replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
                var tags = fullInfo.eq(1).find('a').map(function() { return $(this).text(); }).get();
                var year = parseInt(fullInfo.eq(0).find('a').text()) || null;
                var playerUrl = $html.find('.tabs_b.visible iframe').attr('src');
                var description = $html.find('.full_content-desc p').text().trim();
                var trailer = $html.find('div#trailer_place iframe').attr('src') || '';
                var rating = parseInt($html.find('.r_kp span, .r_imdb span').text()) || null;
                var actors = fullInfo.eq(4).find('a').map(function() { return $(this).text(); }).get();

                var isSeries = tags.includes('фільм') || tags.includes('мультфільм') || playerUrl.includes('/vod/') ? false : true;

                var media = {
                    title: title,
                    poster: poster,
                    background: banner ? plugin.url + banner : null,
                    year: year,
                    plot: description,
                    genres: tags,
                    rating: rating,
                    actors: actors,
                    trailer: trailer,
                    recommendations: []
                };

                $html.find('.short.related_item').each(function() {
                    var el = $(this);
                    media.recommendations.push({
                        title: el.find('a.short_title').text().trim(),
                        url: el.find('a.short_title').attr('href'),
                        poster: plugin.url + el.find('a.short_img img').attr('data-src')
                    });
                });

                if (isSeries) {
                    media.type = 'series';
                    media.episodes = [];

                    var playerHtml = Lampa.Request.sync(playerUrl);
                    var playerRawJson = $(playerHtml).find('script').html()
                        .match(/file: '([^']+)'/)[1];

                    var seasons = JSON.parse(playerRawJson) || [];
                    seasons.forEach(function(season) {
                        season.folder.forEach(function(episode) {
                            episode.folder.forEach(function(dub) {
                                media.episodes.push({
                                    season: parseInt(season.title.replace(' сезон', '')) || 1,
                                    episode: parseInt(episode.title.replace(' серія', '')) || 1,
                                    title: episode.title,
                                    url: playerUrl,
                                    dub: dub.title,
                                    stream: dub.file,
                                    subtitle: dub.subtitle || null
                                });
                            });
                        });
                    });
                } else {
                    media.type = 'movie';
                    media.stream = playerUrl;
                }

                return media;
            }
        },
        stream: {
            parse: function(url, callback) {
                var playerHtml = Lampa.Request.sync(url);
                var scriptContent = $(playerHtml).find('script').html();
                var m3u8Url = scriptContent.match(/file: "([^"]+)"/)[1];
                var subtitleUrl = scriptContent.match(/subtitle: "([^"]+)"/) ? scriptContent.match(/subtitle: "([^"]+)"/)[1] : null;

                var stream = {
                    url: m3u8Url.replace('https://', 'http://'),
                    referer: 'https://tortuga.wtf/'
                };

                if (subtitleUrl) {
                    stream.subtitle = {
                        lang: subtitleUrl.match(/\[([^\]]+)\]/)[1],
                        url: subtitleUrl.match(/\]([^\[]+)/)[1]
                    };
                }

                callback(stream);
            }
        }
    };

    var Network = Lampa.Reguest;

    function component(object) {
        var network = new Network();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var sources = {
            eneyida: { name: 'Eneyida', url: plugin.url, show: true }
        };
        var filter_sources = ['eneyida'];
        var balanser = 'eneyida';
        var last;
        var initialized;
        var balanser_timer;
        var number_of_requests = 0;
        var number_of_requests_timer;

        function account(url) {
            if (url.indexOf('uid=') == -1) {
                var uid = Lampa.Storage.get('eneyida_unic_id', '');
                if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
            }
            return url;
        }

        this.initialize = function() {
            var _this = this;
            this.loading(true);
            filter.onSearch = function(value) {
                Lampa.Activity.replace({
                    search: value,
                    clarification: true
                });
            };
            filter.onBack = function() {
                _this.start();
            };
            filter.render().find('.selector').on('hover:enter', function() {
                clearInterval(balanser_timer);
            });
            filter.onSelect = function(type, a, b) {
                if (type == 'sort') {
                    _this.changeBalanser(a.source);
                }
            };
            filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
            scroll.body().addClass('torrent-list');
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find('.explorer__files-head'));
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            filter.set('sort', filter_sources.map(function(e) {
                return {
                    title: sources[e].name,
                    source: e,
                    selected: e == balanser,
                    ghost: !sources[e].show
                };
            }));
            filter.chosen('sort', [sources[balanser].name]);
            this.search();
        };

        this.changeBalanser = function(balanser_name) {
            balanser = balanser_name;
            Lampa.Storage.set('eneyida_balanser', balanser_name);
            this.reset();
            this.find();
        };

        this.search = function() {
            this.request(plugin.search.url(object.search));
        };

        this.find = function() {
            this.request(sources[balanser].url);
        };

        this.request = function(url) {
            var _this = this;
            number_of_requests++;
            if (number_of_requests < 10) {
                network["native"](account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
                    dataType: 'text'
                });
                clearTimeout(number_of_requests_timer);
                number_of_requests_timer = setTimeout(function() {
                    number_of_requests = 0;
                }, 4000);
            } else {
                this.empty();
            }
        };

        this.parse = function(html) {
            var _this = this;
            var items = plugin.search.parse(html);
            if (items.length) {
                scroll.clear();
                items.forEach(function(elem) {
                    var item = Lampa.Template.get('lampac_prestige_folder', {
                        title: elem.title,
                        info: '',
                        time: ''
                    });
                    item.on('hover:enter', function() {
                        _this.reset();
                        network["native"](elem.url, function(html) {
                            var media = plugin.media.parse(html);
                            _this.display(media);
                        }, _this.doesNotAnswer.bind(_this));
                    }).on('hover:focus', function(e) {
                        last = e.target;
                        scroll.update($(e.target), true);
                    });
                    scroll.append(item);
                });
                Lampa.Controller.enable('content');
            } else {
                this.doesNotAnswer();
            }
        };

        this.display = function(media) {
            var _this = this;
            scroll.clear();
            if (media.type === 'series') {
                media.episodes.forEach(function(episode) {
                    var item = Lampa.Template.get('lampac_prestige_full', {
                        title: episode.title,
                        info: episode.dub,
                        time: ''
                    });
                    item.on('hover:enter', function() {
                        plugin.stream.parse(episode.url, function(stream) {
                            var play = {
                                title: episode.title,
                                url: stream.url,
                                subtitles: stream.subtitle ? [{ title: stream.subtitle.lang, url: stream.subtitle.url }] : [],
                                headers: { Referer: stream.referer }
                            };
                            Lampa.Player.play(play);
                            Lampa.Player.playlist([play]);
                        });
                    }).on('hover:focus', function(e) {
                        last = e.target;
                        scroll.update($(e.target), true);
                    });
                    scroll.append(item);
                });
            } else {
                var item = Lampa.Template.get('lampac_prestige_full', {
                    title: media.title,
                    info: media.genres.join(', '),
                    time: media.year || ''
                });
                item.on('hover:enter', function() {
                    plugin.stream.parse(media.stream, function(stream) {
                        var play = {
                            title: media.title,
                            url: stream.url,
                            subtitles: stream.subtitle ? [{ title: stream.subtitle.lang, url: stream.subtitle.url }] : [],
                            headers: { Referer: stream.referer }
                        };
                        Lampa.Player.play(play);
                        Lampa.Player.playlist([play]);
                    });
                }).on('hover:focus', function(e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });
                scroll.append(item);
            }
            Lampa.Controller.enable('content');
        };

        this.empty = function() {
            scroll.clear();
            var html = Lampa.Template.get('lampac_does_not_answer', {});
            html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'));
            html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'));
            scroll.append(html);
            this.loading(false);
        };

        this.doesNotAnswer = function() {
            var _this = this;
            scroll.clear();
            var html = Lampa.Template.get('lampac_does_not_answer', {
                balanser: balanser
            });
            html.find('.cancel').on('hover:enter', function() {
                clearInterval(balanser_timer);
            });
            html.find('.change').on('hover:enter', function() {
                clearInterval(balanser_timer);
                filter.render().find('.filter--sort').trigger('hover:enter');
            });
            scroll.append(html);
            this.loading(false);
            var tic = 5;
            balanser_timer = setInterval(function() {
                tic--;
                html.find('.timeout').text(tic);
                if (tic == 0) {
                    clearInterval(balanser_timer);
                    var keys = Lampa.Arrays.getKeys(sources);
                    var indx = keys.indexOf(balanser);
                    var next = keys[indx + 1] || keys[0];
                    _this.changeBalanser(next);
                }
            }, 1000);
        };

        this.reset = function() {
            clearInterval(balanser_timer);
            network.clear();
            scroll.clear();
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        };

        this.loading = function(status) {
            if (status) this.activity.loader(true);
            else {
                this.activity.loader(false);
                this.activity.toggle();
            }
        };

        this.start = function() {
            if (Lampa.Activity.active().activity !== this.activity) return;
            if (!initialized) {
                initialized = true;
                this.initialize();
            }
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function() {
                    Navigator.move('down');
                },
                right: function() {
                    if (Navigator.canmove('right')) Navigator.move('right');
                    else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                back: this.back.bind(this)
            });
            Lampa.Controller.toggle('content');
        };

        this.back = function() {
            Lampa.Activity.backward();
        };

        this.render = function() {
            return files.render();
        };

        this.destroy = function() {
            network.clear();
            files.destroy();
            scroll.destroy();
            clearInterval(balanser_timer);
        };
    }

    function startPlugin() {
        window.eneyida_plugin = true;
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Eneyida',
            description: 'Плагін для перегляду фільмів і серіалів на eneyida.tv',
            component: 'eneyida',
            onContextMenu: function() {
                return {
                    name: Lampa.Lang.translate('lampac_watch'),
                    description: 'Плагін для перегляду фільмів і серіалів на eneyida.tv'
                };
            },
            onContextLauch: function(object) {
                Lampa.Component.add('eneyida', component);
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_online'),
                    component: 'eneyida',
                    search: object.title,
                    movie: object,
                    page: 1
                });
            }
        };

        Lampa.Manifest.plugins = manifest;
        Lampa.Lang.add({
            lampac_watch: {
                ru: 'Смотреть онлайн',
                uk: 'Дивитися онлайн',
                en: 'Watch online'
            },
            lampac_balanser: {
                ru: 'Источник',
                uk: 'Джерело',
                en: 'Source'
            },
            lampac_nolink: {
                ru: 'Не удалось извлечь ссылку',
                uk: 'Неможливо отримати посилання',
                en: 'Failed to fetch link'
            },
            empty_title_two: {
                ru: 'Ничего не найдено',
                uk: 'Нічого не знайдено',
                en: 'Nothing found'
            },
            empty_text: {
                ru: 'Попробуйте изменить запрос или выберите другой источник',
                uk: 'Спробуйте змінити запит або виберіть інше джерело',
                en: 'Try changing the query or select another source'
            },
            lampac_balanser_timeout: {
                ru: 'Источник будет переключен автоматически через <span class="timeout">5</span> секунд.',
                uk: 'Джерело буде автоматично переключено через <span class="timeout">5</span> секунд.',
                en: 'The source will be switched automatically after <span class="timeout">5</span> seconds.'
            }
        });

        Lampa.Template.add('lampac_css', `
            <style>
                /* Додаємо стилі з smotrolet_plugin */
                .online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}
                .online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}
                @media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}
                .online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}
                .online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}
                .online-prestige__img--loaded>img{opacity:1}
                @media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}
                .online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}
                .online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}
                .online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}
                @media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}
                .online-prestige__time{padding-left:2em}
                .online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}
                .online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}
                .online-prestige__quality{padding-left:1em;white-space:nowrap}
                .online-prestige+.online-prestige{margin-top:1.5em}
                .online-empty__title{font-size:1.8em;margin-bottom:.3em}
                .online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}
                .online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}
                .online-empty__buttons>*+*{margin-left:1em}
                .online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}
                .online-empty__button.focus{background:#fff;color:black}
            </style>
        `);
        $('body').append(Lampa.Template.get('lampac_css', {}, true));

        Lampa.Template.add('lampac_does_not_answer', `
            <div class="online-empty">
                <div class="online-empty__title">#{lampac_balanser_dont_work}</div>
                <div class="online-empty__time">#{lampac_balanser_timeout}</div>
                <div class="online-empty__buttons">
                    <div class="online-empty__button selector cancel">#{cancel}</div>
                    <div class="online-empty__button selector change">#{lampac_change_balanser}</div>
                </div>
            </div>
        `);

        var button = `
            <div class="full-start__button selector view--online_eneyida eneyida--button" data-subtitle="${manifest.name} ${manifest.version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16.088 6.412a2.84 2.84 0 0 0-1.347-.955l-1.378-.448a.544.544 0 0 1 0-1.025l1.378-.448A2.84 2.84 0 0 0 16.5 1.774l.011-.034l.448-1.377a.544.544 0 0 1 1.027 0l.447 1.377a2.84 2.84 0 0 0 1.799 1.796l1.377.448l.028.007a.544.544 0 0 1 0 1.025l-1.378.448a2.84 2.84 0 0 0-1.798 1.796l-.448 1.377l-.013.034a.544.544 0 0 1-1.013-.034l-.448-1.377a2.8 2.8 0 0 0-.45-.848m7.695 3.801l-.766-.248a1.58 1.58 0 0 1-.998-.999l-.25-.764a.302.302 0 0 0-.57 0l-.248.764a1.58 1.58 0 0 1-.984.999l-.765.248a.302.302 0 0 0 0 .57l.765.249a1.58 1.58 0 0 1 1 1.002l.248.764a.302.302 0 0 0 .57 0l.249-.764a1.58 1.58 0 0 1 .999-.999l.765-.248a.302.302 0 0 0 0-.57zM12 2c.957 0 1.883.135 2.76.386q-.175.107-.37.173l-1.34.44c-.287.103-.532.28-.713.508a8.5 8.5 0 1 0 8.045 9.909c.22.366.542.633 1.078.633q.185 0 .338-.04C20.868 18.57 16.835 22 12 22C6.477 22 2 17.523 2 12S6.477 2 12 2m-1.144 6.155A1.25 1.25 0 0 0 9 9.248v5.504a1.25 1.25 0 0 0 1.856 1.093l5.757-3.189a.75.75 0 0 0 0-1.312z"/>
                </svg>
                <span>#{title_online}</span>
            </div>
        `;

        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                var btn = $(Lampa.Lang.translate(button));
                btn.on('hover:enter', function() {
                    Lampa.Component.add('eneyida', component);
                    Lampa.Activity.push({
                        url: '',
                        title: Lampa.Lang.translate('title_online'),
                        component: 'eneyida',
                        search: e.data.movie.title,
                        movie: e.data.movie,
                        page: 1
                    });
                });
                e.render.before(btn);
            }
        });

        Lampa.Component.add('eneyida', component);
        Lampa.Plugin.register('eneyida', plugin);
    }

    if (!window.eneyida_plugin) startPlugin();
})();
