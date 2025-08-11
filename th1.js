(function() {
    'use strict';

    // Основний об'єкт плагіна
    var SafeStyle = {
        name: 'safe_style',
        version: '2.2.6',
        settings: {
            theme: 'custom_color',
            custom_color: '#c22222', // Початковий колір (Червоний)
            enabled: true // Стан плагіна (увімкнено/вимкнено)
        }
    };

    // Функція для застосування теми
    function applyTheme(theme, color) {
        // Видаляємо попередні стилі теми
        $('#interface_mod_theme').remove();

        // Якщо плагін відключений або вибрано "default", скидаємо стилі
        if (!SafeStyle.settings.enabled || theme === 'default') return;

        // Використовуємо переданий колір або збережений, якщо тема "custom_color"
        var selectedColor = (theme === 'custom_color') ? (color || SafeStyle.settings.custom_color || '#c22222') : '#c22222';

        // Код SVG для лоадера з обраним кольором
        var svgCode = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="135" height="140" fill="' + selectedColor + '">' +
            '<rect width="10" height="40" y="100" rx="6"><animate attributeName="height" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="20" y="100" rx="6"><animate attributeName="height" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="40" y="100" rx="6"><animate attributeName="height" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="60" y="100" rx="6"><animate attributeName="height" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="80" y="100" rx="6"><animate attributeName="height" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="100" y="100" rx="6"><animate attributeName="height" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="120" y="100" rx="6"><animate attributeName="height" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect></svg>');

        // Створюємо новий стиль
        var style = $('<style id="interface_mod_theme"></style>');

        // Динамічний стиль на основі вибраного кольору
        var dynamicTheme = `
            .navigation-bar__body {
                background: rgba(20, 20, 20, 0.96);
            }
            .card__quality, .card--tv .card__type {
                background: linear-gradient(to right, ${selectedColor}dd, ${selectedColor}99);
            }
            .screensaver__preload {
                background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%;
            }
            .activity__loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%;
            }
            body {
                background: linear-gradient(135deg, #1a1a1a, ${selectedColor}33);
                color: #ffffff;
            }
            .company-start.icon--broken .company-start__icon,
            .explorer-card__head-img > img,
            .bookmarks-folder__layer,
            .card-more__box,
            .card__img {
                background-color: #2a2a2a;
            }
            .search-source.focus,
            .simple-button.focus,
            .menu__item.focus,
            .menu__item.traverse,
            .menu__item.hover,
            .full-start__button.focus,
            .full-descr__tag.focus,
            .player-panel .button.focus,
            .full-person.selector.focus,
            .tag-count.selector.focus {
                background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
                color: #fff;
                box-shadow: 0 0 0.4em ${selectedColor}33;
                border-radius: 0.5em;
            }
            .selectbox-item.focus,
            .settings-folder.focus,
            .settings-param.focus {
                background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
                color: #fff;
                box-shadow: 0 0 0.4em ${selectedColor}33;
                border-radius: 0.5em 0 0 0.5em;
            }
            .full-episode.focus::after,
            .card-episode.focus .full-episode::after,
            .items-cards .selector.focus::after,
            .card-more.focus .card-more__box::after,
            .card-episode.focus .full-episode::after,
            .card-episode.hover .full-episode::after,
            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .torrent-item.focus::after,
            .online-prestige.selector.focus::after,
            .online-prestige--full.selector.focus::after,
            .explorer-card__head-img.selector.focus::after,
            .extensions__item.focus::after,
            .extensions__block-add.focus::after {
                border: 0.2em solid ${selectedColor};
                box-shadow: 0 0 0.8em ${selectedColor}33;
                border-radius: 1em;
            }
            .head__action.focus,
            .head__action.hover {
                background: linear-gradient(45deg, ${selectedColor}, ${selectedColor}cc);
            }
            .modal__content {
                background: rgba(20, 20, 20, 0.96);
                border: 0 solid rgba(20, 20, 20, 0.96);
            }
            .settings__content,
            .settings-input__content,
            .selectbox__content {
                background: rgba(20, 20, 20, 0.96);
            }
            .torrent-serial {
                background: rgba(0, 0, 0, 0.22);
                border: 0.2em solid rgba(0, 0, 0, 0.22);
            }
            .torrent-serial.focus {
                background-color: ${selectedColor}33;
                border: 0.2em solid ${selectedColor};
            }
        `;

        // Встановлюємо стиль
        style.html(dynamicTheme);
        $('head').append(style);
    }

    // Функція для оновлення видимості параметра "Колір теми"
    function updateColorVisibility(theme) {
        var colorParam = $('div[data-name="safe_style_color"]');
        if (theme === 'custom_color') {
            colorParam.addClass('visible');
        } else {
            colorParam.removeClass('visible');
        }
    }

    // Додаємо параметри до компонента safe_style
    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'safe_style',
            param: {
                name: 'safe_style_theme',
                type: 'select',
                values: {
                    custom_color: 'Користувацька',
                    default: 'LAMPA'
                },
                default: 'custom_color'
            },
            field: {
                name: Lampa.Lang.translate('Тема'),
                description: 'Виберіть тему для інтерфейсу'
            },
            onChange: function(value) {
                SafeStyle.settings.theme = value;
                Lampa.Storage.set('safe_style_theme', value);
                Lampa.Settings.update();
                applyTheme(value);
                updateColorVisibility(value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'safe_style',
            param: {
                name: 'safe_style_color',
                type: 'select',
                values: {
                    '#c22222': 'Червоний',
                    '#b0b0b0': 'Світло-сірий',
                    '#ffeb3b': 'Жовтий',
                    '#4d7cff': 'Синій',
                    '#a64dff': 'Пурпурний',
                    '#ff9f4d': 'Помаранчевий',
                    '#3da18d': 'М’ятний',
                    '#4caf50': 'Зелений',
                    '#ff69b4': 'Рожевий',
                    '#6a1b9a': 'Фіолетовий',
                    '#26a69a': 'Бірюзовий'
                },
                default: '#c22222'
            },
            field: {
                name: Lampa.Lang.translate('Колір теми'),
                description: 'Виберіть колір для користувацької теми'
            },
            onChange: function(value) {
                SafeStyle.settings.custom_color = value;
                Lampa.Storage.set('safe_style_color', value);
                Lampa.Settings.update();
                if (SafeStyle.settings.theme === 'custom_color') {
                    applyTheme('custom_color', value);
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'safe_style',
            param: {
                name: 'safe_style_enabled',
                type: 'toggle',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('Увімкнути плагін'),
                description: 'Увімкнути або вимкнути плагін тем'
            },
            onChange: function(value) {
                SafeStyle.settings.enabled = value;
                Lampa.Storage.set('safe_style_enabled', value);
                Lampa.Settings.update();
                applyTheme(SafeStyle.settings.theme);
            }
        });
    }

    // Ініціалізація видимості параметра "Колір теми" при відкритті налаштувань
    Lampa.Settings.listener.follow('open', function(e) {
        if (e.name === 'safe_style') {
            updateColorVisibility(SafeStyle.settings.theme);
        }
    });

    // Функція для ініціалізації плагіна з перевіркою готовності
    function initPlugin() {
        if (Lampa.SettingsApi && Lampa.Template) {
            AddIn();
            applyTheme(SafeStyle.settings.theme);
        } else {
            // Повторюємо спробу через 100 мс, якщо SettingsApi або Template ще не готові
            setTimeout(initPlugin, 100);
        }
    }

    // Ініціалізація плагіна
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Завантажуємо збережені налаштування
            SafeStyle.settings.theme = Lampa.Storage.get('safe_style_theme', 'custom_color');
            SafeStyle.settings.custom_color = Lampa.Storage.get('safe_style_color', '#c22222');
            SafeStyle.settings.enabled = Lampa.Storage.get('safe_style_enabled', true);

            // Ініціалізуємо плагін
            initPlugin();
        }
    });
})();
