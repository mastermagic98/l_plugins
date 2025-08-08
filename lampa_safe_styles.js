(function() {
    // Кеш елементів для оптимізації
    var elementsCache = new Map();
    var stylesApplied = false;

    // Значення за замовчуванням для всіх параметрів
    var paramDefaults = {
        lss_dark_bg: '#141414',
        lss_darker_bg: '#1a1a1a',
        lss_menu_bg: '#181818',
        lss_accent_color: '#c22222',
        lss_vote_background: '#c22222',
        lss_card_radius: '1.4em',
        lss_menu_radius: '1.2em',
        lss_vote_border_radius: '0em 0.5em 0em 0.5em',
        lss_navigation_bar: 0.3,
        lss_bookmarks_layer: 0.3,
        lss_card_more_box: 0.3,
        lss_title_size: '2.5em',
        lss_rating_weight: 'bold',
        lss_vote_font_size: '1.5em',
        lss_modal_shadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        lss_advanced_animation: true,
        lss_center_align_details: true,
        lss_max_image_width: '10em',
        lss_vote_position: 'top-right'
    };

    // Функція валідації HEX-коду кольору
    function isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // Функція валідації значення em
    function isValidEm(value) {
        return /^\d*\.?\d+em$/.test(value) || /^\d*\.?\d+em\s\d*\.?\d+em\s\d*\.?\d+em\s\d*\.?\d+em$/.test(value);
    }

    // Функція валідації прозорості
    function isValidOpacity(value) {
        var num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 1;
    }

    // Функція валідації позиції оцінки
    function isValidVotePosition(value) {
        return ['top-right', 'top-left', 'bottom-right', 'bottom-left'].indexOf(value) !== -1;
    }

    // Функція валідації ваги шрифту
    function isValidFontWeight(value) {
        return ['normal', 'bold'].indexOf(value) !== -1;
    }

    // Функція валідації тіні
    function isValidShadow(value) {
        return /^0\s+\d+px\s+\d+px\s+rgba\(\d+,\s*\d+,\s*\d+,\s*0\.\d+\)$/.test(value);
    }

    // Функція забезпечення валідності всіх налаштувань
    function ensureValidSettings() {
        var params = [
            { key: 'lss_dark_bg', validate: isValidHexColor, default: paramDefaults.lss_dark_bg },
            { key: 'lss_darker_bg', validate: isValidHexColor, default: paramDefaults.lss_darker_bg },
            { key: 'lss_menu_bg', validate: isValidHexColor, default: paramDefaults.lss_menu_bg },
            { key: 'lss_accent_color', validate: isValidHexColor, default: paramDefaults.lss_accent_color },
            { key: 'lss_vote_background', validate: isValidHexColor, default: paramDefaults.lss_vote_background },
            { key: 'lss_card_radius', validate: isValidEm, default: paramDefaults.lss_card_radius },
            { key: 'lss_menu_radius', validate: isValidEm, default: paramDefaults.lss_menu_radius },
            { key: 'lss_vote_border_radius', validate: isValidEm, default: paramDefaults.lss_vote_border_radius },
            { key: 'lss_navigation_bar', validate: isValidOpacity, default: paramDefaults.lss_navigation_bar },
            { key: 'lss_bookmarks_layer', validate: isValidOpacity, default: paramDefaults.lss_bookmarks_layer },
            { key: 'lss_card_more_box', validate: isValidOpacity, default: paramDefaults.lss_card_more_box },
            { key: 'lss_title_size', validate: isValidEm, default: paramDefaults.lss_title_size },
            { key: 'lss_rating_weight', validate: isValidFontWeight, default: paramDefaults.lss_rating_weight },
            { key: 'lss_vote_font_size', validate: isValidEm, default: paramDefaults.lss_vote_font_size },
            { key: 'lss_modal_shadow', validate: isValidShadow, default: paramDefaults.lss_modal_shadow },
            { key: 'lss_advanced_animation', validate: function(v) { return typeof v === 'boolean'; }, default: paramDefaults.lss_advanced_animation },
            { key: 'lss_center_align_details', validate: function(v) { return typeof v === 'boolean'; }, default: paramDefaults.lss_center_align_details },
            { key: 'lss_max_image_width', validate: isValidEm, default: paramDefaults.lss_max_image_width },
            { key: 'lss_vote_position', validate: isValidVotePosition, default: paramDefaults.lss_vote_position }
        ];

        params.forEach(function(param) {
            var value = Lampa.Storage.get(param.key);
            if (value === null || !param.validate(value)) {
                Lampa.Storage.set(param.key, param.default);
            }
        });
    }

    // Функція оновлення CSS-перемінних
    function updateCSSVariables() {
        var root = document.documentElement;
        root.style.setProperty('--dark-bg', Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg));
        root.style.setProperty('--darker-bg', Lampa.Storage.get('lss_darker_bg', paramDefaults.lss_darker_bg));
        root.style.setProperty('--menu-bg', Lampa.Storage.get('lss_menu_bg', paramDefaults.lss_menu_bg));
        root.style.setProperty('--accent-color', Lampa.Storage.get('lss_accent_color', paramDefaults.lss_accent_color));
        root.style.setProperty('--card-radius', Lampa.Storage.get('lss_card_radius', paramDefaults.lss_card_radius));
        root.style.setProperty('--menu-radius', Lampa.Storage.get('lss_menu_radius', paramDefaults.lss_menu_radius));
        root.style.setProperty('--vote-background', Lampa.Storage.get('lss_vote_background', paramDefaults.lss_vote_background));
        root.style.setProperty('--vote-border-radius', Lampa.Storage.get('lss_vote_border_radius', paramDefaults.lss_vote_border_radius));
        root.style.setProperty('--navigation-bar-opacity', Lampa.Storage.get('lss_navigation_bar', paramDefaults.lss_navigation_bar));
        root.style.setProperty('--bookmarks-layer-opacity', Lampa.Storage.get('lss_bookmarks_layer', paramDefaults.lss_bookmarks_layer));
        root.style.setProperty('--card-more-box-opacity', Lampa.Storage.get('lss_card_more_box', paramDefaults.lss_card_more_box));
        root.style.setProperty('--title-size', Lampa.Storage.get('lss_title_size', paramDefaults.lss_title_size));
        root.style.setProperty('--rating-weight', Lampa.Storage.get('lss_rating_weight', paramDefaults.lss_rating_weight));
        root.style.setProperty('--vote-font-size', Lampa.Storage.get('lss_vote_font_size', paramDefaults.lss_vote_font_size));
        root.style.setProperty('--modal-shadow', Lampa.Storage.get('lss_modal_shadow', paramDefaults.lss_modal_shadow));
        root.style.setProperty('--max-image-width', Lampa.Storage.get('lss_max_image_width', paramDefaults.lss_max_image_width));
        root.style.setProperty('--center-align-details', Lampa.Storage.get('lss_center_align_details', paramDefaults.lss_center_align_details) ? 'center' : 'flex-start');

        var votePosition = Lampa.Storage.get('lss_vote_position', paramDefaults.lss_vote_position);
        switch (votePosition) {
            case 'top-right':
                root.style.setProperty('--vote-top', '0');
                root.style.setProperty('--vote-right', '0em');
                root.style.setProperty('--vote-bottom', 'auto');
                root.style.setProperty('--vote-left', 'auto');
                break;
            case 'top-left':
                root.style.setProperty('--vote-top', '0');
                root.style.setProperty('--vote-left', '0em');
                root.style.setProperty('--vote-bottom', 'auto');
                root.style.setProperty('--vote-right', 'auto');
                break;
            case 'bottom-right':
                root.style.setProperty('--vote-bottom', '0');
                root.style.setProperty('--vote-right', '0em');
                root.style.setProperty('--vote-top', 'auto');
                root.style.setProperty('--vote-left', 'auto');
                break;
            case 'bottom-left':
                root.style.setProperty('--vote-bottom', '0');
                root.style.setProperty('--vote-left', '0em');
                root.style.setProperty('--vote-top', 'auto');
                root.style.setProperty('--vote-right', 'auto');
                break;
        }
    }

    // Функція застосування базових стилів
    function applyStyles() {
        if (stylesApplied) return;

        if (!document.body.dataset.lampaStyled) {
            document.body.style.setProperty('background', Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg), 'important');
            document.body.dataset.lampaStyled = 'true';
        }

        // Додавання CSS-файлу з віддаленої адреси
        var styleId = 'lampa-safe-css';
        var existingStyle = document.getElementById(styleId);
        if (!existingStyle) {
            var link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = 'https://mastermagic98.github.io/l_plugins/lampa_safe_styles.css';
            document.head.appendChild(link);
        }

        stylesApplied = true;
    }

    // Функція скидання до заводських налаштувань
    function resetToFactorySettings() {
        Object.keys(paramDefaults).forEach(function(key) {
            Lampa.Storage.set(key, paramDefaults[key]);
        });
        updateCSSVariables();
        applyStyles();
        Lampa.Noty.show('Налаштування скинуто до заводських.');
    }

    // Функція скидання до стандартних налаштувань
    function resetToDefaultSettings() {
        var defaultSettings = {
            lss_dark_bg: '#141414',
            lss_darker_bg: '#1a1a1a',
            lss_menu_bg: '#181818',
            lss_accent_color: '#c22222',
            lss_vote_background: '#c22222',
            lss_card_radius: '1.4em',
            lss_menu_radius: '1.2em',
            lss_vote_border_radius: '0em 0.5em 0em 0.5em',
            lss_navigation_bar: 0.3,
            lss_bookmarks_layer: 0.3,
            lss_card_more_box: 0.3,
            lss_title_size: '2.5em',
            lss_rating_weight: 'bold',
            lss_vote_font_size: '1.5em',
            lss_modal_shadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            lss_advanced_animation: true,
            lss_center_align_details: true,
            lss_max_image_width: '10em',
            lss_vote_position: 'top-right'
        };

        Object.keys(defaultSettings).forEach(function(key) {
            Lampa.Storage.set(key, defaultSettings[key]);
        });
        updateCSSVariables();
        applyStyles();
        Lampa.Noty.show('Налаштування скинуто до стандартних.');
    }

    // Додавання компонента налаштувань
    function addSettingsComponent() {
        if (typeof Lampa === 'undefined' || !Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') {
            console.log('Lampa.SettingsApi.addComponent недоступний');
            return;
        }

        // Додавання компонента
        console.log('Додаємо компонент: lampa_safe_styles');
        Lampa.SettingsApi.addComponent({
            component: 'lampa_safe_styles',
            name: 'Lampa Safe Styles',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
            order: 100
        });

        // Універсальна функція для додавання параметрів
        function safeAddParam(config) {
            if (typeof Lampa.SettingsApi.addParam !== 'function') {
                console.log('Lampa.SettingsApi.addParam недоступний для параметра: ' + config.param.name);
                return;
            }

            try {
                console.log('Додаємо параметр:', config.param.name);
                Lampa.SettingsApi.addParam({
                    param: {
                        component: config.component || 'lampa_safe_styles',
                        name: config.param.name,
                        title: config.param.title || config.param.name,
                        type: config.param.type,
                        default: config.param.default,
                        placeholder: config.param.placeholder || '',
                        values: config.param.values || {},
                        onChange: config.param.onChange || function() {},
                        action: config.param.action || function() {}
                    }
                });
            } catch (e) {
                console.error('Помилка додавання параметра ' + config.param.name + ':', e.message);
            }
        }

        // Додавання параметрів (без категорій)
        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'dark_bg',
                title: 'Темний фон',
                type: 'input',
                placeholder: '#141414',
                default: Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg),
                onChange: function(value) {
                    if (isValidHexColor(value)) {
                        Lampa.Storage.set('lss_dark_bg', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_dark_bg', paramDefaults.lss_dark_bg);
                        Lampa.Noty.show('Невалідний HEX-код кольору. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'darker_bg',
                title: 'Темніший фон',
                type: 'input',
                placeholder: '#1a1a1a',
                default: Lampa.Storage.get('lss_darker_bg', paramDefaults.lss_darker_bg),
                onChange: function(value) {
                    if (isValidHexColor(value)) {
                        Lampa.Storage.set('lss_darker_bg', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_darker_bg', paramDefaults.lss_darker_bg);
                        Lampa.Noty.show('Невалідний HEX-код кольору. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'menu_bg',
                title: 'Фон меню',
                type: 'input',
                placeholder: '#181818',
                default: Lampa.Storage.get('lss_menu_bg', paramDefaults.lss_menu_bg),
                onChange: function(value) {
                    if (isValidHexColor(value)) {
                        Lampa.Storage.set('lss_menu_bg', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_menu_bg', paramDefaults.lss_menu_bg);
                        Lampa.Noty.show('Невалідний HEX-код кольору. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'accent_color',
                title: 'Акцентний колір',
                type: 'input',
                placeholder: '#c22222',
                default: Lampa.Storage.get('lss_accent_color', paramDefaults.lss_accent_color),
                onChange: function(value) {
                    if (isValidHexColor(value)) {
                        Lampa.Storage.set('lss_accent_color', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_accent_color', paramDefaults.lss_accent_color);
                        Lampa.Noty.show('Невалідний HEX-код кольору. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'vote_background',
                title: 'Фон оцінки',
                type: 'input',
                placeholder: '#c22222',
                default: Lampa.Storage.get('lss_vote_background', paramDefaults.lss_vote_background),
                onChange: function(value) {
                    if (isValidHexColor(value)) {
                        Lampa.Storage.set('lss_vote_background', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_vote_background', paramDefaults.lss_vote_background);
                        Lampa.Noty.show('Невалідний HEX-код кольору. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'card_radius',
                title: 'Радіус картки',
                type: 'input',
                placeholder: '1.4em',
                default: Lampa.Storage.get('lss_card_radius', paramDefaults.lss_card_radius),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_card_radius', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_card_radius', paramDefaults.lss_card_radius);
                        Lampa.Noty.show('Невалідне значення радіусу. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'menu_radius',
                title: 'Радіус меню',
                type: 'input',
                placeholder: '1.2em',
                default: Lampa.Storage.get('lss_menu_radius', paramDefaults.lss_menu_radius),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_menu_radius', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_menu_radius', paramDefaults.lss_menu_radius);
                        Lampa.Noty.show('Невалідне значення радіусу. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'vote_border_radius',
                title: 'Радіус оцінки',
                type: 'input',
                placeholder: '0em 0.5em 0em 0.5em',
                default: Lampa.Storage.get('lss_vote_border_radius', paramDefaults.lss_vote_border_radius),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_vote_border_radius', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_vote_border_radius', paramDefaults.lss_vote_border_radius);
                        Lampa.Noty.show('Невалідне значення радіусу. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'navigation_bar',
                title: 'Прозорість панелі навігації',
                type: 'input',
                placeholder: '0.3',
                default: Lampa.Storage.get('lss_navigation_bar', paramDefaults.lss_navigation_bar),
                onChange: function(value) {
                    if (isValidOpacity(value)) {
                        Lampa.Storage.set('lss_navigation_bar', parseFloat(value));
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_navigation_bar', paramDefaults.lss_navigation_bar);
                        Lampa.Noty.show('Невалідне значення прозорості. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'bookmarks_layer',
                title: 'Прозорість закладок',
                type: 'input',
                placeholder: '0.3',
                default: Lampa.Storage.get('lss_bookmarks_layer', paramDefaults.lss_bookmarks_layer),
                onChange: function(value) {
                    if (isValidOpacity(value)) {
                        Lampa.Storage.set('lss_bookmarks_layer', parseFloat(value));
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_bookmarks_layer', paramDefaults.lss_bookmarks_layer);
                        Lampa.Noty.show('Невалідне значення прозорості. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'card_more_box',
                title: 'Прозорість блоку "Більше"',
                type: 'input',
                placeholder: '0.3',
                default: Lampa.Storage.get('lss_card_more_box', paramDefaults.lss_card_more_box),
                onChange: function(value) {
                    if (isValidOpacity(value)) {
                        Lampa.Storage.set('lss_card_more_box', parseFloat(value));
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_card_more_box', paramDefaults.lss_card_more_box);
                        Lampa.Noty.show('Невалідне значення прозорості. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'title_size',
                title: 'Розмір заголовка',
                type: 'input',
                placeholder: '2.5em',
                default: Lampa.Storage.get('lss_title_size', paramDefaults.lss_title_size),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_title_size', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_title_size', paramDefaults.lss_title_size);
                        Lampa.Noty.show('Невалідне значення розміру шрифту. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'rating_weight',
                title: 'Вага шрифту оцінки',
                type: 'select',
                values: {
                    'normal': 'Нормальний',
                    'bold': 'Жирний'
                },
                default: Lampa.Storage.get('lss_rating_weight', paramDefaults.lss_rating_weight),
                onChange: function(value) {
                    if (isValidFontWeight(value)) {
                        Lampa.Storage.set('lss_rating_weight', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_rating_weight', paramDefaults.lss_rating_weight);
                        Lampa.Noty.show('Невалідне значення ваги шрифту. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'vote_font_size',
                title: 'Розмір шрифту оцінки',
                type: 'input',
                placeholder: '1.5em',
                default: Lampa.Storage.get('lss_vote_font_size', paramDefaults.lss_vote_font_size),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_vote_font_size', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_vote_font_size', paramDefaults.lss_vote_font_size);
                        Lampa.Noty.show('Невалідне значення розміру шрифту. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'modal_shadow',
                title: 'Тінь модального вікна',
                type: 'input',
                placeholder: '0 4px 12px rgba(0, 0, 0, 0.5)',
                default: Lampa.Storage.get('lss_modal_shadow', paramDefaults.lss_modal_shadow),
                onChange: function(value) {
                    if (isValidShadow(value)) {
                        Lampa.Storage.set('lss_modal_shadow', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_modal_shadow', paramDefaults.lss_modal_shadow);
                        Lampa.Noty.show('Невалідне значення тіні. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'advanced_animation',
                title: 'Увімкнути анімації',
                type: 'toggle',
                default: Lampa.Storage.get('lss_advanced_animation', paramDefaults.lss_advanced_animation),
                onChange: function(value) {
                    Lampa.Storage.set('lss_advanced_animation', value);
                    updateCSSVariables();
                    applyStyles();
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'center_align_details',
                title: 'Центрувати деталі',
                type: 'toggle',
                default: Lampa.Storage.get('lss_center_align_details', paramDefaults.lss_center_align_details),
                onChange: function(value) {
                    Lampa.Storage.set('lss_center_align_details', value);
                    updateCSSVariables();
                    applyStyles();
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'max_image_width',
                title: 'Максимальна ширина зображення',
                type: 'input',
                placeholder: '10em',
                default: Lampa.Storage.get('lss_max_image_width', paramDefaults.lss_max_image_width),
                onChange: function(value) {
                    if (isValidEm(value)) {
                        Lampa.Storage.set('lss_max_image_width', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_max_image_width', paramDefaults.lss_max_image_width);
                        Lampa.Noty.show('Невалідне значення ширини зображення. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'vote_position',
                title: 'Позиція оцінки',
                type: 'select',
                values: {
                    'top-right': 'Верхній правий',
                    'top-left': 'Верхній лівий',
                    'bottom-right': 'Нижній правий',
                    'bottom-left': 'Нижній лівий'
                },
                default: Lampa.Storage.get('lss_vote_position', paramDefaults.lss_vote_position),
                onChange: function(value) {
                    if (isValidVotePosition(value)) {
                        Lampa.Storage.set('lss_vote_position', value);
                        updateCSSVariables();
                        applyStyles();
                    } else {
                        Lampa.Storage.set('lss_vote_position', paramDefaults.lss_vote_position);
                        Lampa.Noty.show('Невалідне значення позиції оцінки. Скинуто до значення за замовчуванням.');
                    }
                }
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'reset_default',
                title: 'Скинути налаштування',
                type: 'trigger',
                action: resetToDefaultSettings
            }
        });

        safeAddParam({
            component: 'lampa_safe_styles',
            param: {
                name: 'reset_factory',
                title: 'Заводські налаштування',
                type: 'trigger',
                action: resetToFactorySettings
            }
        });
    }

    // Функція інтеграції з налаштуваннями Lampa
    function integrateWithLampaSettings() {
        if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) {
            console.log('Lampa.SettingsApi недоступний');
            return;
        }

        if (typeof Lampa.SettingsApi.addComponent !== 'function') {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready' && typeof Lampa.SettingsApi.addComponent === 'function') {
                    console.log('Спроба додати компонент після події ready');
                    addSettingsComponent();
                }
            });
        } else {
            addSettingsComponent();
        }
    }

    // Функція ініціалізації плагіну
    function init() {
        ensureValidSettings();
        updateCSSVariables();
        applyStyles();

        if (typeof Lampa !== 'undefined' && Lampa.Listener) {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    console.log('Подія app:ready, викликаємо integrateWithLampaSettings');
                    integrateWithLampaSettings();
                }
            });
        }
    }

    // Запуск ініціалізації
    init();
})();
