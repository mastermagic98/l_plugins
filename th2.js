(function () {
    'use strict';

    // Додаємо переклади для інтерфейсу
    Lampa.Lang.add({
        accent_color: {
            ru: 'Колір акценту',
            en: 'Accent color',
            uk: 'Колір акценту',
            be: 'Колер акцэнту',
            zh: '強調色',
            pt: 'Cor de destaque',
            bg: 'Цвят на акцента',
            he: 'צבע הדגשה',
            cs: 'Barva akcentu'
        },
        maxsm_themes_animations: {
            ru: 'Анимации',
            en: 'Animations',
            uk: 'Анімації',
            be: 'Анімацыі',
            zh: '动画',
            pt: 'Animações',
            bg: 'Анимации',
            he: 'אנימציות',
            cs: 'Animace'
        },
        maxsm_themes_translate_tv: {
            ru: 'Переводить TV',
            en: 'Translate TV',
            uk: 'Перекладати TV',
            be: 'Перакладаць TV',
            zh: '翻译 TV',
            pt: 'Traduzir TV',
            bg: 'Превеждане на TV',
            he: 'לתרגם TV',
            cs: 'Přeložit TV'
        },
        maxsm_themes_tvcaption: {
            ru: 'СЕРИАЛ',
            en: 'SERIES',
            uk: 'СЕРІАЛ',
            be: 'СЕРЫЯЛ',
            zh: '剧集',
            pt: 'SÉRIE',
            bg: 'СЕРИАЛ',
            he: 'סִדְרָה',
            cs: 'SERIÁL'
        },
        maxsm_themes_incardtemplate: {
            ru: 'Макет содержимого карточки',
            en: 'Card content layout',
            uk: 'Макет вмісту картки',
            be: 'Макет змесціва карткі',
            zh: '卡片内容布局',
            pt: 'Layout do conteúdo do cartão',
            bg: 'Оформление на съдържанието в картата',
            he: 'פריסת תוכן בכרטיס',
            cs: 'Rozvržení obsahu karty'
        },
        maxsm_themes_bigbuttons: {
            ru: 'Большие кнопки в карточке',
            en: 'Large buttons in card',
            uk: 'Великі кнопки в картці',
            be: 'Вялікія кнопкі ў картцы',
            zh: '卡片中的大按钮',
            pt: 'Botões grandes no cartão',
            bg: 'Големи бутони в картата',
            he: 'כפתורים גדולים בכרטיס',
            cs: 'Velká tlačítka v kartě'
        }
    });

    // SVG-іконка для меню
    var themes_svg = '<!-- icon666.com - MILLIONS OF FREE VECTOR ICONS --><svg viewBox="0 0 512.00026 512" xmlns="http://www.w3.org/2000/svg"><path d="m491.238281 20.761719c-14.375-14.375-34.265625-21.890625-54.550781-20.625-20.289062 1.269531-39.078125 11.207031-51.550781 27.261719l-98.660157 127.007812-41.109374-41.109375c-12.015626-12.019531-27.996094-18.636719-44.988282-18.636719-16.996094 0-32.972656 6.617188-44.992187 18.636719l-142.363281 142.363281c-17.363282 17.363282-17.363282 45.617188 0 62.980469l180.335937 180.335937c8.679687 8.683594 20.085937 13.023438 31.488281 13.023438 11.40625 0 22.808594-4.339844 31.492188-13.023438l142.363281-142.363281c12.019531-12.019531 18.636719-27.996093 18.636719-44.992187 0-16.992188-6.617188-32.972656-18.636719-44.988282l-41.109375-41.109374 127.007812-98.660157c16.054688-12.472656 25.992188-31.261719 27.261719-51.550781 1.269531-20.292969-6.25-40.175781-20.625-54.550781zm-276.386719 456.722656-15.898437-15.898437 22.957031-22.957032c5.933594-5.9375 5.933594-15.558594 0-21.496094-5.933594-5.933593-15.558594-5.933593-21.492187 0l-22.957031 22.957032-10.152344-10.148438 44.210937-44.210937c5.9375-5.933594 5.9375-15.558594 0-21.492188-5.933593-5.9375-15.558593-5.9375-21.492187 0l-44.210938 44.210938-42.265625-42.265625 22.957031-22.957032c5.9375-5.9375 5.9375-15.558593 0-21.496093-5.933593-5.933594-15.558593-5.933594-21.492187 0l-22.957031 22.957031-10.152344-10.148438 44.210938-44.210937c5.9375-5.933594 5.9375-15.558594 0-21.492187-5.933594-5.9375-15.558594-5.9375-21.492188 0l-44.210938 44.210937-15.898437-15.898437c-5.511719-5.511719-5.511719-14.484376 0-19.996094l77.199219-77.195313 200.328125 200.328125-77.199219 77.199219c-5.511719 5.511719-14.480469 5.511719-19.992188 0zm118.6875-98.695313-200.328124-200.328124 18.175781-18.175782 200.328125 200.328125zm53.40625-67.167968c0 8.875-3.457031 17.222656-9.734374 23.496094l-4 4.003906-191.484376-191.480469-8.847656-8.847656 4.003906-4.003907c6.273438-6.277343 14.621094-9.730468 23.496094-9.730468s17.21875 3.453125 23.492188 9.730468l153.339844 153.335938c6.277343 6.277344 9.734374 14.621094 9.734374 23.496094zm94.578126-238.210938c-.726563 11.589844-6.398438 22.324219-15.570313 29.449219l-130.019531 101-27.796875-27.792969 101.003906-130.019531c7.125-9.171875 17.855469-14.847656 29.449219-15.570313 11.578125-.71875 22.945312 3.566407 31.15625 11.777344 8.210937 8.210938 12.503906 19.570313 11.777344 31.15625zm0 0" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m439.84375 56.953125c-7.949219 0-15.566406 6.992187-15.195312 15.199219.367187 8.234375 6.675781 15.199218 15.195312 15.199218 7.953125 0 15.566406-6.988281 15.199219-15.199218-.367188-8.234375-6.675781-15.199219-15.199219-15.199219zm0 0" fill="#000000" style="fill: rgb(255, 255, 255);"></path></svg>';

    // Основний об'єкт плагіну
    var accent_color_plugin = {
        name: 'accent_color_plugin',
        version: '1.0.0',
        settings: {
            accent_color: '#5daa68' // Колір за замовчуванням
        }
    };

    // Запускаємо один раз
    var onetime = false;

    // Функція для застосування кольору акценту
    function applyAccentColor(color) {
        // Оновлюємо CSS-перемінну --main-color
        document.documentElement.style.setProperty('--main-color', color);

        // Генеруємо SVG для завантажувача з новим кольором
        var svgCode = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="135" height="140" fill="' + color + '"><rect width="10" height="40" y="100" rx="6"><animate attributeName="height" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="20" y="100" rx="6"><animate attributeName="height" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="40" y="100" rx="6"><animate attributeName="height" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="60" y="100" rx="6"><animate attributeName="height" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="80" y="100" rx="6"><animate attributeName="height" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="100" y="100" rx="6"><animate attributeName="height" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect><rect width="10" height="40" x="120" y="100" rx="6"><animate attributeName="height" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/><animate attributeName="y" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect></svg>');

        // Оновлюємо стилі для activity__loader і modal-loading
        var loaderStyle = document.createElement('style');
        loaderStyle.id = 'accent_color_loader';
        loaderStyle.innerHTML = '.activity__loader {' +
            'position: absolute;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'display: none;' +
            'background: url("data:image/svg+xml,' + svgCode + '") no-repeat 50% 50%;' +
            '}' +
            '.modal-loading {' +
            'height: 6em;' +
            'background: url("data:image/svg+xml,' + svgCode + '") no-repeat 50% 50%;' +
            '-webkit-background-size: contain;' +
            '-moz-background-size: contain;' +
            '-o-background-size: contain;' +
            'background-size: contain;' +
            '}';
        document.head.appendChild(loaderStyle);

        // Викликаємо функції для додаткових налаштувань
        animations();
        translate_tv();
        bigbuttons();

        if (!onetime) {
            onetime = true;
            forall();
            removeFromSettingsMenu();
            fix_lang();
            incardtemplate();
        }
    }

    // Функція для виправлення перекладів статусів
    function fix_lang() {
        Lampa.Lang.add({
            tv_status_returning_series: { ru: 'Идет' },
            tv_status_planned: { ru: 'Запланирован' },
            tv_status_in_production: { ru: 'В производстве' },
            tv_status_ended: { ru: 'Завершен' },
            tv_status_canceled: { ru: 'Отменен' },
            tv_status_pilot: { ru: 'Пилот' },
            tv_status_released: { ru: 'Вышел' },
            tv_status_rumored: { ru: 'По слухам' },
            tv_status_post_production: { ru: 'Скоро' }
        });
    }

    // Функція для видалення додаткових налаштувань
    function removeAdditionalSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'accent_color_plugin') {
                e.body.find('[data-name="maxsm_themes_animations"]').remove();
                e.body.find('[data-name="maxsm_themes_translate_tv"]').remove();
                e.body.find('[data-name="maxsm_themes_incardtemplate"]').remove();
                e.body.find('[data-name="maxsm_themes_bigbuttons"]').remove();
            }
        });
    }

    // Функція для видалення непотрібних пунктів меню налаштувань
    function removeFromSettingsMenu() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'interface') {
                e.body.find('[data-name="light_version"]').remove();
                e.body.find('[data-name="background"]').remove();
                e.body.find('[data-name="background_type"]').remove();
                e.body.find('[data-name="card_interfice_type"]').remove();
                e.body.find('[data-name="glass_style"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="glass_style"]').remove();
                e.body.find('[data-name="glass_opacity"]').remove();
                e.body.find('[data-name="card_interfice_poster"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="card_interfice_poster"]').remove();
                e.body.find('[data-name="card_interfice_cover"]').remove();
                e.body.find('[data-name="advanced_animation"]').remove();
            }
        });
        Lampa.Storage.set('light_version', 'false');
        Lampa.Storage.set('background', 'false');
        Lampa.Storage.set('card_interfice_type', 'new');
        Lampa.Storage.set('glass_style', 'false');
        Lampa.Storage.set('card_interfice_poster', 'false');
        Lampa.Storage.set('card_interfice_cover', 'true');
        Lampa.Storage.set('advanced_animation', 'false');
    }

    // Функція для загальних стилів і шаблонів
    function forall() {
        Lampa.Template.add('card', '<div class="card selector layer--visible layer--render">' +
            '<div class="card__view">' +
            '<img src="./img/img_load.svg" class="card__img" />' +
            '<div class="card__icons">' +
            '<div class="card__icons-inner"></div>' +
            '</div>' +
            '<div class="card__age">{release_year}</div>' +
            '</div>' +
            '<div class="card__title">{title}</div>' +
            '</div>');

        Lampa.Template.add('card_episode', '<div class="card-episode selector layer--visible layer--render">' +
            '<div class="card-episode__body">' +
            '<div class="full-episode">' +
            '<div class="full-episode__img"><img /></div>' +
            '<div class="full-episode__body">' +
            '<div class="card__title">{title}</div>' +
            '<div class="card__age">{release_year}</div>' +
            '<div class="full-episode__num hide">{num}</div>' +
            '<div class="full-episode__name">{name}</div>' +
            '<div class="full-episode__date">{date}</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="card-episode__footer hide">' +
            '<div class="card__imgbox">' +
            '<div class="card__view"><img class="card__img" /></div>' +
            '</div>' +
            '<div class="card__left">' +
            '<div class="card__title">{title}</div>' +
            '<div class="card__age">{release_year}</div>' +
            '</div>' +
            '</div>' +
            '</div>');

        var forall_style = '<style id="accent_color_forall">' +
            '@media screen and (max-width: 480px) { .full-start-new__head, .full-start-new__title, .full-start__title-original, .full-start__rate, .full-start-new__reactions, .full-start-new__rate-line, .full-start-new__buttons, .full-start-new__details, .full-start-new__tagline { -webkit-justify-content: center; justify-content: center; text-align: center; }' +
            '.full-start__title-original { max-width: 100%; } }' +
            '@media screen and (max-width: 480px) { .full-start-new__right { background: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0))); background: -webkit-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: -o-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); } }' +
            '.selectbox-item__checkbox { border-radius: 100%; }' +
            '.selectbox-item--checked .selectbox-item__checkbox { background: #ccc; }' +
            '.full-start-new__rate-line .full-start__pg { font-size: 1em; background: #fff; color: #000; }' +
            '.full-start__rate { border-radius: 0.25em; padding: 0.3em; background-color: rgba(0, 0, 0, 0.3); }' +
            '.full-start__pg, .full-start__status { font-size: 1em; background: #fff; color: #000; }' +
            '.card__title { height: 3.6em; text-overflow: ellipsis; -o-text-overflow: ellipsis; -webkit-line-clamp: 3; line-clamp: 3; }' +
            '.card__age { position: absolute; right: 0em; bottom: 0em; z-index: 10; background: rgba(0, 0, 0, 0.6); color: #ffffff; font-weight: 700; padding: 0.4em 0.6em; -webkit-border-radius: 0.48em 0 0.48em 0; -moz-border-radius: 0.48em 0 0.48em 0; border-radius: 0.48em 0 0.48em 0; line-height: 1.0; font-size: 1.0em; }' +
            '.card__vote { position: absolute; bottom: auto; right: 0em; top: 0em; background: rgba(0, 0, 0, 0.6); font-weight: 700; color: #fff; -webkit-border-radius: 0 0.34em 0 0.34em; -moz-border-radius: 0 0.34em 0 0.34em; border-radius: 0 0.34em 0 0.34em; line-height: 1.0; font-size: 1.4em; }' +
            '.card__icons { position: absolute; top: 2em; left: 0; right: auto; display: -webkit-box; display: -webkit-flex; display: -moz-box; display: -ms-flexbox; display: flex; -webkit-box-pack: center; -webkit-justify-content: center; -moz-box-pack: center; -ms-flex-pack: center; justify-content: center; background: rgba(0, 0, 0, 0.6); color: #fff; -webkit-border-radius: 0 0.5em 0.5em 0; -moz-border-radius: 0 0.5em 0.5em 0; border-radius: 0 0.5em 0.5em 0; }' +
            '.card__icons-inner { background: rgba(0, 0, 0, 0); }' +
            '.card__marker { position: absolute; left: 0em; top: 4em; bottom: auto; background: rgba(0, 0, 0, 0.6); -webkit-border-radius: 0 0.5em 0.5em 0; -moz-border-radius: 0 0.5em 0.5em 0; border-radius: 0 0.5em 0.5em 0; font-weight: 700; font-size: 1.0em; padding: 0.4em 0.6em; display: -webkit-box; display: -webkit-flex; display: -moz-box; display: -ms-flexbox; display: flex; -webkit-box-align: center; -webkit-align-items: center; -moz-box-align: center; -ms-flex-align: center; align-items: center; line-height: 1.2; max-width: min(12em, 95%); box-sizing: border-box; }' +
            '.card__marker > span { max-width: min(12em, 95%); }' +
            '.card__quality { position: absolute; left: auto; right: 0em; bottom: 2.4em; padding: 0.4em 0.6em; color: #fff; font-weight: 700; font-size: 1.0em; -webkit-border-radius: 0.5em 0 0 0.5em; -moz-border-radius: 0.5em 0 0 0.5em; border-radius: 0.5em 0 0 0.5em; text-transform: uppercase; }' +
            '.items-line.items-line--type-cards + .items-line.items-line--type-cards { margin-top: 1em; }' +
            '.card--small .card__view { margin-bottom: 2em; }' +
            '.items-line--type-cards { min-height: 18em; }' +
            '@media screen and (min-width: 580px) { .full-start-new { min-height: 80vh; display: flex; } }' +
            '.full-start__background.loaded { opacity: 0.8; } .full-start__background.dim { opacity: 0.2; }' +
            '.explorer__files .torrent-filter .simple-button { font-size: 1.2em; -webkit-border-radius: 0.5em; -moz-border-radius: 0.5em; border-radius: 0.5em; }' +
            '.full-review-add, .full-review, .extensions__item, .extensions__block-add, .search-source, .bookmarks-folder__layer, .bookmarks-folder__body, .card__img, .card__promo, .full-episode--next .full-episode__img:after, .full-episode__img img, .full-episode__body, .full-person__photo, .card-more__box, .full-start__button, .simple-button, .register { border-radius: 0.5em; }' +
            '.extensions__item.focus::after, .extensions__block-add.focus::after, .full-episode.focus::after, .full-review-add.focus::after, .card-parser.focus::after, .card-episode.focus .full-episode::after, .card-episode.hover .full-episode::after, .card.focus .card__view::after, .card.hover .card__view::after, .card-more.focus .card-more__box::after, .register.focus::after { border-radius: 1em; }' +
            '.search-source.focus, .simple-button.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .full-person.selector.focus, .tag-count.selector.focus { border-radius: 0.5em; }' +
            '.menu__item.focus { border-radius: 0 0.5em 0.5em 0; }' +
            '.menu__list { padding-left: 0em; }' +
            '.menu__item.focus .menu__ico { -webkit-filter: invert(1); filter: invert(1); }' +
            '</style>';
        Lampa.Template.add('forall_style_css', forall_style);
        $('body').append(Lampa.Template.get('forall_style_css', {}, true));
    }

    // Функція для шаблону картки
    function incardtemplate() {
        var incardtemplate = localStorage.getItem('maxsm_themes_incardtemplate') === 'true';
        if (incardtemplate) {
            Lampa.Template.add('full_start_new', '<div class="full-start-new">' +
                '<div class="full-start-new__body">' +
                '<div class="full-start-new__left">' +
                '<div class="full-start-new__poster">' +
                '<img class="full-start-new__img full--poster" />' +
                '</div>' +
                '</div>' +
                '<div class="full-start-new__right">' +
                '<div class="full-start-new__head"></div>' +
                '<div class="full-start-new__title">{title}</div>' +
                '<div class="full-start__title-original">{original_title}</div>' +
                '<div class="full-start-new__tagline full--tagline">{tagline}</div>' +
                '<div class="full-start-new__rate-line">' +
                '<div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>' +
                '<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>' +
                '<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>' +
                '<div class="full-start__pg hide"></div>' +
                '<div class="full-start__status hide"></div>' +
                '</div>' +
                '<div class="full-start-new__details"></div>' +
                '<div class="full-start-new__reactions"><div>#{reactions_none}</div></div>' +
                '<div class="full-start-new__buttons">' +
                '<div class="full-start__button selector button--play">' +
                '<svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>' +
                '<path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>' +
                '</svg><span>#{title_watch}</span>' +
                '</div>' +
                '<div class="full-start__button view--torrent">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">' +
                '<path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>' +
                '</svg><span>#{full_torrents}</span>' +
                '</div>' +
                '<div class="full-start__button selector view--trailer">' +
                '<svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>' +
                '</svg><span>#{full_trailers}</span>' +
                '</div>' +
                '<div class="full-start__button selector button--book">' +
                '<svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>' +
                '</svg><span>#{settings_input_links}</span>' +
                '</div>' +
                '<div class="full-start__button selector button--reaction">' +
                '<svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>' +
                '<path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>' +
                '</svg><span>#{title_reactions}</span>' +
                '</div>' +
                '<div class="full-start__button selector button--subscribe hide">' +
                '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>' +
                '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>' +
                '</svg><span>#{title_subscribe}</span>' +
                '</div>' +
                '<div class="full-start__button selector button--options">' +
                '<svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>' +
                '<circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>' +
                '<circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>' +
                '</svg>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
        }
    }

    // Функція для перекладу TV
    function translate_tv() {
        var tv_caption = Lampa.Lang.translate('maxsm_themes_tvcaption');
        var translate_tv = localStorage.getItem('maxsm_themes_translate_tv') === 'true';
        var translate_tv_style;
        $('#accent_color_translate_tv').remove();
        if (!translate_tv) {
            translate_tv_style = '<style id="accent_color_translate_tv">' +
                '.card__type { position: absolute; bottom: auto; left: 0em; right: auto; top: 0em; background: rgba(0, 0, 0, 0.6); color: #fff; font-weight: 700; padding: 0.4em 0.6em; -webkit-border-radius: 0.4em 0 0.4em 0; -moz-border-radius: 0.4em 0 0.4em 0; border-radius: 0.4em 0 0.4em 0; line-height: 1.0; font-size: 1.0em; }' +
                '.card--tv .card__type { color: #fff; }' +
                '</style>';
            $('body').append(translate_tv_style);
        } else {
            translate_tv_style = '<style id="accent_color_translate_tv">' +
                '.card--tv .card__type, .card__type { font-size: 1em; background: transparent; color: transparent; left: 0; top: 0; }' +
                '.card__type::after { content: "' + tv_caption + '"; color: #fff; position: absolute; left: 0; top: 0; padding: 0.4em 0.6em; border-radius: 0.4em 0 0.4em 0; font-weight: 700; }' +
                '</style>';
            $('body').append(translate_tv_style);
        }
    }

    // Функція для анімацій
    function animations() {
        var animations = localStorage.getItem('maxsm_themes_animations') === 'true';
        $('#accent_color_animations').remove();
        if (animations) {
            var animations_style = '<style id="accent_color_animations">' +
                '.card { transform: scale(1); transition: transform 0.3s ease; }' +
                '.card.focus { transform: scale(1.03); }' +
                '.torrent-item, .online-prestige { transform: scale(1); transition: transform 0.3s ease; }' +
                '.torrent-item.focus, .online-prestige.focus { transform: scale(1.01); }' +
                '.extensions__item, .extensions__block-add, .full-review-add, .full-review, .tag-count, .full-person, .full-episode, .simple-button, .full-start__button, .items-cards .selector, .card-more, .explorer-card__head-img.selector, .card-episode { transform: scale(1); transition: transform 0.3s ease; }' +
                '.extensions__item.focus, .extensions__block-add.focus, .full-review-add.focus, .full-review.focus, .tag-count.focus, .full-person.focus, .full-episode.focus, .simple-button.focus, .full-start__button.focus, .items-cards .selector.focus, .card-more.focus, .explorer-card__head-img.selector.focus, .card-episode.focus { transform: scale(1.03); }' +
                '.menu__item { transition: transform 0.3s ease; }' +
                '.menu__item.focus { transform: translateX(-0.2em); }' +
                '.selectbox-item, .settings-folder, .settings-param { transition: transform 0.3s ease; }' +
                '.selectbox-item.focus, .settings-folder.focus, .settings-param.focus { transform: translateX(0.2em); }' +
                '</style>';
            $('body').append(animations_style);
        }
    }

    // Функція для великих кнопок
    function bigbuttons() {
        var bigbuttons = localStorage.getItem('maxsm_themes_bigbuttons') === 'true';
        $('#accent_color_bigbuttons').remove();
        if (bigbuttons) {
            var bigbuttons_style = '<style id="accent_color_bigbuttons">' +
                '.full-start-new__buttons .full-start__button:not(.focus) span { display: inline; }' +
                '@media screen and (max-width: 580px) { .full-start-new__buttons { overflow: auto; } .full-start-new__buttons .full-start__button:not(.focus) span { display: none; } }' +
                '</style>';
            $('body').append(bigbuttons_style);
        }
    }

    // Функція ініціалізації плагіну
    function startPlugin() {
        // Встановлюємо значення за замовчуванням
        if (!localStorage.getItem('maxsm_themes_animations')) {
            localStorage.setItem('maxsm_themes_animations', 'true');
        }
        if (!localStorage.getItem('maxsm_themes_translate_tv')) {
            localStorage.setItem('maxsm_themes_translate_tv', 'true');
        }
        if (!localStorage.getItem('maxsm_themes_incardtemplate')) {
            localStorage.setItem('maxsm_themes_incardtemplate', 'true');
        }
        if (!localStorage.getItem('maxsm_themes_bigbuttons')) {
            localStorage.setItem('maxsm_themes_bigbuttons', 'false');
        }
        if (!localStorage.getItem('accent_color_selected')) {
            localStorage.setItem('accent_color_selected', '#5daa68');
        }

        // Додаємо компонент у меню налаштувань
        Lampa.SettingsApi.addComponent({
            component: 'accent_color_plugin',
            name: Lampa.Lang.translate('accent_color'),
            icon: themes_svg
        });

        // Додаємо параметр для вибору кольору
        Lampa.SettingsApi.addParam({
            component: 'accent_color_plugin',
            param: {
                name: 'accent_color_selected',
                type: 'input',
                subtype: 'color',
                default: '#5daa68'
            },
            field: {
                name: Lampa.Lang.translate('accent_color'),
                description: ''
            },
            onChange: function (value) {
                accent_color_plugin.settings.accent_color = value;
                Lampa.Storage.set('accent_color_selected', value);
                Lampa.Settings.update();
                applyAccentColor(value);
            }
        });

        // Додаємо параметри для анімацій, перекладу TV, шаблону картки та великих кнопок
        Lampa.SettingsApi.addParam({
            component: 'accent_color_plugin',
            param: {
                name: 'maxsm_themes_animations',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_animations'),
                description: ''
            },
            onChange: function (value) {
                animations();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'accent_color_plugin',
            param: {
                name: 'maxsm_themes_translate_tv',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_translate_tv'),
                description: ''
            },
            onChange: function (value) {
                translate_tv();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'accent_color_plugin',
            param: {
                name: 'maxsm_themes_incardtemplate',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_incardtemplate'),
                description: ''
            },
            onChange: function (value) {
                window.location.reload();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'accent_color_plugin',
            param: {
                name: 'maxsm_themes_bigbuttons',
                type: 'trigger',
                default: false
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_bigbuttons'),
                description: ''
            },
            onChange: function (value) {
                bigbuttons();
            }
        });

        // Застосовуємо збережений колір
        var savedColor = Lampa.Storage.get('accent_color_selected', '#5daa68');
        accent_color_plugin.settings.accent_color = savedColor;
        applyAccentColor(savedColor);
    }

    // Запускаємо плагін після готовності додатка
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    // Реєструємо плагін у маніфесті
    Lampa.Manifest.plugins = {
        name: 'accent_color_plugin',
        version: '1.0.0',
        description: 'Accent color customization'
    };

    // Експортуємо об'єкт плагіну
    window.accent_color_plugin = accent_color_plugin;
})();
