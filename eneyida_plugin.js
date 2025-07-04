(function() {
    'use strict';

    // Налаштування API та проксі
    var Defined = {
        apn: 'http://apn.cfhttp.top/' // Проксі для запитів
    };

    // Унікальний ідентифікатор користувача
    var unic_id = Lampa.Storage.get('lampac_unic_id', '');
    if (!unic_id) {
        unic_id = Lampa.Utils.uid(8).toLowerCase();
        Lampa.Storage.set('lampac_unic_id', unic_id);
    }

    // Налаштування мережі
    var Network = Lampa.Reguest;

    // Основний компонент плагіну
    function component(object) {
        var network = new Network();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var sources = {};
        var last;
        var source;
        var balanser;
        var initialized;
        var images = [];
        var filter_sources = {};
        var filter_translate = {
            season: Lampa.Lang.translate('video_serial_season'),
            voice: Lampa.Lang.translate('video_parser_voice'),
            source: Lampa.Lang.translate('settings_rest_source')
        };
        var filter_find = {
            season: [],
            voice: []
        };

        // Додавання параметрів до URL
        function account(url) {
            url = url + '';
            if (url.indexOf('uid=') == -1) {
                var uid = Lampa.Storage.get('lampac_unic_id', '');
                if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
            }
            return url;
        }

        // Ініціалізація компонента
        this.initialize = function() {
            var _this = this;
            this.loading(true);
            filter.onSearch = function(value) {
                clarificationSearchAdd(value);
                Lampa.Activity.replace({
                    search: value,
                    clarification: true,
                    similar: true
                });
            };
            filter.onBack = function() {
                _this.start();
            };
            filter.render().find('.selector').on('hover:enter', function() {});
            filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
            filter.onSelect = function(type, a, b) {
                if (type == 'filter') {
                    if (a.reset) {
                        clarificationSearchDelete();
                        _this.replaceChoice({
                            season: 0,
                            voice: 0,
                            voice_url: '',
                            voice_name: ''
                        });
                        setTimeout(function() {
                            Lampa.Select.close();
                            Lampa.Activity.replace({
                                clarification: 0,
                                similar: 0
                            });
                        }, 10);
                    } else {
                        var url = filter_find[a.stype][b.index].url;
                        var choice = _this.getChoice();
                        if (a.stype == 'voice') {
                            choice.voice_name = filter_find.voice[b.index].title;
                            choice.voice_url = url;
                        }
                        choice[a.stype] = b.index;
                        _this.saveChoice(choice);
                        _this.reset();
                        _this.request(url);
                        setTimeout(Lampa.Select.close, 10);
                    }
                } else if (type == 'sort') {
                    Lampa.Select.close();
                    object.lampac_custom_select = a.source;
                    _this.changeBalanser(a.source);
                }
            };
            if (filter.addButtonBack) filter.addButtonBack();
            filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
            scroll.body().addClass('video-list');
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find('.explorer__files-head'));
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            this.createSource().then(function(json) {
                _this.search();
            })["catch"](function(e) {
                _this.noConnectToServer(e);
            });
        };

        // Збереження пошукового запиту
        function clarificationSearchAdd(value) {
            var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
            var all = Lampa.Storage.get('clarification_search', '{}');
            all[id] = value;
            Lampa.Storage.set('clarification_search', all);
        }

        function clarificationSearchDelete() {
            var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
            var all = Lampa.Storage.get('clarification_search', '{}');
            delete all[id];
            Lampa.Storage.set('clarification_search', all);
        }

        // Створення джерел
        this.createSource = function() {
            return new Promise(function(resolve, reject) {
                // Список джерел для пошуку
                var default_sources = [
                    { name: 'Eneyida', url: 'https://api.eneyida.tv', show: true },
                    { name: 'UAFlix', url: 'https://api.uaflix.net', show: true }
                ];
                default_sources.forEach(function(j) {
                    var name = j.name.toLowerCase();
                    sources[name] = {
                        url: j.url,
                        name: j.name,
                        show: j.show
                    };
                });
                filter_sources = Lampa.Arrays.getKeys(sources);
                balanser = filter_sources[0];
                source = sources[balanser].url;
                resolve(default_sources);
            });
        };

        // Пошук контенту
        this.search = function() {
            this.filter({
                source: filter_sources
            }, this.getChoice());
            this.find();
        };

        // Запит до джерела
        this.find = function() {
            this.request(this.requestParams(source));
        };

        // Параметри запиту
        this.requestParams = function(url) {
            var query = [];
            var card_source = object.movie.source || 'tmdb';
            query.push('id=' + object.movie.id);
            query.push('title=' + encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name));
            query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
            query.push('serial=' + (object.movie.name ? 1 : 0));
            query.push('original_language=' + (object.movie.original_language || ''));
            query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4));
            query.push('source=' + card_source);
            query.push('clarification=' + (object.clarification ? 1 : 0));
            return url + (url.indexOf('?') >= 0 ? '&' : '?') + query.join('&');
        };

        // Обробка відповіді
        this.request = function(url) {
            network["native"](account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
                dataType: 'json'
            });
        };

        // Парсинг даних
        this.parse = function(data) {
            try {
                var items = data.videos || [];
                var voices = data.voices || [];
                if (items.length == 1 && items[0].method == 'link') {
                    filter_find.season = items.map(function(s) {
                        return {
                            title: s.text || s.title,
                            url: s.url
                        };
                    });
                    this.replaceChoice({
                        season: 0
                    });
                    this.request(items[0].url);
                } else {
                    this.activity.loader(false);
                    var videos = items.filter(function(v) {
                        return v.method == 'play' || v.method == 'call';
                    });
                    if (videos.length) {
                        if (voices.length) {
                            filter_find.voice = voices.map(function(b) {
                                return {
                                    title: b.name || b.text,
                                    url: b.url
                                };
                            });
                            var select_voice_url = this.getChoice(balanser).voice_url;
                            var select_voice_name = this.getChoice(balanser).voice_name;
                            var find_voice_url = voices.find(function(v) {
                                return v.url == select_voice_url;
                            });
                            var find_voice_name = voices.find(function(v) {
                                return v.name == select_voice_name || v.text == select_voice_name;
                            });
                            var find_voice_active = voices.find(function(v) {
                                return v.active;
                            });
                            if (find_voice_url && !find_voice_url.active) {
                                this.replaceChoice({
                                    voice: voices.indexOf(find_voice_url),
                                    voice_name: find_voice_url.name || find_voice_url.text
                                });
                                this.request(find_voice_url.url);
                            } else if (find_voice_name && !find_voice_name.active) {
                                this.replaceChoice({
                                    voice: voices.indexOf(find_voice_name),
                                    voice_name: find_voice_name.name || find_voice_name.text
                                });
                                this.request(find_voice_name.url);
                            } else {
                                if (find_voice_active) {
                                    this.replaceChoice({
                                        voice: voices.indexOf(find_voice_active),
                                        voice_name: find_voice_active.name || find_voice_active.text
                                    });
                                }
                                this.display(videos);
                            }
                        } else {
                            this.replaceChoice({
                                voice: 0,
                                voice_url: '',
                                voice_name: ''
                            });
                            this.display(videos);
                        }
                    } else {
                        this.doesNotAnswer();
                    }
                }
            } catch (e) {
                this.doesNotAnswer(e);
            }
        };

        // Отримання URL файлу
        this.getFileUrl = function(file, call) {
            if (file.method == 'play') {
                call(file, {});
            } else {
                Lampa.Loading.start(function() {
                    Lampa.Loading.stop();
                    Lampa.Controller.toggle('content');
                    network.clear();
                });
                network["native"](account(file.url), function(json) {
                    Lampa.Loading.stop();
                    call(json, json);
                }, function() {
                    Lampa.Loading.stop();
                    call(false, {});
                });
            }
        };

        // Форматування для відтворення
        this.toPlayElement = function(file) {
            var play = {
                title: file.title,
                url: file.url,
                quality: file.qualitys || file.quality,
                timeline: file.timeline,
                subtitles: file.subtitles,
                callback: file.mark
            };
            return play;
        };

        // Обробка резервного URL
        this.orUrlReserve = function(data) {
            if (data.url && typeof data.url == 'string' && data.url.indexOf(" or ") !== -1) {
                var urls = data.url.split(" or ");
                data.url = urls[0];
                data.url_reserve = urls[1];
            }
        };

        // Встановлення якості за замовчуванням
        this.setDefaultQuality = function(data) {
            if (Lampa.Arrays.getKeys(data.quality).length) {
                for (var q in data.quality) {
                    if (parseInt(q) == Lampa.Storage.field('video_quality_default')) {
                        data.url = data.quality[q];
                        this.orUrlReserve(data);
                    }
                    if (data.quality[q].indexOf(" or ") !== -1)
                        data.quality[q] = data.quality[q].split(" or ")[0];
                }
            }
        };

        // Відображення результатів
        this.display = function(videos) {
            var _this = this;
            this.draw(videos, {
                onEnter: function(item, html) {
                    _this.getFileUrl(item, function(json, json_call) {
                        if (json && json.url) {
                            var playlist = [];
                            var first = _this.toPlayElement(item);
                            first.url = json.url;
                            first.headers = json_call.headers || json.headers;
                            first.quality = json_call.quality || item.qualitys || item.quality;
                            first.subtitles = json.subtitles;
                            _this.orUrlReserve(first);
                            _this.setDefaultQuality(first);
                            if (item.season) {
                                videos.forEach(function(elem) {
                                    var cell = _this.toPlayElement(elem);
                                    if (elem == item) cell.url = json.url;
                                    else {
                                        if (elem.method == 'call') {
                                            cell.url = function(call) {
                                                _this.getFileUrl(elem, function(stream, stream_json) {
                                                    if (stream.url) {
                                                        cell.url = stream.url;
                                                        cell.quality = stream_json.quality || elem.qualitys || elem.quality;
                                                        cell.subtitles = stream.subtitles;
                                                        _this.orUrlReserve(cell);
                                                        _this.setDefaultQuality(cell);
                                                        elem.mark();
                                                    } else {
                                                        cell.url = '';
                                                        Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                                                    }
                                                    call();
                                                }, function() {
                                                    cell.url = '';
                                                    call();
                                                });
                                            };
                                        } else {
                                            cell.url = elem.url;
                                        }
                                    }
                                    _this.orUrlReserve(cell);
                                    _this.setDefaultQuality(cell);
                                    playlist.push(cell);
                                });
                            } else {
                                playlist.push(first);
                            }
                            if (playlist.length > 1) first.playlist = playlist;
                            if (first.url) {
                                Lampa.Player.play(first);
                                Lampa.Player.playlist(playlist);
                                item.mark();
                                _this.updateBalanser(balanser);
                            } else {
                                Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                            }
                        } else {
                            Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                        }
                    }, true);
                },
                onContextMenu: function(item, html, data, call) {
                    _this.getFileUrl(item, function(stream) {
                        call({
                            file: stream.url,
                            quality: item.qualitys || item.quality
                        });
                    }, true);
                }
            });
            this.filter({
                season: filter_find.season.map(function(s) {
                    return s.title;
                }),
                voice: filter_find.voice.map(function(b) {
                    return b.title;
                })
            }, this.getChoice());
        };

        // Зміна балансера
        this.changeBalanser = function(balanser_name) {
            this.updateBalanser(balanser_name);
            Lampa.Storage.set('online_balanser', balanser_name);
            var to = this.getChoice(balanser_name);
            var from = this.getChoice();
            if (from.voice_name) to.voice_name = from.voice_name;
            this.saveChoice(to, balanser_name);
            Lampa.Activity.replace();
        };

        // Оновлення балансера
        this.updateBalanser = function(balanser_name) {
            var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
            last_select_balanser[object.movie.id] = balanser_name;
            Lampa.Storage.set('online_last_balanser', last_select_balanser);
        };

        // Отримання вибору
        this.getChoice = function(for_balanser) {
            var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
            var save = data[object.movie.id] || {};
            Lampa.Arrays.extend(save, {
                season: 0,
                voice: 0,
                voice_name: '',
                voice_id: 0,
                episodes_view: {},
                movie_view: ''
            });
            return save;
        };

        // Збереження вибору
        this.saveChoice = function(choice, for_balanser) {
            var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
            data[object.movie.id] = choice;
            Lampa.Storage.set('online_choice_' + (for_balanser || balanser), data);
            this.updateBalanser(for_balanser || balanser);
        };

        // Заміна вибору
        this.replaceChoice = function(choice, for_balanser) {
            var to = this.getChoice(for_balanser);
            Lampa.Arrays.extend(to, choice, true);
            this.saveChoice(to, for_balanser);
        };

        // Очищення зображень
        this.clearImages = function() {
            images.forEach(function(img) {
                img.onerror = function() {};
                img.onload = function() {};
                img.src = '';
            });
            images = [];
        };

        // Скидання
        this.reset = function() {
            last = false;
            network.clear();
            this.clearImages();
            scroll.render().find('.empty').remove();
            scroll.clear();
            scroll.reset();
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        };

        // Завантаження
        this.loading = function(status) {
            if (status) this.activity.loader(true);
            else {
                this.activity.loader(false);
                this.activity.toggle();
            }
        };

        // Побудова фільтру
        this.filter = function(filter_items, choice) {
            var _this = this;
            var select = [];
            var add = function(type, title) {
                var need = _this.getChoice();
                var items = filter_items[type];
                var subitems = [];
                var value = need[type];
                items.forEach(function(name, i) {
                    subitems.push({
                        title: name,
                        selected: value == i,
                        index: i
                    });
                });
                select.push({
                    title: title,
                    subtitle: items[value],
                    items: subitems,
                    stype: type
                });
            };
            filter_items.source = filter_sources;
            select.push({
                title: Lampa.Lang.translate('video_parser_reset'),
                reset: true
            });
            this.saveChoice(choice);
            if (filter_items.voice && filter_items.voice.length) add('voice', Lampa.Lang.translate('video_parser_voice'));
            if (filter_items.season && filter_items.season.length) add('season', Lampa.Lang.translate('video_serial_season'));
            filter.set('filter', select);
            filter.set('sort', filter_sources.map(function(e) {
                return {
                    title: sources[e].name,
                    source: e,
                    selected: e == balanser,
                    ghost: !sources[e].show
                };
            }));
            this.selected(filter_items);
        };

        // Відображення вибраного у фільтрі
        this.selected = function(filter_items) {
            var need = this.getChoice(),
                select = [];
            for (var i in need) {
                if (filter_items[i] && filter_items[i].length) {
                    if (i == 'voice') {
                        select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]);
                    } else if (i !== 'source') {
                        if (filter_items.season.length >= 1) {
                            select.push(filter_translate.season + ': ' + filter_items[i][need[i]]);
                        }
                    }
                }
            }
            filter.chosen('filter', select);
            filter.chosen('sort', [sources[balanser].name]);
        };

        // Помилка відповіді
        this.doesNotAnswer = function(er) {
            var html = Lampa.Template.get('lampac_does_not_answer', {
                balanser: balanser
            });
            scroll.clear();
            scroll.append(html);
            this.loading(false);
        };

        // Помилка підключення
        this.noConnectToServer = function(er) {
            var html = Lampa.Template.get('lampac_does_not_answer', {});
            html.find('.online-empty__buttons').remove();
            html.find('.online-empty__title').text(Lampa.Lang.translate('title_error'));
            html.find('.online-empty__time').text(Lampa.Lang.translate('lampac_does_not_answer_text').replace('{balanser}', sources[balanser].name));
            scroll.clear();
            scroll.append(html);
            this.loading(false);
        };

        // Початок навігації
        this.start = function() {
            if (Lampa.Activity.active().activity !== this.activity) return;
            if (!initialized) {
                initialized = true;
                this.initialize();
            }
            Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function() {
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else Lampa.Controller.toggle('head');
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

        this.render = function() {
            return files.render();
        };

        this.back = function() {
            Lampa.Activity.backward();
        };

        this.pause = function() {};
        this.stop = function() {};
        this.destroy = function() {
            network.clear();
            this.clearImages();
            files.destroy();
            scroll.destroy();
        };
    }

    // Додавання джерела пошуку
    function addSourceSearch(spiderName, spiderUri) {
        var network = new Network();

        var source = {
            title: spiderName,
            search: function(params, oncomplite) {
                network.silent(account(spiderUri + '/search?query=' + encodeURIComponent(params.query)), function(json) {
                    var keys = Lampa.Arrays.getKeys(json);
                    if (keys.length) {
                        var status = new Lampa.Status(keys.length);
                        status.onComplite = function(result) {
                            var rows = [];
                            keys.forEach(function(name) {
                                var line = result[name];
                                if (line && line.data) {
                                    var cards = line.data.map(function(item) {
                                        item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
                                        item.release_date = item.year || '0000';
                                        item.balanser = spiderUri;
                                        return item;
                                    });
                                    rows.push({
                                        title: name,
                                        results: cards
                                    });
                                }
                            });
                            oncomplite(rows);
                        };
                        keys.forEach(function(name) {
                            network.silent(account(json[name]), function(data) {
                                status.append(name, data);
                            }, function() {
                                status.error();
                            });
                        });
                    } else {
                        oncomplite([]);
                    }
                }, function() {
                    oncomplite([]);
                });
            },
            onCancel: function() {
                network.clear();
            },
            params: {
                lazy: true,
                align_left: true,
                card_events: {
                    onMenu: function() {}
                }
            },
            onMore: function(params, close) {
                close();
            },
            onSelect: function(params, close) {
                close();
                Lampa.Activity.push({
                    url: params.element.url,
                    title: 'Eneyida - ' + params.element.title,
                    component: 'lampac',
                    movie: params.element,
                    page: 1,
                    search: params.element.title,
                    clarification: true,
                    balanser: params.element.balanser,
                    noinfo: true
                });
            }
        };

        Lampa.Search.addSource(source);
    }

    // Запуск плагіну
    function startPlugin() {
        window.lampac_plugin = true;
        var manifst = {
            type: 'video',
            version: '1.4.9',
            name: 'Eneyida',
            description: 'Плагін для пошуку та перегляду фільмів і серіалів через Eneyida.tv та UAFlix.net',
            component: 'lampac',
            onContextMenu: function(object) {
                return {
                    name: Lampa.Lang.translate('lampac_watch'),
                    description: ''
                };
            },
            onContextLauch: function(object) {
                resetTemplates();
                Lampa.Component.add('lampac', component);
                var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
                var all = Lampa.Storage.get('clarification_search', '{}');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_online'),
                    component: 'lampac',
                    search: all[id] ? all[id] : object.title,
                    search_one: object.title,
                    search_two: object.original_title,
                    movie: object,
                    page: 1,
                    clarification: all[id] ? true : false
                });
            }
        };

        Lampa.Manifest.plugins = manifst;
        Lampa.Lang.add({
            lampac_watch: {
                uk: 'Дивитися онлайн',
                en: 'Watch online'
            },
            lampac_video: {
                uk: 'Відео',
                en: 'Video'
            },
            lampac_no_watch_history: {
                uk: 'Немає історії перегляду',
                en: 'No browsing history'
            },
            lampac_nolink: {
                uk: 'Неможливо отримати посилання',
                en: 'Failed to fetch link'
            },
            lampac_balanser: {
                uk: 'Джерело',
                en: 'Source'
            },
            helper_online_file: {
                uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
                en: 'Hold the "OK" key to bring up the context menu'
            },
            title_online: {
                uk: 'Онлайн',
                en: 'Online'
            },
            lampac_does_not_answer_text: {
                uk: 'Пошук на ({balanser}) не дав результатів',
                en: 'Search on ({balanser}) did not return any results'
            },
            video_parser_voice: {
                uk: 'Озвучка',
                en: 'Voice'
            },
            video_serial_season: {
                uk: 'Сезон',
                en: 'Season'
            },
            video_parser_reset: {
                uk: 'Скинути',
                en: 'Reset'
            }
        });

        // CSS шаблон
        Lampa.Template.add('lampac_css', `
            <style>
            @charset 'UTF-8';
            .online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}
            .online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}
            @media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}
            .online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}
            .online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}
            .online-prestige__img--loaded>img{opacity:1}
            @media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}
            .online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}
            .online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}
            .online-prestige__timeline{margin:.8em 0}
            .online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}
            @media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}
            .online-prestige__time{padding-left:2em}
            .online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}
            .online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}
            .online-prestige__quality{padding-left:1em;white-space:nowrap}
            .online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}
            .online-prestige+.online-prestige{margin-top:1.5em}
            .online-empty{line-height:1.4}
            .online-empty__title{font-size:1.8em;margin-bottom:.3em}
            .online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}
            .online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}
            .online-empty__buttons>*+*{margin-left:1em}
            .online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}
            .online-empty__button.focus{background:#fff;color:black}
            </style>
        `);
        $('body').append(Lampa.Template.get('lampac_css', {}, true));

        // Шаблони
        function resetTemplates() {
            Lampa.Template.add('lampac_prestige_full', `
                <div class="online-prestige online-prestige--full selector">
                    <div class="online-prestige__img">
                        <img alt="">
                        <div class="online-prestige__loader"></div>
                    </div>
                    <div class="online-prestige__body">
                        <div class="online-prestige__head">
                            <div class="online-prestige__title">{title}</div>
                            <div class="online-prestige__time">{time}</div>
                        </div>
                        <div class="online-prestige__timeline"></div>
                        <div class="online-prestige__footer">
                            <div class="online-prestige__info">{info}</div>
                            <div class="online-prestige__quality">{quality}</div>
                        </div>
                    </div>
                </div>`);
            Lampa.Template.add('lampac_content_loading', `
                <div class="online-empty">
                    <div class="broadcast__scan"><div></div></div>
                    <div class="online-empty__templates">
                        <div class="online-empty-template selector">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                        <div class="online-empty-template">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                        <div class="online-empty-template">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                    </div>
                </div>`);
            Lampa.Template.add('lampac_does_not_answer', `
                <div class="online-empty">
                    <div class="online-empty__title">#{lampac_balanser_dont_work}</div>
                    <div class="online-empty__time">#{lampac_balanser_timeout}</div>
                    <div class="online-empty__buttons">
                        <div class="online-empty__button selector cancel">#{cancel}</div>
                        <div class="online-empty__button selector change">#{lampac_change_balanser}</div>
                    </div>
                    <div class="online-empty__templates">
                        <div class="online-empty-template">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                        <div class="online-empty-template">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                        <div class="online-empty-template">
                            <div class="online-empty-template__ico"></div>
                            <div class="online-empty-template__body"></div>
                        </div>
                    </div>
                </div>`);
        }

        var button = `
            <div class="full-start__button selector view--online lampac--button" data-subtitle="${manifst.name} v${manifst.version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 392.697 392.697">
                    <path d="M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18C19.784,81.593,20.584,82.847,21.837,83.419z" fill="currentColor"></path>
                    <path d="M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945V180.445C187.735,179.076,186.936,177.831,185.689,177.261z" fill="currentColor"></path>
                    <path d="M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z" fill="currentColor"></path>
                    <path d="M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092C372.122,82.847,372.923,81.593,372.915,80.216z" fill="currentColor"></path>
                </svg>
                <span>#{title_online}</span>
            </div>`;

        Lampa.Component.add('lampac', component);
        resetTemplates();

        function addButton(e) {
            if (e.render.find('.lampac--button').length) return;
            var btn = $(Lampa.Lang.translate(button));
            btn.on('hover:enter', function() {
                resetTemplates();
                Lampa.Component.add('lampac', component);
                var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
                var all = Lampa.Storage.get('clarification_search', '{}');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_online'),
                    component: 'lampac',
                    search: all[id] ? all[id] : e.movie.title,
                    search_one: e.movie.title,
                    search_two: e.movie.original_title,
                    movie: e.movie,
                    page: 1,
                    clarification: all[id] ? true : false
                });
            });
            e.render.after(btn);
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                addButton({
                    render: e.object.activity.render().find('.view--torrent'),
                    movie: e.data.movie
                });
            }
        });

        try {
            if (Lampa.Activity.active().component == 'full') {
                addButton({
                    render: Lampa.Activity.active().activity.render().find('.view--torrent'),
                    movie: Lampa.Activity.active().card
                });
            }
        } catch (e) {}

        // Додавання джерел пошуку
        addSourceSearch('Eneyida', 'https://api.eneyida.tv');
        addSourceSearch('UAFlix', 'https://api.uaflix.net');
    }

    if (!window.lampac_plugin) startPlugin();
})();
