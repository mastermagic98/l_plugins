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
        updateDOMParams();
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
        updateDOMParams();
        Lampa.Noty.show('Налаштування скинуто до стандартних.');
    }

    // Функція вимкнення плагіну
    function disablePlugin() {
        var folderElement = document.querySelector('[data-component="lampa_safe_styles"]');
        if (folderElement) {
            folderElement.remove();
            console.log('Плагін lampa_safe_styles видалено з DOM');
        }
        // Скидання всіх стилів до стандартних
        var root = document.documentElement;
        Object.keys(paramDefaults).forEach(function(key) {
            root.style.removeProperty('--' + key.replace('lss_', ''));
        });
        document.body.removeAttribute('data-lampa-styled');
        stylesApplied = false;
        Lampa.Noty.show('Плагін вимкнено.');
    }

    // Функція оновлення значень у DOM
    function updateDOMParams() {
        var darkBgInput = document.querySelector('.settings-param[data-name="dark_bg"] input');
        if (darkBgInput) {
            darkBgInput.value = Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg);
        }

        var animationStatus = document.querySelector('.settings-param[data-name="advanced_animation"] .settings-param__status');
        if (animationStatus) {
            var isEnabled = Lampa.Storage.get('lss_advanced_animation', paramDefaults.lss_advanced_animation);
            animationStatus.className = 'settings-param__status ' + (isEnabled ? 'active' : '');
        }

        var darkerBgInput = document.querySelector('.settings-param[data-name="darker_bg"] input');
        if (darkerBgInput) {
            darkerBgInput.value = Lampa.Storage.get('lss_darker_bg', paramDefaults.lss_darker_bg);
        }

        var menuBgInput = document.querySelector('.settings-param[data-name="menu_bg"] input');
        if (menuBgInput) {
            menuBgInput.value = Lampa.Storage.get('lss_menu_bg', paramDefaults.lss_menu_bg);
        }

        var accentColorInput = document.querySelector('.settings-param[data-name="accent_color"] input');
        if (accentColorInput) {
            accentColorInput.value = Lampa.Storage.get('lss_accent_color', paramDefaults.lss_accent_color);
        }

        var voteBgInput = document.querySelector('.settings-param[data-name="vote_background"] input');
        if (voteBgInput) {
            voteBgInput.value = Lampa.Storage.get('lss_vote_background', paramDefaults.lss_vote_background);
        }

        var cardRadiusInput = document.querySelector('.settings-param[data-name="card_radius"] input');
        if (cardRadiusInput) {
            cardRadiusInput.value = Lampa.Storage.get('lss_card_radius', paramDefaults.lss_card_radius);
        }

        var menuRadiusInput = document.querySelector('.settings-param[data-name="menu_radius"] input');
        if (menuRadiusInput) {
            menuRadiusInput.value = Lampa.Storage.get('lss_menu_radius', paramDefaults.lss_menu_radius);
        }

        var voteRadiusInput = document.querySelector('.settings-param[data-name="vote_border_radius"] input');
        if (voteRadiusInput) {
            voteRadiusInput.value = Lampa.Storage.get('lss_vote_border_radius', paramDefaults.lss_vote_border_radius);
        }

        var navBarInput = document.querySelector('.settings-param[data-name="navigation_bar"] input');
        if (navBarInput) {
            navBarInput.value = Lampa.Storage.get('lss_navigation_bar', paramDefaults.lss_navigation_bar);
        }

        var bookmarksInput = document.querySelector('.settings-param[data-name="bookmarks_layer"] input');
        if (bookmarksInput) {
            bookmarksInput.value = Lampa.Storage.get('lss_bookmarks_layer', paramDefaults.lss_bookmarks_layer);
        }

        var cardMoreInput = document.querySelector('.settings-param[data-name="card_more_box"] input');
        if (cardMoreInput) {
            cardMoreInput.value = Lampa.Storage.get('lss_card_more_box', paramDefaults.lss_card_more_box);
        }

        var titleSizeInput = document.querySelector('.settings-param[data-name="title_size"] input');
        if (titleSizeInput) {
            titleSizeInput.value = Lampa.Storage.get('lss_title_size', paramDefaults.lss_title_size);
        }

        var ratingWeightSelect = document.querySelector('.settings-param[data-name="rating_weight"] select');
        if (ratingWeightSelect) {
            ratingWeightSelect.value = Lampa.Storage.get('lss_rating_weight', paramDefaults.lss_rating_weight);
        }

        var voteFontSizeInput = document.querySelector('.settings-param[data-name="vote_font_size"] input');
        if (voteFontSizeInput) {
            voteFontSizeInput.value = Lampa.Storage.get('lss_vote_font_size', paramDefaults.lss_vote_font_size);
        }

        var modalShadowInput = document.querySelector('.settings-param[data-name="modal_shadow"] input');
        if (modalShadowInput) {
            modalShadowInput.value = Lampa.Storage.get('lss_modal_shadow', paramDefaults.lss_modal_shadow);
        }

        var centerAlignStatus = document.querySelector('.settings-param[data-name="center_align_details"] .settings-param__status');
        if (centerAlignStatus) {
            var isEnabled = Lampa.Storage.get('lss_center_align_details', paramDefaults.lss_center_align_details);
            centerAlignStatus.className = 'settings-param__status ' + (isEnabled ? 'active' : '');
        }

        var maxImageWidthInput = document.querySelector('.settings-param[data-name="max_image_width"] input');
        if (maxImageWidthInput) {
            maxImageWidthInput.value = Lampa.Storage.get('lss_max_image_width', paramDefaults.lss_max_image_width);
        }

        var votePositionSelect = document.querySelector('.settings-param[data-name="vote_position"] select');
        if (votePositionSelect) {
            votePositionSelect.value = Lampa.Storage.get('lss_vote_position', paramDefaults.lss_vote_position);
        }
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
        folderElement.style.width = '100%';
        console.log('Перевірка DOM елемента lampa_safe_styles:', folderElement);

        // Додавання параметра: Темний фон (input)
        var darkBgParam = document.createElement('div');
        darkBgParam.className = 'settings-param selector';
        darkBgParam.setAttribute('data-name', 'dark_bg');
        darkBgParam.setAttribute('data-type', 'input');
        darkBgParam.style.width = '100%';
        darkBgParam.innerHTML = '<div class="settings-param__name">Темний фон</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_dark_bg', paramDefaults.lss_dark_bg) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(darkBgParam);

        // Додавання параметра: Темніший фон (input)
        var darkerBgParam = document.createElement('div');
        darkerBgParam.className = 'settings-param selector';
        darkerBgParam.setAttribute('data-name', 'darker_bg');
        darkerBgParam.setAttribute('data-type', 'input');
        darkerBgParam.style.width = '100%';
        darkerBgParam.innerHTML = '<div class="settings-param__name">Темніший фон</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_darker_bg', paramDefaults.lss_darker_bg) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(darkerBgParam);

        // Додавання параметра: Фон меню (input)
        var menuBgParam = document.createElement('div');
        menuBgParam.className = 'settings-param selector';
        menuBgParam.setAttribute('data-name', 'menu_bg');
        menuBgParam.setAttribute('data-type', 'input');
        menuBgParam.style.width = '100%';
        menuBgParam.innerHTML = '<div class="settings-param__name">Фон меню</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_menu_bg', paramDefaults.lss_menu_bg) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(menuBgParam);

        // Додавання параметра: Акцентний колір (input)
        var accentColorParam = document.createElement('div');
        accentColorParam.className = 'settings-param selector';
        accentColorParam.setAttribute('data-name', 'accent_color');
        accentColorParam.setAttribute('data-type', 'input');
        accentColorParam.style.width = '100%';
        accentColorParam.innerHTML = '<div class="settings-param__name">Акцентний колір</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_accent_color', paramDefaults.lss_accent_color) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(accentColorParam);

        // Додавання параметра: Фон оцінки (input)
        var voteBgParam = document.createElement('div');
        voteBgParam.className = 'settings-param selector';
        voteBgParam.setAttribute('data-name', 'vote_background');
        voteBgParam.setAttribute('data-type', 'input');
        voteBgParam.style.width = '100%';
        voteBgParam.innerHTML = '<div class="settings-param__name">Фон оцінки</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_vote_background', paramDefaults.lss_vote_background) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(voteBgParam);

        // Додавання параметра: Радіус картки (input)
        var cardRadiusParam = document.createElement('div');
        cardRadiusParam.className = 'settings-param selector';
        cardRadiusParam.setAttribute('data-name', 'card_radius');
        cardRadiusParam.setAttribute('data-type', 'input');
        cardRadiusParam.style.width = '100%';
        cardRadiusParam.innerHTML = '<div class="settings-param__name">Радіус картки</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_card_radius', paramDefaults.lss_card_radius) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(cardRadiusParam);

        // Додавання параметра: Радіус меню (input)
        var menuRadiusParam = document.createElement('div');
        menuRadiusParam.className = 'settings-param selector';
        menuRadiusParam.setAttribute('data-name', 'menu_radius');
        menuRadiusParam.setAttribute('data-type', 'input');
        menuRadiusParam.style.width = '100%';
        menuRadiusParam.innerHTML = '<div class="settings-param__name">Радіус меню</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_menu_radius', paramDefaults.lss_menu_radius) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(menuRadiusParam);

        // Додавання параметра: Радіус оцінки (input)
        var voteRadiusParam = document.createElement('div');
        voteRadiusParam.className = 'settings-param selector';
        voteRadiusParam.setAttribute('data-name', 'vote_border_radius');
        voteRadiusParam.setAttribute('data-type', 'input');
        voteRadiusParam.style.width = '100%';
        voteRadiusParam.innerHTML = '<div class="settings-param__name">Радіус оцінки</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_vote_border_radius', paramDefaults.lss_vote_border_radius) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(voteRadiusParam);

        // Додавання параметра: Прозорість панелі навігації (input)
        var navBarParam = document.createElement('div');
        navBarParam.className = 'settings-param selector';
        navBarParam.setAttribute('data-name', 'navigation_bar');
        navBarParam.setAttribute('data-type', 'input');
        navBarParam.style.width = '100%';
        navBarParam.innerHTML = '<div class="settings-param__name">Прозорість панелі навігації</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_navigation_bar', paramDefaults.lss_navigation_bar) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(navBarParam);

        // Додавання параметра: Прозорість закладок (input)
        var bookmarksParam = document.createElement('div');
        bookmarksParam.className = 'settings-param selector';
        bookmarksParam.setAttribute('data-name', 'bookmarks_layer');
        bookmarksParam.setAttribute('data-type', 'input');
        bookmarksParam.style.width = '100%';
        bookmarksParam.innerHTML = '<div class="settings-param__name">Прозорість закладок</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_bookmarks_layer', paramDefaults.lss_bookmarks_layer) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(bookmarksParam);

        // Додавання параметра: Прозорість блоку "Більше" (input)
        var cardMoreParam = document.createElement('div');
        cardMoreParam.className = 'settings-param selector';
        cardMoreParam.setAttribute('data-name', 'card_more_box');
        cardMoreParam.setAttribute('data-type', 'input');
        cardMoreParam.style.width = '100%';
        cardMoreParam.innerHTML = '<div class="settings-param__name">Прозорість блоку "Більше"</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_card_more_box', paramDefaults.lss_card_more_box) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(cardMoreParam);

        // Додавання параметра: Розмір заголовка (input)
        var titleSizeParam = document.createElement('div');
        titleSizeParam.className = 'settings-param selector';
        titleSizeParam.setAttribute('data-name', 'title_size');
        titleSizeParam.setAttribute('data-type', 'input');
        titleSizeParam.style.width = '100%';
        titleSizeParam.innerHTML = '<div class="settings-param__name">Розмір заголовка</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_title_size', paramDefaults.lss_title_size) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(titleSizeParam);

        // Додавання параметра: Вага шрифту оцінки (select)
        var ratingWeightParam = document.createElement('div');
        ratingWeightParam.className = 'settings-param selector';
        ratingWeightParam.setAttribute('data-name', 'rating_weight');
        ratingWeightParam.setAttribute('data-type', 'select');
        ratingWeightParam.style.width = '100%';
        ratingWeightParam.innerHTML = '<div class="settings-param__name">Вага шрифту оцінки</div><div class="settings-param__value" style="width: 50%;"><select style="width: 100%; max-width: 120px;"><option value="normal">Normal</option><option value="bold">Bold</option></select></div>';
        folderElement.appendChild(ratingWeightParam);
        var ratingWeightSelect = ratingWeightParam.querySelector('select');
        ratingWeightSelect.value = Lampa.Storage.get('lss_rating_weight', paramDefaults.lss_rating_weight);

        // Додавання параметра: Розмір шрифту оцінки (input)
        var voteFontSizeParam = document.createElement('div');
        voteFontSizeParam.className = 'settings-param selector';
        voteFontSizeParam.setAttribute('data-name', 'vote_font_size');
        voteFontSizeParam.setAttribute('data-type', 'input');
        voteFontSizeParam.style.width = '100%';
        voteFontSizeParam.innerHTML = '<div class="settings-param__name">Розмір шрифту оцінки</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_vote_font_size', paramDefaults.lss_vote_font_size) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(voteFontSizeParam);

        // Додавання параметра: Тінь модального вікна (input)
        var modalShadowParam = document.createElement('div');
        modalShadowParam.className = 'settings-param selector';
        modalShadowParam.setAttribute('data-name', 'modal_shadow');
        modalShadowParam.setAttribute('data-type', 'input');
        modalShadowParam.style.width = '100%';
        modalShadowParam.innerHTML = '<div class="settings-param__name">Тінь модального вікна</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_modal_shadow', paramDefaults.lss_modal_shadow) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(modalShadowParam);

        // Додавання параметра: Увімкнути анімації (toggle)
        var animationParam = document.createElement('div');
        animationParam.className = 'settings-param selector';
        animationParam.setAttribute('data-name', 'advanced_animation');
        animationParam.setAttribute('data-type', 'toggle');
        animationParam.style.width = '100%';
        var isAnimationEnabled = Lampa.Storage.get('lss_advanced_animation', paramDefaults.lss_advanced_animation);
        animationParam.innerHTML = '<div class="settings-param__name">Увімкнути анімації</div><div class="settings-param__value" style="width: 50%;"><div class="settings-param__status ' + (isAnimationEnabled ? 'active' : '') + '" style="width: 40px; height: 20px; border-radius: 10px; background: ' + (isAnimationEnabled ? '#c22222' : '#666') + '; transition: background 0.3s;"><div class="settings-param__status-circle" style="width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: ' + (isAnimationEnabled ? '22px' : '2px') + '; transition: left 0.3s;"></div></div></div>';
        folderElement.appendChild(animationParam);

        // Додавання параметра: Центрувати деталі (toggle)
        var centerAlignParam = document.createElement('div');
        centerAlignParam.className = 'settings-param selector';
        centerAlignParam.setAttribute('data-name', 'center_align_details');
        centerAlignParam.setAttribute('data-type', 'toggle');
        centerAlignParam.style.width = '100%';
        var isCenterAlignEnabled = Lampa.Storage.get('lss_center_align_details', paramDefaults.lss_center_align_details);
        centerAlignParam.innerHTML = '<div class="settings-param__name">Центрувати деталі</div><div class="settings-param__value" style="width: 50%;"><div class="settings-param__status ' + (isCenterAlignEnabled ? 'active' : '') + '" style="width: 40px; height: 20px; border-radius: 10px; background: ' + (isCenterAlignEnabled ? '#c22222' : '#666') + '; transition: background 0.3s;"><div class="settings-param__status-circle" style="width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: ' + (isCenterAlignEnabled ? '22px' : '2px') + '; transition: left 0.3s;"></div></div></div>';
        folderElement.appendChild(centerAlignParam);

        // Додавання параметра: Максимальна ширина зображення (input)
        var maxImageWidthParam = document.createElement('div');
        maxImageWidthParam.className = 'settings-param selector';
        maxImageWidthParam.setAttribute('data-name', 'max_image_width');
        maxImageWidthParam.setAttribute('data-type', 'input');
        maxImageWidthParam.style.width = '100%';
        maxImageWidthParam.innerHTML = '<div class="settings-param__name">Максимальна ширина зображення</div><div class="settings-param__value" style="width: 50%;"><input type="text" value="' + Lampa.Storage.get('lss_max_image_width', paramDefaults.lss_max_image_width) + '" style="width: 100%; max-width: 120px;"></div>';
        folderElement.appendChild(maxImageWidthParam);

        // Додавання параметра: Позиція оцінки (select)
        var votePositionParam = document.createElement('div');
        votePositionParam.className = 'settings-param selector';
        votePositionParam.setAttribute('data-name', 'vote_position');
        votePositionParam.setAttribute('data-type', 'select');
        votePositionParam.style.width = '100%';
        votePositionParam.innerHTML = '<div class="settings-param__name">Позиція оцінки</div><div class="settings-param__value" style="width: 50%;"><select style="width: 100%; max-width: 120px;"><option value="top-right">Верх-право</option><option value="top-left">Верх-ліво</option><option value="bottom-right">Низ-право</option><option value="bottom-left">Низ-ліво</option></select></div>';
        folderElement.appendChild(votePositionParam);
        var votePositionSelect = votePositionParam.querySelector('select');
        votePositionSelect.value = Lampa.Storage.get('lss_vote_position', paramDefaults.lss_vote_position);

        // Додавання параметра: Скинути налаштування (trigger)
        var resetDefaultParam = document.createElement('div');
        resetDefaultParam.className = 'settings-param selector';
        resetDefaultParam.setAttribute('data-name', 'reset_default');
        resetDefaultParam.setAttribute('data-type', 'trigger');
        resetDefaultParam.style.width = '100%';
        resetDefaultParam.innerHTML = '<div class="settings-param__name">Скинути налаштування</div>';
        folderElement.appendChild(resetDefaultParam);

        // Додавання параметра: Вимкнути плагін (trigger)
        var disablePluginParam = document.createElement('div');
        disablePluginParam.className = 'settings-param selector';
        disablePluginParam.setAttribute('data-name', 'disable_plugin');
        disablePluginParam.setAttribute('data-type', 'trigger');
        disablePluginParam.style.width = '100%';
        disablePluginParam.innerHTML = '<div class="settings-param__name">Вимкнути плагін</div>';
        folderElement.appendChild(disablePluginParam);

        // Додавання обробників подій через делегування
        folderElement.addEventListener('click', function(e) {
            var target = e.target.closest('.settings-param');
            if (!target) return;

            var paramName = target.getAttribute('data-name');
            var paramType = target.getAttribute('data-type');

            if (paramType === 'trigger') {
                if (paramName === 'reset_default') {
                    resetToDefaultSettings();
                } else if (paramName === 'disable_plugin') {
                    disablePlugin();
                }
            } else if (paramType === 'toggle') {
                if (paramName === 'advanced_animation' || paramName === 'center_align_details') {
                    var status = target.querySelector('.settings-param__status');
                    var currentValue = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                    Lampa.Storage.set('lss_' + paramName, !currentValue);
                    status.style.background = !currentValue ? '#c22222' : '#666';
                    status.querySelector('.settings-param__status-circle').style.left = !currentValue ? '22px' : '2px';
                    status.className = 'settings-param__status ' + (!currentValue ? 'active' : '');
                    updateCSSVariables();
                    Lampa.Noty.show((paramName === 'advanced_animation' ? 'Анімації' : 'Центрування деталей') + ' ' + (!currentValue ? 'увімкнено' : 'вимкнено'));
                }
            }
        });

        folderElement.addEventListener('change', function(e) {
            var target = e.target.closest('input, select');
            if (!target) return;

            var param = target.closest('.settings-param');
            var paramName = param.getAttribute('data-name');
            var value = target.value;

            if (paramName === 'dark_bg' || paramName === 'darker_bg' || paramName === 'menu_bg' || 
                paramName === 'accent_color' || paramName === 'vote_background') {
                if (isValidHexColor(value)) {
                    Lampa.Storage.set('lss_' + paramName, value);
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідний HEX-код кольору');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            } else if (paramName === 'card_radius' || paramName === 'menu_radius' || 
                       paramName === 'vote_border_radius' || paramName === 'title_size' || 
                       paramName === 'vote_font_size' || paramName === 'max_image_width') {
                if (isValidEm(value)) {
                    Lampa.Storage.set('lss_' + paramName, value);
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідне значення (наприклад, 1.4em)');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            } else if (paramName === 'navigation_bar' || paramName === 'bookmarks_layer' || 
                       paramName === 'card_more_box') {
                if (isValidOpacity(value)) {
                    Lampa.Storage.set('lss_' + paramName, parseFloat(value));
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідне значення (0–1)');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            } else if (paramName === 'modal_shadow') {
                if (isValidShadow(value)) {
                    Lampa.Storage.set('lss_' + paramName, value);
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідне значення тіні');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            } else if (paramName === 'rating_weight') {
                if (isValidFontWeight(value)) {
                    Lampa.Storage.set('lss_' + paramName, value);
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідне значення (normal/bold)');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            } else if (paramName === 'vote_position') {
                if (isValidVotePosition(value)) {
                    Lampa.Storage.set('lss_' + paramName, value);
                    updateCSSVariables();
                    Lampa.Noty.show(param.querySelector('.settings-param__name').textContent + ' оновлено: ' + value);
                } else {
                    Lampa.Noty.show('Невалідна позиція');
                    target.value = Lampa.Storage.get('lss_' + paramName, paramDefaults['lss_' + paramName]);
                }
            }
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
