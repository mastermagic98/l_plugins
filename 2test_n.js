(function () {
    'use strict';

    // Глобальный кэш для изображений
    var imageCache = {};
    var backgroundCache = {};
    var MAX_CACHE_SIZE = 100;
    var background_last_path = '';

    function addToCache(cache, key, value) {
        if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
            delete cache[Object.keys(cache)[0]];
        }
        cache[key] = value;
    }

    // Основная функция для создания интерфейса информации о контенте
    function create() {
        var html;
        var timer;
        var network = new Lampa.Reguest();
        var loaded = {}; // Кэш загруженных данных
        var isDestroyed = false; // Флаг уничтожения компонента

        // Создание HTML-структуры интерфейса
        this.create = function () {
            if (isDestroyed) return;
            html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__head\"></div>\n                <div class=\"new-interface-info__title\"></div>\n                <div class=\"new-interface-info__details\"></div>\n                <div class=\"new-interface-info__description\"></div>\n            </div>\n        </div>");
        };

        // Обновление данных интерфейса
        this.update = function (data) {
            if (isDestroyed || !html) {
                console.warn('Cannot update - component is destroyed or HTML not initialized');
                return;
            }

            const logoSetting = Lampa.Storage.get('logo_glav2') || 'show_all';
            
            if (logoSetting !== 'hide') {
                const type = data.name ? 'tv' : 'movie';
                const url = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key());

                network.silent(url, (images) => {
                    if (isDestroyed || !html) return;

                    let bestLogo = null;
                    
                    if (images.logos && images.logos.length > 0) {
                        let bestRussianLogo = null;
                        let bestEnglishLogo = null;
                        let bestOtherLogo = null;

                        images.logos.forEach(logo => {
                            if (logo.iso_639_1 === 'ru') {
                                if (!bestRussianLogo || logo.vote_average > bestRussianLogo.vote_average) {
                                    bestRussianLogo = logo;
                                }
                            }
                            else if (logo.iso_639_1 === 'en') {
                                if (!bestEnglishLogo || logo.vote_average > bestEnglishLogo.vote_average) {
                                    bestEnglishLogo = logo;
                                }
                            }
                            else if (!bestOtherLogo || logo.vote_average > bestOtherLogo.vote_average) {
                                bestOtherLogo = logo;
                            }
                        });

                        bestLogo = bestRussianLogo || bestEnglishLogo || bestOtherLogo;

                        if (logoSetting === 'ru_only' && !bestRussianLogo) {
                            bestLogo = null;
                        }
                    }
                    
                    this.applyLogo(data, bestLogo);
                }, () => {
                    if (!isDestroyed && html) {
                        const titleElement = html.find('.new-interface-info__title');
                        if (titleElement.length) {
                            titleElement.text(data.title);
                        }
                    }
                });
            } else if (!isDestroyed && html) {
                const titleElement = html.find('.new-interface-info__title');
                if (titleElement.length) {
                    titleElement.text(data.title);
                }
            }

            if (!isDestroyed && html) {
                Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
                this.load(data);
            }
        };
        
        // Применение логотипа к интерфейсу с кэшированием
        this.applyLogo = function(data, logo) {
            if (isDestroyed || !html) return;
    
            const titleElement = html.find('.new-interface-info__title');
            if (!titleElement.length) return;
    
            if (!logo || !logo.file_path) {
                titleElement.text(data.title);
                return;
            }

            const imageUrl = Lampa.TMDB.image("/t/p/w500" + logo.file_path);

            // Проверка кэша
            if (imageCache[imageUrl]) {
                titleElement.html(imageCache[imageUrl]);
                return;
            }

            // Проверка, не пытаемся ли загрузить то же самое лого повторно
            if (titleElement.data('current-logo') === imageUrl) return;
            titleElement.data('current-logo', imageUrl);

            // Создаем временный элемент для предзагрузки
            const tempImg = new Image();
            tempImg.src = imageUrl;

            // Обработка успешной загрузки
            tempImg.onload = () => {
                if (isDestroyed || !html) return;
                
                const logoHtml = `
                    <img class="new-interface-logo logo-loading" 
                         src="${imageUrl}" 
                         alt="${data.title}"
                         loading="eager"
                         onerror="this.remove(); this.parentElement.textContent='${data.title.replace(/"/g, '&quot;')}'" />
                `;
                
                // Сохраняем в кэш
                addToCache(imageCache, imageUrl, logoHtml);
                titleElement.html(logoHtml);

                // Плавное появление
                setTimeout(() => {
                    const logoImg = titleElement.find('.new-interface-logo');
                    if (logoImg.length) logoImg.removeClass('logo-loading');
                }, 10);
            };

            // Обработка ошибки загрузки
            tempImg.onerror = () => {
                if (isDestroyed || !html) return;
                titleElement.text(data.title);
            };
        };

        // Отрисовка деталей контента
        this.draw = function (data) {
            if (isDestroyed || !html) {
                console.warn('Cannot draw - component is destroyed or HTML not initialized');
                return;
            }

            try {
                var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
                var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
                var head = [];
                var details = [];
                var countries = Lampa.Api.sources.tmdb.parseCountries(data);
                var pg = Lampa.Api.sources.tmdb.parsePG(data);
                
                if (create !== '0000') head.push('<span>' + create + '</span>');
                if (countries.length > 0) head.push(countries.join(', '));
                if (vote > 0) details.push('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');
                if (data.number_of_episodes && data.number_of_episodes > 0) {
                    details.push('<span class="full-start__pg">Эпизодов ' + data.number_of_episodes + '</span>');
                }
                
                if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
                if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
                
                html.find('.new-interface-info__head').empty().append(head.join(', '));
                html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
            } catch (e) {
                console.error('Error in draw method:', e);
            }
        };

        // Загрузка дополнительных данных о контенте
        this.load = function (data) {
            if (isDestroyed) return;

            var _this = this;

            clearTimeout(timer);
            var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            if (loaded[url]) return this.draw(loaded[url]);
            timer = setTimeout(function () {
                if (isDestroyed) return;
                network.clear();
                network.timeout(5000);
                network.silent(url, function (movie) {
                    if (isDestroyed) return;
                    loaded[url] = movie;
                    _this.draw(movie);
                }, function() {
                    console.warn('Failed to load additional data for:', data.id);
                });
            }, 500);
        };

        this.render = function () {
            return isDestroyed ? null : html;
        };

        this.empty = function () {};

        // Очистка и уничтожение интерфейса
        this.destroy = function () {
            isDestroyed = true;
            if (html) {
                html.remove();
                html = null;
            }
            loaded = {};
            if (network) {
                network.clear();
            }
            clearTimeout(timer);
        };
    }

    // Основной компонент интерфейса
    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true,
            scroll_by_item: true
        });
        var items = [];
        var html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0;
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var info;
        var lezydata;
        var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;
        var isDestroyed = false;

        this.create = function () {};

        // Отображение пустого состояния
        this.empty = function () {
            if (isDestroyed) return;

            var button;

            if (object.source == 'tmdb') {
                button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({
                        source: 'cub'
                    });
                });
            }

            var empty = new Lampa.Empty();
            html.append(empty.render(button));
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        // Загрузка следующей порции данных
        this.loadNext = function () {
            if (isDestroyed) return;

            var _this = this;

            if (this.next && !this.next_wait && items.length) {
                this.next_wait = true;
                this.next(function (new_data) {
                    if (isDestroyed) return;
                    _this.next_wait = false;
                    new_data.forEach(_this.append.bind(_this));
                    Lampa.Layer.visible(items[active + 1].render(true));
                }, function () {
                    if (isDestroyed) return;
                    _this.next_wait = false;
                });
            }
        };

        this.push = function () {};

        // Построение интерфейса с полученными данными
        this.build = function (data) {
            if (isDestroyed) return;

            var _this2 = this;

            lezydata = data;
            info = new create(object);
            info.create();
            scroll.minus(info.render());
            data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
            html.append(info.render());
            html.append(scroll.render());

            if (newlampa) {
                Lampa.Layer.update(html);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onEnd = this.loadNext.bind(this);

                scroll.onWheel = function (step) {
                    if (isDestroyed) return;
                    if (!Lampa.Controller.own(_this2)) _this2.start();
                    if (step > 0) _this2.down();else if (active > 0) _this2.up();
                };
            }

            this.activity.loader(false);
            this.activity.toggle();
        };

        // Обновление фонового изображения с кэшированием
        this.background = function(elem) {
            if (isDestroyed || !elem || !elem.backdrop_path) {
                background_img.removeClass('loaded');
                return;
            }

            var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            var new_backdrop_path = elem.backdrop_path;

            clearTimeout(background_timer);
            if (background_img[0].src) {
                background_img[0].onload = null;
                background_img[0].onerror = null;
            }

            if (new_background === background_last && new_backdrop_path === background_last_path) return;
            
            background_last = new_background;
            background_last_path = new_backdrop_path;

            if (backgroundCache[new_background]) {
                background_img[0].src = new_background;
                background_img.addClass('loaded');
                return;
            }

            background_img.removeClass('loaded');
            
            background_img[0].onload = function() {
                if (isDestroyed) return;
                background_img.addClass('loaded');
                addToCache(backgroundCache, new_background, true);
            };
            
            background_img[0].onerror = function() {
                if (isDestroyed) return;
                background_img.removeClass('loaded');
            };
            
            background_img[0].src = new_background;
        };

        // Добавление элемента в список
        this.append = function (element) {
            if (isDestroyed) return;

            var _this3 = this;

            if (element.ready) return;
            element.ready = true;
            var item = new Lampa.InteractionLine(element, {
                url: element.url,
                card_small: true,
                cardClass: element.cardClass,
                genres: object.genres,
                object: object,
                card_wide: true,
                nomore: element.nomore
            });
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);

            item.onToggle = function () {
                if (isDestroyed) return;
                active = items.indexOf(item);
            };

            if (this.onMore) item.onMore = this.onMore.bind(this);

            item.onFocus = function (elem) {
                if (isDestroyed) return;
                info.update(elem);
                _this3.background(elem);
            };

            item.onHover = function (elem) {
                if (isDestroyed) return;
                info.update(elem);
                _this3.background(elem);
            };

            item.onFocusMore = function() {
                if (isDestroyed || !info) return;
                info.empty();
            };

            scroll.append(item.render());
            items.push(item);
        };

        // Навигация назад
        this.back = function () {
            if (isDestroyed) return;
            Lampa.Activity.backward();
        };

        // Навигация вниз
        this.down = function () {
            if (isDestroyed) return;

            active++;
            active = Math.min(active, items.length - 1);
            if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
            items[active].toggle();
            scroll.update(items[active].render());
        };

        // Навигация вверх
        this.up = function () {
            if (isDestroyed) return;

            active--;

            if (active < 0) {
                active = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[active].toggle();
                scroll.update(items[active].render());
            }
        };

        // Инициализация управления
        this.start = function () {
            if (isDestroyed) return;

            var _this4 = this;

            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() {
                    if (isDestroyed) return false;
                    if (_this4.activity.canRefresh()) return false;

                    if (items.length) {
                        items[active].toggle();
                    }
                },
                update: function update() {},
                left: function left() {
                    if (isDestroyed) return;
                    if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
                },
                right: function right() {
                    if (isDestroyed) return;
                    Navigator.move('right');
                },
                up: function up() {
                    if (isDestroyed) return;
                    if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
                },
                down: function down() {
                    if (isDestroyed) return;
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.refresh = function () {
            if (isDestroyed) return;
            this.activity.loader(true);
            this.activity.need_refresh = true;
        };

        this.pause = function () {};

        this.stop = function () {};

        this.render = function () {
            return isDestroyed ? null : html;
        };

        // Очистка и уничтожение компонента
        this.destroy = function () {
            isDestroyed = true;
            if (network) network.clear();
            Lampa.Arrays.destroy(items);
            if (scroll) scroll.destroy();
            if (info) info.destroy();
            if (html) html.remove();
            items = null;
            network = null;
            lezydata = null;
            clearTimeout(background_timer);
        };
    }

    // Инициализация плагина
    function startPlugin() {
        // Добавляем класс для контроля видимости
        document.body.classList.add('interface-loading');

        window.plugin_interface_ready = true;
        var old_interface = Lampa.InteractionMain;
        var new_interface = component;

        // Переопределение основного интерфейса
        Lampa.InteractionMain = function (object) {
            var use = new_interface;

            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            if (object.title === 'Избранное') {
                use = old_interface;
            }

            return new use(object);
        };
        
        // Добавление компонента в настройки
        Lampa.SettingsApi.addComponent({
            component: 'styleint',
            name: Lampa.Lang.translate('Стильный интерфейс'),
            icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="72" y1="104" x2="152" y2="184" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="44" y1="188" x2="72" y2="160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="68" y1="212" x2="96" y2="184" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M156,124l16.69,16.69a16,16,0,0,1,0,22.62L96,240,16,160,92.69,83.31a16,16,0,0,1,22.62,0L132,100l59-69A24,24,0,0,1,225,65Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
            `
        });

        // Добавление параметра настройки логотипов
        Lampa.SettingsApi.addParam({
            component: "styleint",
            param: {
                name: "logo_glav2",
                type: "select",
                values: { 
                    "show_all": "Все логотипы", 
                    "ru_only": "Только русские", 
                    "hide": "Скрыть логотипы"
                },
                default: "show_all"
            },
            field: {
                name: "Настройки логотипов на главной",
                description: "Управление отображением логотипов вместо названий"
            }
        }); 

        // Добавление CSS стилей для нового интерфейса
        Lampa.Template.add('new_interface_style', `
            <style>
            .interface-loading .new-interface {
                opacity: 0;
                visibility: hidden;
            }

            .new-interface {
                opacity: 1;
                visibility: visible;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .new-interface .card--small.card--wide {
                width: 18.3em;
            }
            
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 26em;
            }
            
            .new-interface-info__body {
                width: 80%;
                padding-top: 1.1em;
            }
            
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 0em;
                font-size: 1.3em;
                min-height: 1em;
            }
            
            .new-interface-info__head span {
                color: #fff;
            }
            
            .new-interface-info__title {
                font-size: 4em;
                margin-top: 0.1em;
                font-weight: 800;
                margin-bottom: 0em;
                overflow: hidden;
                -o-text-overflow: ".";
                text-overflow: ".";
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                margin-left: -0.03em;
                line-height: 1;
                text-shadow: 2px 3px 1px #00000040;
                max-width: 9em;
                text-transform: uppercase;
                letter-spacing: -2px;
                word-spacing: 5px;
            }
            
            .new-interface-logo {
                margin-top: 0.3em;
                margin-bottom: 0.3em;
                max-width: 7em;
                max-height: 3em;
                object-fit: contain;
                width: auto;
                height: auto;
                min-height: 1em;
                filter: drop-shadow(0 0 0.6px rgba(255, 255, 255, 0.4));
            }
            
            .new-interface-logo {
                opacity: 1 !important;
            }
            
            .new-interface-info__details {
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
            }
            
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            
            .new-interface-info__description {
                font-size: 1.2em;
                font-weight: 300;
                line-height: 1.5;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                line-clamp: 4;
                -webkit-box-orient: vertical;
                width: 70%;
            }
            
            .new-interface .full-start__background {
                opacity: 0.6 !important;
                transition: none !important;
            }
            
            .new-interface .full-start__background {
                height:109% !important;
                left:0em !important;
                top:-9.2% !important;
            }
            
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            
            /* Полное удаление card__promo */
            .new-interface .card__promo,
            .new-interface .card .card__promo {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                opacity: 0 !important;
            }
            
            .new-interface .card-more__box {
                padding-bottom: 95%;
            }
            
            .new-interface .card.card--wide+.card-more .card-more__box {
                padding-bottom: 95%;
            }
            
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }					
            
            body.light--version .new-interface-info__body {
                width: 69%;
                padding-top: 1.5em;
            }
            
            body.light--version .new-interface-info {
                height: 25.3em;
            }

            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view{
                animation: animation-card-focus 0.2s
            }
            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view{
                animation: animation-trigger-enter 0.2s forwards
            }
            </style>
        `);				
        
        // Добавление стилей в DOM
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));

        // Убираем класс после полной загрузки
        setTimeout(function() {
            document.body.classList.remove('interface-loading');
        }, 1000);
    }

    // Ждем полной загрузки страницы и всех ресурсов
    function initialize() {
        if (document.readyState === 'complete') {
            startPlugin();
        } else {
            window.addEventListener('load', function() {
                // Дополнительная задержка для предзагрузчика
                setTimeout(startPlugin, 500);
            });
        }
    }

    // Инициализируем плагин только если он еще не был инициализирован
    if (!window.plugin_interface_ready) {
        initialize();
    }
})();
