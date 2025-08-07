(function() {
    console.log("[Lampa Safe Styles] Кастомізована версія з налаштуваннями оцінки та іконкою");

    // Кеш елементів
    var elementsCache = new Map();
    var stylesApplied = false;

    // Налаштування за замовчуванням
    var defaultSettings = {
        colors: {
            darkBg: '#141414',
            darkerBg: '#1a1a1a',
            menuBg: '#181818',
            accentColor: '#c22222',
            voteBackground: '#c22222'
        },
        radii: {
            cardRadius: '1.4em',
            menuRadius: '1.2em',
            voteBorderRadius: '0em 0.5em 0em 0.5em'
        },
        opacity: {
            navigationBar: 0.3,
            bookmarksLayer: 0.3,
            cardMoreBox: 0.3
        },
        fonts: {
            titleSize: '2.5em',
            ratingWeight: 'bold',
            voteFontSize: '1.5em'
        },
        shadows: {
            modalShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        },
        animations: {
            advancedAnimation: true
        },
        mobile: {
            centerAlignDetails: true,
            maxImageWidth: '10em'
        },
        vote: {
            votePosition: 'top-right'
        }
    };

    // Поточні налаштування
    var settings = JSON.parse(JSON.stringify(defaultSettings));

    // Завантаження налаштувань з localStorage
    function loadSettings() {
        var savedSettings = localStorage.getItem('lampa_safe_styles_settings');
        if (savedSettings) {
            try {
                var parsed = JSON.parse(savedSettings);
                Object.keys(settings).forEach(function(category) {
                    Object.keys(settings[category]).forEach(function(key) {
                        if (parsed[category] && parsed[category][key]) {
                            settings[category][key] = parsed[category][key];
                        }
                    });
                });
            } catch (e) {
                console.log("[Lampa Safe Styles] Помилка завантаження налаштувань:", e);
            }
        }
    }

    // Збереження налаштувань
    function saveSettings() {
        try {
            localStorage.setItem('lampa_safe_styles_settings', JSON.stringify(settings));
        } catch (e) {
            console.log("[Lampa Safe Styles] Помилка збереження налаштувань:", e);
        }
    }

    // Валідація HEX-коду кольору
    function isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // Валідація значення em
    function isValidEm(value) {
        return /^\d*\.?\d+em$/.test(value);
    }

    // Валідація позиції оцінки
    function isValidVotePosition(value) {
        return ['top-right', 'top-left', 'bottom-right', 'bottom-left'].indexOf(value) !== -1;
    }

    // Оновлення CSS-перемінних
    function updateCSSVariables() {
        var root = document.documentElement;
        root.style.setProperty('--dark-bg', settings.colors.darkBg);
        root.style.setProperty('--darker-bg', settings.colors.darkerBg);
        root.style.setProperty('--menu-bg', settings.colors.menuBg);
        root.style.setProperty('--accent-color', settings.colors.accentColor);
        root.style.setProperty('--card-radius', settings.radii.cardRadius);
        root.style.setProperty('--menu-radius', settings.radii.menuRadius);
        root.style.setProperty('--vote-background', settings.colors.voteBackground);
        root.style.setProperty('--vote-border-radius', settings.radii.voteBorderRadius);
    }

    // Додавання стилів до елементів
    function safeAddStyleToElements(selector, styles) {
        if (!elementsCache.has(selector)) {
            elementsCache.set(selector, {
                elements: document.querySelectorAll(selector),
                styled: false
            });
        }

        var cacheEntry = elementsCache.get(selector);
        if (cacheEntry.styled) return;

        cacheEntry.elements.forEach(function(el) {
            if (el && !el.dataset.lampaStyled) {
                Object.keys(styles).forEach(function(property) {
                    el.style.setProperty(property, styles[property], 'important');
                });
                el.dataset.lampaStyled = 'true';
            }
        });

        cacheEntry.styled = true;
    }

    // Застосування базових стилів
    function applyStyles() {
        if (stylesApplied) return;

        if (!document.body.dataset.lampaStyled) {
            document.body.style.setProperty('background', settings.colors.darkBg, 'important');
            document.body.dataset.lampaStyled = 'true';
        }

        stylesApplied = true;
    }

    // Додавання CSS-стилів
    function addCardStyles() {
        var styleId = 'lampa-safe-css';
        var style = document.getElementById(styleId);
        if (style) style.remove();

        var positionStyles = '';
        switch (settings.vote.votePosition) {
            case 'top-right':
                positionStyles = 'top: 0; right: 0em; bottom: auto; left: auto;';
                break;
            case 'top-left':
                positionStyles = 'top: 0; left: 0em; bottom: auto; right: auto;';
                break;
            case 'bottom-right':
                positionStyles = 'bottom: 0; right: 0em; top: auto; left: auto;';
                break;
            case 'bottom-left':
                positionStyles = 'bottom: 0; left: 0em; top: auto; right: auto;';
                break;
        }

        var fullCSS = `
            :root {
                --dark-bg: ${settings.colors.darkBg};
                --darker-bg: ${settings.colors.darkerBg};
                --menu-bg: ${settings.colors.menuBg};
                --accent-color: ${settings.colors.accentColor};
                --card-radius: ${settings.radii.cardRadius};
                --menu-radius: ${settings.radii.menuRadius};
                --vote-background: ${settings.colors.voteBackground};
                --vote-border-radius: ${settings.radii.voteBorderRadius};
            }

            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "";
                position: absolute;
                top: -0.3em;
                left: -0.3em;
                right: -0.3em;
                bottom: -0.3em;
                border: 0.3em solid var(--accent-color);
                border-radius: var(--card-radius);
                z-index: -1;
                pointer-events: none;
                background-color: var(--accent-color);
            }

            .settings-param.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }

            .simple-button.focus {
                color: #fff;
                background: var(--accent-color);
            }

            .head__action {
                opacity: 0.80;
            }

            .full-start__rate > div:first-child {
                color: #1ed5a9;
                font-weight: ${settings.fonts.ratingWeight};
                background: none;
            }

            .torrent-serial.focus,
            .torrent-file.focus {
                background: var(--accent-color);
            }

            .torrent-item.focus::after {
                content: "";
                position: absolute;
                top: -0.5em;
                left: -0.5em;
                right: -0.5em;
                bottom: -0.5em;
                border: 0.3em solid var(--accent-color);
                border-radius: 0.7em;
                z-index: -1;
                background: var(--accent-color);
            }

            .tag-count.focus,
            .full-person.focus,
            .full-review.focus {
                color: #fff;
                background: var(--accent-color);
            }

            .navigation-bar__body {
                background: rgba(0, 0, 0, ${settings.opacity.navigationBar});
            }

            .console {
                background: var(--dark-bg);
            }

            .bookmarks-folder__layer {
                background: rgba(0, 0, 0, ${settings.opacity.bookmarksLayer});
            }

            .selector__body, .modal-layer {
                background-color: var(--dark-bg);
            }

            .menu__item.focus,
            .menu__item.traverse,
            .menu__item.hover {
                color: #fff;
                background: var(--accent-color);
            }

            .card__marker > span {
                max-width: 11em;
            }

            .menu__item.focus .menu__ico path[fill],
            .menu__item.focus .menu__ico rect[fill],
            .menu__item.focus .menu__ico circle[fill],
            .menu__item.traverse .menu__ico path[fill],
            .menu__item.traverse .menu__ico rect[fill],
            .menu__item.traverse .menu__ico circle[fill],
            .menu__item.hover .menu__ico path[fill],
            .menu__item.hover .menu__ico rect[fill],
            .menu__item.hover .menu__ico circle[fill] {
                fill: #ffffff;
            }

            .online.focus {
                box-shadow: 0 0 0 0.2em var(--accent-color);
                background: var(--accent-color);
            }

            .menu__item.focus .menu__ico [stroke],
            .menu__item.traverse .menu__ico [stroke],
            .menu__item.hover .menu__ico [stroke] {
                stroke: #ffffff;
            }

            .noty {
                color: #ffffff;
            }

            .head__action.focus {
                background: var(--accent-color);
                color: #fff;
            }

            .selector:hover {
                opacity: 0.8;
            }

            .online-prestige.focus::after {
                border: solid .3em var(--accent-color) !important;
                background-color: #871818;
            }

            .full-episode.focus::after,
            .card-episode.focus .full-episode::after {
                border: 0.3em solid var(--accent-color);
            }

            .wrap__left {
                box-shadow: 15px 0px 20px 0px var(--dark-bg) !important;
            }

            .card-more.focus .card-more__box::after {
                border: 0.3em solid var(--accent-color);
            }

            .card__type {
                background: var(--accent-color) !important;
            }

            .new-interface .card.card--wide+.card-more .card-more__box {
                background: rgba(0, 0, 0, ${settings.opacity.cardMoreBox});
            }

            .helper {
                background: var(--accent-color);
            }

            .extensions__item,
            .extensions__block-add {
                background-color: var(--menu-bg);
            }

            .extensions__item.focus:after,
            .extensions__block-empty.focus:after,
            .extensions__block-add.focus:after {
                border: 0.3em solid var(--accent-color);
            }

            .settings-input--free,
            .settings-input__content,
            .extensions {
                background-color: var(--dark-bg);
            }

            .modal__content {
                background-color: var(--darker-bg) !important;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: ${settings.shadows.modalShadow} !important;
            }

            .settings__content,
            .selectbox__content {
                position: fixed;
                right: -100%;
                display: flex;
                background: var(--darker-bg);
                top: 1em;
                left: 98%;
                max-height: calc(100vh - 2em);
                border-radius: var(--menu-radius);
                padding: 0.5em;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
            }

            .card-more__box {
                background: rgba(0, 0, 0, ${settings.opacity.cardMoreBox});
            }

            .items-line__more.focus {
                background-color: var(--accent-color);
                color: #fff;
            }

            .settings__title,
            .selectbox__title {
                font-size: ${settings.fonts.titleSize};
                font-weight: 300;
                text-align: center;
            }

            .scroll--mask {
                -webkit-mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
                mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
            }

            .full-start__button.focus {
                color: white !important;
                background: var(--accent-color) !important;
            }

            .menu__item {
                border-radius: 0em 15em 14em 0em;
            }

            .menu__list {
                padding-left: 0;
            }

            ${settings.animations.advancedAnimation ? '' : `
            body.advanced--animation .head .head__action.focus,
            body.advanced--animation .head .head__action.hover,
            body.advanced--animation .menu .menu__item.focus,
            body.advanced--animation .menu .menu__item.hover,
            body.advanced--animation .full-start__button.focus,
            body.advanced--animation .full-start__button.hover,
            body.advanced--animation .simple-button.focus,
            body.advanced--animation .simple-button.hover,
            body.advanced--animation .full-descr__tag.focus,
            body.advanced--animation .full-descr__tag.hover,
            body.advanced--animation .tag-count.focus,
            body.advanced--animation .tag-count.hover,
            body.advanced--animation .full-review.focus,
            body.advanced--animation .full-review.hover,
            body.advanced--animation .full-review-add.focus,
            body.advanced--animation .full-review-add.hover {
                animation: none !important;
            }
            `}

            .full-review-add.focus::after {
                border: 0.3em solid var(--accent-color);
            }

            .explorer__left {
                display: none;
            }

            .explorer__files {
                width: 100%;
            }

            .notification-item {
                border: 2px solid var(--accent-color) !important;
            }

            .notification-date {
                background: var(--accent-color) !important;
            }

            .card__quality {
                color: #fff;
                background: var(--accent-color) !important;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                align-items: center;
            }

            .noty__body {
                box-shadow: 0 -2px 6px rgb(22 22 22 / 50%);
                background: var(--accent-color);
            }

            .card__title {
                text-align: center;
                font-size: 1.2em;
                line-height: 1.1;
            }

            .background__one.visible, .background__two.visible {
                opacity: 0;
            }

            .card__age {
                text-align: center;
                color: #ffffff7a;
            }

            body {
                margin: 1 !important;
            }

            .card__vote {
                position: absolute;
                ${positionStyles}
                background: var(--vote-background);
                color: #ffffff;
                font-size: ${settings.fonts.voteFontSize};
                font-weight: 700;
                padding: 0.5em;
                border-radius: var(--vote-border-radius);
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .selectbox-item.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }

            .settings-folder.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }

            body.glass--style.platform--browser .card .card__icons-inner,
            body.glass--style.platform--browser .card .card__marker,
            body.glass--style.platform--browser .card .card__vote,
            body.glass--style.platform--browser .card .card-watched,
            body.glass--style.platform--nw .card .card__icons-inner,
            body.glass--style.platform--nw .card .card__marker,
            body.glass--style.platform--nw .card .card__vote,
            body.glass--style.platform--nw .card .card-watched,
            body.glass--style.platform--apple .card .card__icons-inner,
            body.glass--style.platform--apple .card .card__marker,
            body.glass--style.platform--apple .card .card__vote,
            body.glass--style.platform--apple .card .card-watched {
                background-color: rgba(0, 0, 0, 0.3);
                -webkit-backdrop-filter: blur(1em);
                backdrop-filter: none;
                background: var(--accent-color);
            }

            @media screen and (max-width: 480px) {
                .settings__content,
                .selectbox__content {
                    left: 0 !important;
                    top: unset !important;
                    border-top-left-radius: 2em !important;
                    border-top-right-radius: 2em !important;
                }

                .ru-title-full,
                .ru-title-full:hover {
                    max-width: none !important;
                    text-align: center !important;
                }

                .full-start-new__body {
                    text-align: center !important;
                }

                .full-start-new__rate-line {
                    padding-top: 0.5em !important;
                    display: flex;
                    justify-content: center;
                    margin-bottom: 0em;
                }

                .full-start-new__tagline {
                    margin-bottom: 0.5em !important;
                    margin-top: 0.5em !important;
                }

                .full-start-new__title img {
                    object-fit: contain;
                    max-width: ${settings.mobile.maxImageWidth} !important;
                    max-height: 5em !important;
                }

                .selectbox.animate .selectbox__content,
                .settings.animate .settings__content {
                    background: var(--darker-bg);
                }
            }

            @media screen and (max-width: 580px) {
                .full-descr__text {
                    text-align: justify;
                }

                .items-line__head {
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                }

                .full-descr__details {
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                }
            }

            @media screen and (max-width: 480px) {
                .full-start-new__details > span:nth-of-type(7) {
                    display: block;
                    order: 2;
                    opacity: 40%;
                }

                .full-descr__tags {
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                }

                .items-line__more {
                    display: none;
                }

                .full-descr__info-body {
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                    display: flex;
                }

                .full-descr__details > * {
                    text-align: center;
                }
            }

            @media screen and (max-width: 580px) {
                .full-start-new__buttons {
                    overflow: auto;
                    display: flex !important;
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }

            @media screen and (max-width: 767px) {
                .full-start-new__details {
                    display: flex !important;
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }

            @media screen and (max-width: 480px) {
                .full-start-new__reactions {
                    display: flex !important;
                    justify-content: ${settings.mobile.centerAlignDetails ? 'center' : 'flex-start'} !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }
        `;

        var style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = fullCSS;
        document.head.appendChild(style);
    }

    // Інтеграція з меню Lampa
    function integrateWithLampaSettings() {
        if (typeof Lampa === 'undefined') {
            console.log("[Lampa Safe Styles] Lampa API недоступне");
            return;
        }

        Lampa.Settings.addCategory({
            id: 'lampa_safe_styles',
            name: 'Lampa Safe Styles',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>',
            items: [
                {
                    id: 'colors',
                    name: 'Кольори',
                    type: 'folder',
                    items: [
                        {
                            id: 'dark_bg',
                            name: 'Основний фон',
                            type: 'input',
                            default: settings.colors.darkBg,
                            onChange: function(value) {
                                if (isValidHexColor(value)) {
                                    settings.colors.darkBg = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    applyStyles();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'darker_bg',
                            name: 'Додатковий фон',
                            type: 'input',
                            default: settings.colors.darkerBg,
                            onChange: function(value) {
                                if (isValidHexColor(value)) {
                                    settings.colors.darkerBg = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    applyStyles();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'menu_bg',
                            name: 'Фон меню',
                            type: 'input',
                            default: settings.colors.menuBg,
                            onChange: function(value) {
                                if (isValidHexColor(value)) {
                                    settings.colors.menuBg = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    applyStyles();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'accent_color',
                            name: 'Акцентний колір',
                            type: 'input',
                            default: settings.colors.accentColor,
                            onChange: function(value) {
                                if (isValidHexColor(value)) {
                                    settings.colors.accentColor = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    applyStyles();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'vote_background',
                            name: 'Фон оцінки',
                            type: 'input',
                            default: settings.colors.voteBackground,
                            onChange: function(value) {
                                if (isValidHexColor(value)) {
                                    settings.colors.voteBackground = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    addCardStyles();
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'radii',
                    name: 'Радіуси',
                    type: 'folder',
                    items: [
                        {
                            id: 'card_radius',
                            name: 'Радіус карток',
                            type: 'input',
                            default: settings.radii.cardRadius,
                            onChange: function(value) {
                                if (isValidEm(value)) {
                                    settings.radii.cardRadius = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'menu_radius',
                            name: 'Радіус меню',
                            type: 'input',
                            default: settings.radii.menuRadius,
                            onChange: function(value) {
                                if (isValidEm(value)) {
                                    settings.radii.menuRadius = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'vote_border_radius',
                            name: 'Радіус бордера оцінки',
                            type: 'input',
                            default: settings.radii.voteBorderRadius,
                            onChange: function(value) {
                                if (isValidEm(value) || /^\d*\.?\d+em\s\d*\.?\d+em\s\d*\.?\d+em\s\d*\.?\d+em$/.test(value)) {
                                    settings.radii.voteBorderRadius = value;
                                    saveSettings();
                                    updateCSSVariables();
                                    addCardStyles();
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'opacity',
                    name: 'Прозорість',
                    type: 'folder',
                    items: [
                        {
                            id: 'navigation_bar',
                            name: 'Панель навігації',
                            type: 'input',
                            default: settings.opacity.navigationBar,
                            onChange: function(value) {
                                var num = parseFloat(value);
                                if (!isNaN(num) && num >= 0 && num <= 1) {
                                    settings.opacity.navigationBar = num;
                                    saveSettings();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'bookmarks_layer',
                            name: 'Шар закладок',
                            type: 'input',
                            default: settings.opacity.bookmarksLayer,
                            onChange: function(value) {
                                var num = parseFloat(value);
                                if (!isNaN(num) && num >= 0 && num <= 1) {
                                    settings.opacity.bookmarksLayer = num;
                                    saveSettings();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'card_more_box',
                            name: 'Блок карток',
                            type: 'input',
                            default: settings.opacity.cardMoreBox,
                            onChange: function(value) {
                                var num = parseFloat(value);
                                if (!isNaN(num) && num >= 0 && num <= 1) {
                                    settings.opacity.cardMoreBox = num;
                                    saveSettings();
                                    addCardStyles();
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'vote',
                    name: 'Оцінка',
                    type: 'folder',
                    items: [
                        {
                            id: 'vote_font_size',
                            name: 'Розмір шрифту оцінки',
                            type: 'input',
                            default: settings.fonts.voteFontSize,
                            onChange: function(value) {
                                if (isValidEm(value)) {
                                    settings.fonts.voteFontSize = value;
                                    saveSettings();
                                    addCardStyles();
                                }
                            }
                        },
                        {
                            id: 'vote_position',
                            name: 'Позиція оцінки',
                            type: 'select',
                            options: [
                                { value: 'top-right', name: 'Верхній правий' },
                                { value: 'top-left', name: 'Верхній лівий' },
                                { value: 'bottom-right', name: 'Нижній правий' },
                                { value: 'bottom-left', name: 'Нижній лівий' }
                            ],
                            default: settings.vote.votePosition,
                            onChange: function(value) {
                                if (isValidVotePosition(value)) {
                                    settings.vote.votePosition = value;
                                    saveSettings();
                                    addCardStyles();
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'reset',
                    name: 'Скинути налаштування',
                    type: 'button',
                    onClick: function() {
                        settings = JSON.parse(JSON.stringify(defaultSettings));
                        saveSettings();
                        updateCSSVariables();
                        applyStyles();
                        addCardStyles();
                    }
                },
                {
                    id: 'factory_reset',
                    name: 'Заводські налаштування',
                    type: 'button',
                    onClick: function() {
                        settings = JSON.parse(JSON.stringify(defaultSettings));
                        saveSettings();
                        updateCSSVariables();
                        applyStyles();
                        addCardStyles();
                        console.log("[Lampa Safe Styles] Заводські налаштування відновлено");
                    }
                }
            ]
        });
    }

    // Оптимізований спостерігач за DOM
    var observer = new MutationObserver(function() {
        if (!stylesApplied) {
            requestAnimationFrame(applyStyles);
        }
    });

    // Ініціалізація
    function init() {
        loadSettings();
        updateCSSVariables();
        applyStyles();
        addCardStyles();
        integrateWithLampaSettings();

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        var backupInterval = setInterval(function() {
            if (!stylesApplied) applyStyles();
        }, 30000);

        window.stopLampaSafeStyles = function() {
            clearInterval(backupInterval);
            observer.disconnect();

            var style = document.getElementById('lampa-safe-css');
            if (style) style.remove();

            document.querySelectorAll('[data-lampa-styled]').forEach(function(el) {
                el.removeAttribute('data-lampa-styled');
            });

            elementsCache.clear();
            stylesApplied = false;

            console.log("[Lampa Safe Styles] Плагін зупинено");
        };
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
