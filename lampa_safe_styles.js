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

    // Додавання компонента налаштувань через API
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
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v-.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
            order: 100
        });

        // Перевірка, чи компонент додався
        if (typeof Lampa.SettingsApi.getComponent === 'function') {
            var component = Lampa.SettingsApi.getComponent('lampa_safe_styles');
            console.log('Компонент lampa_safe_styles:', component);
            if (!component) {
                console.log('Компонент lampa_safe_styles не знайдено, повторна спроба через 500 мс');
                setTimeout(addSettingsComponent, 500);
                return;
            }
        }
    }

    // Додавання параметрів через DOM
    function addSettingsParamsToDOM() {
        // Знаходимо контейнер налаштувань
        var settingsContainer = document.querySelector('.settings');
        if (!settingsContainer) {
            console.log('Контейнер .settings не знайдено');
            return;
        }

        // Створюємо або знаходимо контейнер для lampa_safe_styles
        var folderElement = document.querySelector('[data-component="lampa_safe_styles"]');
        if (!folderElement) {
            console.log('Створюємо .settings-folder для lampa_safe_styles');
            folderElement = document.createElement('div');
            folderElement.className = 'settings-folder selector';
            folderElement.setAttribute('data-component', 'lampa_safe_styles');
            folderElement.innerHTML = '<div class="settings-folder__icon"></div><div class="settings-folder__name">Lampa Safe Styles</div>';
            settingsContainer.appendChild(folderElement);
        }
        console.log('Перевірка DOM елемента lampa_safe_styles:', folderElement);

        // Додавання параметра: Темний фон (input)
        var darkBgParam = document.createElement('div');
        darkBgParam.className = 'settings-param selector';
        darkBgParam.setAttribute('data-name', 'dark_bg');
        darkBgParam.setAttribute('data-type', 'input');
        darkBgParam.innerHTML = '<div class="settings-param__name">Темний фон</div><div class="settings-param__value"><input type="text" value="' + Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg) + '"></div>';
        folderElement.appendChild(darkBgParam);

        // Обробник для input
        var darkBgInput = darkBgParam.querySelector('input');
        darkBgInput.addEventListener('change', function(e) {
            var value = e.target.value;
            if (isValidHexColor(value)) {
                Lampa.Storage.set('lss_dark_bg', value);
                updateCSSVariables();
                Lampa.Noty.show('Темний фон оновлено: ' + value);
            } else {
                Lampa.Noty.show('Невалідний HEX-код кольору');
                e.target.value = Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg);
            }
        });

        // Додавання параметра: Увімкнути анімації (toggle)
        var animationParam = document.createElement('div');
        animationParam.className = 'settings-param selector';
        animationParam.setAttribute('data-name', 'advanced_animation');
        animationParam.setAttribute('data-type', 'toggle');
        var isAnimationEnabled = Lampa.Storage.get('lss_advanced_animation', paramDefaults.lss_advanced_animation);
        animationParam.innerHTML = '<div class="settings-param__name">Увімкнути анімації</div><div class="settings-param__value"><div class="settings-param__status ' + (isAnimationEnabled ? 'active' : '') + '"></div></div>';
        folderElement.appendChild(animationParam);

        // Обробник для toggle
        animationParam.addEventListener('click', function() {
            var status = animationParam.querySelector('.settings-param__status');
            var currentValue = Lampa.Storage.get('lss_advanced_animation', paramDefaults.lss_advanced_animation);
            Lampa.Storage.set('lss_advanced_animation', !currentValue);
            status.className = 'settings-param__status ' + (!currentValue ? 'active' : '');
            updateCSSVariables();
            Lampa.Noty.show('Анімації ' + (!currentValue ? 'увімкнено' : 'вимкнено'));
        });

        // Додавання параметра: Скинути налаштування (trigger)
        var resetParam = document.createElement('div');
        resetParam.className = 'settings-param selector';
        resetParam.setAttribute('data-name', 'reset_default');
        resetParam.setAttribute('data-type', 'trigger');
        resetParam.innerHTML = '<div class="settings-param__name">Скинути налаштування</div>';
        folderElement.appendChild(resetParam);

        // Обробник для trigger
        resetParam.addEventListener('click', function() {
            resetToDefaultSettings();
        });

        // Логування всіх створених елементів
        console.log('Додано параметри до DOM:', document.querySelectorAll('.settings-param[data-name]'));

        // Спроба оновлення UI
        if (typeof Lampa.Settings.render === 'function') {
            console.log('Оновлюємо UI через Settings.render');
            Lampa.Settings.render();
            setTimeout(function() {
                console.log('Повторне оновлення UI через 500 мс');
                Lampa.Settings.render();
            }, 500);
        }
    }

    // Функція інтеграції з налаштуваннями Lampa
    function integrateWithLampaSettings() {
        if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) {
            console.log('Lampa.SettingsApi недоступний');
            return;
        }

        if (typeof Lampa.SettingsApi.addComponent !== 'function') {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    console.log('Спроба додати компонент після події ready');
                    setTimeout(addSettingsComponent, 1000);
                }
            });
            return;
        }

        // Додавання компонента з затримкою
        console.log('Викликаємо addSettingsComponent із затримкою');
        setTimeout(addSettingsComponent, 1000);

        // Додавання параметрів до DOM після події app:ready
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('Додаємо параметри до DOM після app:ready');
                setTimeout(addSettingsParamsToDOM, 1500);
            }
        });

        // Логування всіх подій settings:open
        if (typeof Lampa.Settings !== 'undefined' && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', function(e) {
                console.log('Подія settings:open, e.name:', e.name);
                if (e.name === 'lampa_safe_styles') {
                    console.log('Відкрито lampa_safe_styles, перевіряємо DOM');
                    addSettingsParamsToDOM();
                }
            });
        } else {
            console.log('Lampa.Settings.listener недоступний');
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
