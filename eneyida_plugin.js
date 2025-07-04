(function() {
    'use strict';

    // Налаштування проксі
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

    // Змінна для відстеження реєстрації компонента
    var componentRegistered = false;

    // Основний компонент плагіну
    function component(object) {
        var network = new Network();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var sources = {
            eneyida: { url: 'https://eneyida.tv/search/', name: 'Eneyida', show: true },
            uaflix: { url: 'https://uaflix.net/search/', name: 'UAFlix', show: true }
        };
        var filter_sources = ['eneyida', 'uaflix'];
        var balanser = filter_sources[0];
        var source = sources[balanser].url;
        var images = [];
        var filter_find = { season: [], voice: [] };
        var filter_translate = {
            season: Lampa.Lang.translate('video_serial_season'),
            voice: Lampa.Lang.translate('video_parser_voice')
        };
        var initialized = false;

        // Додавання параметрів до URL
        function account(url) {
            url = url + '';
            if (url.indexOf('uid=') === -1) {
                url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(unic_id));
            }
            return url;
        }

        // Ініціалізація компонента
        this.initialize = function() {
            if (initialized) {
                console.log('Eneyida Plugin: Already initialized, skipping');
                return;
            }
            initialized = true;
            var _this = this;
            this.loading(true);
            filter.onSearch = function(value) {
                var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
                var all = Lampa.Storage.get('clarification_search', '{}');
                all[id] = value;
                Lampa.Storage.set('clarification_search', all);
                var current_activity = Lampa.Activity.active();
                if (current_activity.component === 'lampac' && current_activity.search === value) {
                    console.log('Eneyida Plugin: Preventing recursive Activity.replace', { search: value });
                    return;
                }
                Lampa.Activity.replace({
                    search: value,
                    clarification: true,
                    similar: true
                });
            };
            filter.onBack = function() { _this.start(); };
            filter.onSelect = function(type, a, b) {
                if (type === 'filter') {
                    if (a.reset) {
                        var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
                        var all = Lampa.Storage.get('clarification_search', '{}');
                        delete all[id];
                        Lampa.Storage.set('clarification_search', all);
                        _this.replaceChoice({ season: 0, voice: 0, voice_url: '', voice_name: '' });
                        setTimeout(function() {
                            Lampa.Select.close();
                            Lampa.Activity.replace({ clarification: 0, similar: 0 });
                        }, 10);
                    } else {
                        var url = filter_find[a.stype][b.index].url;
                        var choice = _this.getChoice();
                        if (a.stype === 'voice') {
                            choice.voice_name = filter_find.voice[b.index].title;
                            choice.voice_url = url;
                        }
                        choice[a.stype] = b.index;
                        _this.saveChoice(choice);
                        _this.reset();
                        _this.request(url);
                        setTimeout(Lampa.Select.close, 10);
                    }
                } else if (type === 'sort') {
                    Lampa.Select.close();
                    _this.changeBalanser(a.source);
                }
            };
            filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
            scroll.body().addClass('video-list');
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find('.explorer__files-head'));
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            this.search();
        };

        // Пошук контенту
        this.search = function() {
            this.filter({ source: filter_sources }, this.getChoice());
            this.request(this.requestParams(source));
        };

        // Параметри запиту
        this.requestParams = function(url) {
            var query = encodeURIComponent(object.clarification ? object.search : object.movie.title || object.movie.name || '');
            return url + query;
        };

        // Обробка відповіді
        this.request = function(url) {
            network["native"](account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, { dataType: 'text' });
        };

        // Парсинг HTML-даних
        this.parse = function(str) {
            try {
                var html = $('<div>' + str + '</div>');
                var items = [];
                var voices = [];
                html.find('.movie-item, .video-item, .movie-card, .content-item').each(function() {
                    var item = $(this);
                    var title = item.find('.title, .movie-title, .content-title, h2, h3').first().text().trim();
                    var url = item.find('a').attr('href') || '';
                    var quality = item.find('.quality, .resolution, .badge').text().trim() || 'HD';
                    var season = item.find('.season').text().trim() || '';
                    var episode = item.find('.episode').text().trim() || '';
                    var voice = item.find('.voice, .audio, .lang').text().trim() || '';
                    if (!url.startsWith('http')) {
                        url = sources[balanser].url.split('/search/')[0] + url;
                    }
                    if (url && title) {
                        var data = {
                            title: title,
                            url: url,
                            quality: quality,
                            method: 'play',
                            season: season ? parseInt(season) : null,
                            episode: episode ? parseInt(episode) : null
                        };
                        if (voice) {
                            voices.push({ title: voice, url: url, active: item.hasClass('active') });
                        }
                        items.push(data);
                    }
                });
                if (items.length) {
                    if (voices.length) {
                        filter_find.voice = voices;
                        var choice = this.getChoice();
                        var voice_index = voices.findIndex(function(v) { return v.url === choice.voice_url || v.title === choice.voice_name; });
                        if (voice_index >= 0 && !voices[voice_index].active) {
                            this.replaceChoice({ voice: voice_index, voice_name: voices[voice_index].title });
                            this.request(voices[voice_index].url);
                        } else {
                            this.display(items);
                        }
                    } else {
                        this.replaceChoice({ voice: 0, voice_url: '', voice_name: '' });
                        this.display(items);
                    }
                } else {
                    this.doesNotAnswer();
                }
            } catch (e) {
                this.doesNotAnswer(e);
            }
        };

        // Відображення контенту
        this.draw = function(items, params) {
            var _this = this;
            scroll.clear();
            items.forEach(function(item) {
                var html = $(Lampa.Template.get('lampac_prestige_full', {
                    title: item.title,
                    time: item.season ? 'Сезон ' + item.season + (item.episode ? ', Епізод ' + item.episode : '') : item.quality,
                    info: item.season ? item.title : '',
                    quality: item.quality
                }));
                var img = html.find('img')[0];
                if (img) {
                    images.push(img);
                    img.onerror = function() { img.src = './img/img_broken.svg'; };
                    img.src = object.movie.poster_path || './img/img_broken.svg';
                }
                html.on('hover:enter', function() { params.onEnter(item, html); });
                scroll.append(html);
            });
            this.loading(false);
        };

        // Відображення результатів
        this.display = function(videos) {
            var _this = this;
            this.draw(videos, {
                onEnter: function(item, html) {
                    _this.getFileUrl(item, function(json) {
                        if (json && json.url) {
                            var play = {
                                title: item.title,
                                url: json.url,
                                quality: json.quality || item.quality,
                                subtitles: json.subtitles || []
                            };
                            Lampa.Player.play(play);
                            Lampa.Player.playlist([play]);
                        } else {
                            Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
                        }
                    });
                }
            });
            this.filter({
                season: filter_find.season.map(function(s) { return s.title; }),
                voice: filter_find.voice.map(function(b) { return b.title; })
            }, this.getChoice());
        };

        // Отримання URL файлу
        this.getFileUrl = function(file, call) {
            network["native"](account(file.url), function(str) {
                var html = $('<div>' + str + '</div>');
                var video_url = html.find('video source, iframe').attr('src') || '';
                var subtitles = html.find('track[kind="subtitles"]').map(function() {
                    return { label: $(this).attr('label') || 'Subtitles', url: $(this).attr('src') };
                }).get();
                var quality = html.find('.quality, .resolution, .badge').text().trim() || file.quality;
                if (!video_url.startsWith('http')) {
                    video_url = sources[balanser].url.split('/search/')[0] + video_url;
                }
                call({ url: video_url, quality: quality, subtitles: subtitles });
            }, function() {
                call(false);
            }, false, { dataType: 'text' });
        };

        // Зміна балансера
        this.changeBalanser = function(balanser_name) {
            balanser = balanser_name;
            source = sources[balanser].url;
            Lampa.Storage.set('online_balanser', balanser_name);
            this.saveChoice(this.getChoice(), balanser_name);
            Lampa.Activity.replace();
        };

        // Отримання вибору
        this.getChoice = function(for_balanser) {
            var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
            var save = data[object.movie.id] || {};
            Lampa.Arrays.extend(save, { season: 0, voice: 0, voice_name: '', voice_url: '' });
            return save;
        };

        // Збереження вибору
        this.saveChoice = function(choice, for_balanser) {
            var data = Lampa.Storage.cache('online_choice_' + (for_balanser || balanser), 3000, {});
            data[object.movie.id] = choice;
            Lampa.Storage.set('online_choice_' + (for_balanser || balanser), data);
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
            network.clear();
            this.clearImages();
            scroll.clear();
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        };

        // Завантаження
        this.loading = function(status) {
            if (status) {
                this.activity.loader(true);
            } else {
                this.activity.loader(false);
                this.activity.toggle();
            }
        };

        // Побудова фільтру
        this.filter = function(filter_items, choice) {
            var select = [];
            var add = function(type, title) {
                var items = filter_items[type];
                var subitems = [];
                var value = choice[type] || 0;
                items.forEach(function(name, i) {
                    subitems.push({ title: name, selected: value === i, index: i });
                });
                select.push({ title: title, subtitle: items[value], items: subitems, stype: type });
            };
            filter_items.source = filter_sources;
            select.push({ title: Lampa.Lang.translate('video_parser_reset'), reset: true });
            if (filter_items.voice && filter_items.voice.length) {
                add('voice', Lampa.Lang.translate('video_parser_voice'));
            }
            if (filter_items.season && filter_items.season.length) {
                add('season', Lampa.Lang.translate('video_serial_season'));
            }
            filter.set('filter', select);
            filter.set('sort', filter_sources.map(function(e) {
                return { title: sources[e].name, source: e, selected: e === balanser };
            }));
        };

        // Помилка відповіді
        this.doesNotAnswer = function(er) {
            var html = Lampa.Template.get('lampac_does_not_answer', { balanser: sources[balanser].name });
            scroll.clear();
            scroll.append(html);
            this.loading(false);
        };

        // Початок навігації
        this.start = function() {
            if (Lampa.Activity.active().activity !== this.activity) {
                return;
            }
            this.initialize();
            Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                },
                up: function() { Navigator.move('up'); },
                down: function() { Navigator.move('down'); },
                right: function() { filter.show(Lampa.Lang.translate('title_filter'), 'filter'); },
                left: function() { Lampa.Controller.toggle('menu'); },
                back: this.back.bind(this)
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function() { return files.render(); };
        this.back = function() { Lampa.Activity.backward(); };
        this.destroy = function() {
            network.clear();
            this.clearImages();
            files.destroy();
            scroll.destroy();
            initialized = false;
        };
    }

    // Запуск плагіну
    function startPlugin() {
        window.lampac_plugin = true;
        var manifst = {
            type: 'video',
            version: '1.4.16', // Оновлено версію
            name: 'Eneyida',
            description: 'Плагін для пошуку та перегляду фільмів і серіалів',
            component: 'lampac'
        };

        Lampa.Manifest.plugins = manifst;
        Lampa.Lang.add({
            lampac_nolink: { uk: 'Неможливо отримати посилання', en: 'Failed to fetch link' },
            lampac_balanser: { uk: 'Джерело', en: 'Source' },
            lampac_balanser_dont_work: { uk: 'Джерело не працює', en: 'Source is not working' },
            lampac_change_balanser: { uk: 'Змінити джерело', en: 'Change source' },
            title_online: { uk: 'Онлайн', en: 'Online' },
            title_error: { uk: 'Помилка', en: 'Error' },
            lampac_does_not_answer_text: { uk: 'Пошук на ({balanser}) не дав результатів', en: 'Search on ({balanser}) did not return any results' },
            video_parser_voice: { uk: 'Озвучка', en: 'Voice' },
            video_serial_season: { uk: 'Сезон', en: 'Season' },
            video_parser_reset: { uk: 'Скинути', en: 'Reset' },
            cancel: { uk: 'Скасувати', en: 'Cancel' }
        });

        // CSS шаблон
        Lampa.Template.add('lampac_css', [
            '<style>',
            '.online-prestige{position:relative;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:flex}',
            '.online-prestige__body{padding:1.2em;line-height:1.3;flex-grow:1}',
            '@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}',
            '.online-prestige__img{position:relative;width:13em;flex-shrink:0;min-height:8.2em}',
            '.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:.3em;opacity:0;transition:opacity .3s}',
            '.online-prestige__img--loaded>img{opacity:1}',
            '@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}',
            '.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;background-size:contain}',
            '.online-prestige__head,.online-prestige__footer{display:flex;justify-content:space-between;align-items:center}',
            '.online-prestige__title{font-size:1.7em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}',
            '@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}',
            '.online-prestige__time{padding-left:2em}',
            '.online-prestige__info{display:flex;align-items:center}',
            '.online-prestige__quality{padding-left:1em;white-space:nowrap}',
            '.online-prestige.focus::after{content:\'\';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;border-radius:.7em;border:solid .3em #fff;z-index:-1}',
            '.online-prestige+.online-prestige{margin-top:1.5em}',
            '.online-empty{line-height:1.4}',
            '.online-empty__title{font-size:1.8em;margin-bottom:.3em}',
            '.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}',
            '.online-empty__buttons{display:flex}',
            '.online-empty__buttons>*+*{margin-left:1em}',
            '.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;border-radius:.2em;margin-bottom:2.4em}',
            '.online-empty__button.focus{background:#fff;color:black}',
            '</style>'
        ].join(''));
        $('body').append(Lampa.Template.get('lampac_css', {}, true));

        // Шаблони
        function resetTemplates() {
            Lampa.Template.add('lampac_prestige_full', [
                '<div class="online-prestige selector">',
                '<div class="online-prestige__img">',
                '<img alt="">',
                '<div class="online-prestige__loader"></div>',
                '</div>',
                '<div class="online-prestige__body">',
                '<div class="online-prestige__head">',
                '<div class="online-prestige__title">{title}</div>',
                '<div class="online-prestige__time">{time}</div>',
                '</div>',
                '<div class="online-prestige__footer">',
                '<div class="online-prestige__info">{info}</div>',
                '<div class="online-prestige__quality">{quality}</div>',
                '</div>',
                '</div>',
                '</div>'
            ].join(''));
            Lampa.Template.add('lampac_content_loading', [
                '<div class="online-empty">',
                '<div class="broadcast__scan"><div></div></div>',
                '</div>'
            ].join(''));
            Lampa.Template.add('lampac_does_not_answer', [
                '<div class="online-empty">',
                '<div class="online-empty__title">#{lampac_balanser_dont_work}</div>',
                '<div class="online-empty__time">#{lampac_does_not_answer_text}</div>',
                '<div class="online-empty__buttons">',
                '<div class="online-empty__button selector cancel">#{cancel}</div>',
                '<div class="online-empty__button selector change">#{lampac_change_balanser}</div>',
                '</div>',
                '</div>'
            ].join(''));
        }

        var button = [
            '<div class="full-start__button selector view--online lampac--button" data-subtitle="' + manifst.name + ' v' + manifst.version + '">',
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 392.697 392.697">',
            '<path d="M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18C19.784,81.593,20.584,82.847,21.837,83.419z" fill="currentColor"></path>',
            '<path d="M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945V180.445C187.735,179.076,186.936,177.831,185.689,177.261z" fill="currentColor"></path>',
            '<path d="M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z" fill="currentColor"></path>',
            '<path d="M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092C372.122,82.847,372.923,81.593,372.915,80.216z" fill="currentColor"></path>',
            '</svg>',
            '<span>#{title_online}</span>',
            '</div>'
        ].join('');

        // Реєстрація компонента один раз
        if (!componentRegistered) {
            Lampa.Component.add('lampac', component);
            componentRegistered = true;
            console.log('Eneyida Plugin: Component lampac registered');
        }
        resetTemplates();

        // Додавання кнопки
        function addButton(render, movie) {
            if (!render || !movie || render.find('.lampac--button').length) {
                console.log('Eneyida Plugin: Skipping addButton', {
                    renderExists: !!render,
                    movieExists: !!movie,
                    buttonExists: render ? !!render.find('.lampac--button').length : false
                });
                return false;
            }
            movie.id = movie.id || Lampa.Utils.hash(movie.number_of_seasons ? movie.original_name : movie.original_title || movie.title || '');
            movie.title = movie.title || movie.name || '';
            movie.original_title = movie.original_title || movie.original_name || movie.title || '';
            movie.poster_path = movie.poster_path || '';
            movie.number_of_seasons = movie.number_of_seasons || 0;
            if (!movie.id || !movie.title) {
                console.log('Eneyida Plugin: Invalid movie data', movie);
                return false;
            }
            var btn = $(Lampa.Lang.translate(button));
            btn.on('hover:enter', function() {
                resetTemplates();
                console.log('Eneyida Plugin: Button clicked, pushing activity', movie);
                try {
                    Lampa.Activity.push({
                        url: '',
                        title: Lampa.Lang.translate('title_online'),
                        component: 'lampac',
                        movie: movie,
                        page: 1
                    });
                } catch (e) {
                    console.error('Eneyida Plugin: Failed to push activity', e);
                    Lampa.Noty.show(Lampa.Lang.translate('title_error'));
                }
            });
            render.eq(0).append(btn);
            console.log('Eneyida Plugin: Button added', {
                selector: render[0] ? render[0].className : 'none',
                buttonCount: render.find('.lampac--button').length
            });
            return true;
        }

        // Логування батьківських елементів
        function logParentSelectors() {
            var card = document.querySelector('.card, .full-start, .selector');
            if (card) {
                var parents = [];
                var current = card;
                while (current && current !== document) {
                    parents.push({
                        tag: current.tagName,
                        class: current.className,
                        id: current.id
                    });
                    current = current.parentElement;
                }
                console.log('Eneyida Plugin: Parent selectors for card', parents);
            } else {
                console.log('Eneyida Plugin: No card element found');
            }
        }

        // Ініціалізація кнопки
        var buttonAdded = false;
        var startTime = Date.now();
        var initInterval = setInterval(function() {
            if (buttonAdded || Date.now() - startTime > 30000) {
                console.log('Eneyida Plugin: Stopping initInterval', {
                    buttonAdded: buttonAdded,
                    timeElapsed: Date.now() - startTime
                });
                clearInterval(initInterval);
                if (!buttonAdded) {
                    logParentSelectors();
                }
                return;
            }
            try {
                if (!Lampa || !Lampa.Activity || typeof Lampa.Activity.active !== 'function') {
                    console.log('Eneyida Plugin: Lampa not ready', {
                        lampaExists: !!Lampa,
                        activityExists: !!Lampa && !!Lampa.Activity,
                        activeIsFunction: !!Lampa && !!Lampa.Activity && typeof Lampa.Activity.active === 'function'
                    });
                    return;
                }
                var active = Lampa.Activity.active();
                if (!active || !active.activity || active.component !== 'full') {
                    console.log('Eneyida Plugin: No active full activity', {
                        active: !!active,
                        component: active ? active.component : 'none'
                    });
                    return;
                }
                var render = active.activity.render().find('.full-start__buttons');
                var movie = active.card || (active.data && active.data.movie) || {};
                if (render && render.length && movie && Object.keys(movie).length) {
                    console.log('Eneyida Plugin: Attempting to add button', {
                        render: render[0] ? render[0].className : 'none',
                        movieKeys: Object.keys(movie)
                    });
                    if (addButton(render, movie)) {
                        buttonAdded = true;
                        clearInterval(initInterval);
                    }
                } else {
                    console.log('Eneyida Plugin: Render or movie not available', {
                        renderExists: !!render,
                        renderLength: render ? render.length : 0,
                        movieExists: !!movie,
                        movieKeys: movie ? Object.keys(movie) : []
                    });
                    logParentSelectors();
                }
            } catch (e) {
                console.error('Eneyida Plugin: Error in initButton', e);
            }
        }, 1000);

        // Слухач подій
        function setupListener() {
            if (!Lampa.Listener) {
                console.log('Eneyida Plugin: Lampa.Listener not available, retrying...');
                setTimeout(setupListener, 1000);
                return;
            }
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'start' || e.type === 'complite' || e.type === 'ready') {
                    if (buttonAdded) {
                        console.log('Eneyida Plugin: Button already added, skipping listener');
                        return;
                    }
                    try {
                        var render = e.object && e.object.activity ?
                            e.object.activity.render().find('.full-start__buttons') :
                            null;
                        var movie = e.data && e.data.movie ? e.data.movie : (e.object && e.object.card ? e.object.card : null);
                        if (render && render.length && movie && Object.keys(movie).length) {
                            console.log('Eneyida Plugin: Listener triggered', {
                                event: e.type,
                                render: render[0] ? render[0].className : 'none',
                                movieKeys: Object.keys(movie)
                            });
                            if (addButton(render, movie)) {
                                buttonAdded = true;
                                clearInterval(initInterval);
                            }
                        } else {
                            console.log('Eneyida Plugin: Listener skipped', {
                                event: e.type,
                                renderExists: !!render,
                                renderLength: render ? render.length : 0,
                                movieExists: !!movie,
                                movieKeys: movie ? Object.keys(movie) : []
                            });
                            logParentSelectors();
                        }
                    } catch (err) {
                        console.error('Eneyida Plugin: Error in listener', err);
                    }
                }
            });
        }

        setTimeout(setupListener, 100);
    }

    if (!window.lampac_plugin) {
        startPlugin();
    }
})();
