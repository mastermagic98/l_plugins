(function () {
    'use strict';

    // --- Конфігурація плагіна ---
    var SafeStyle = {
        name: 'safe_style',
        version: '2.2.3',
        settings: {
            theme: 'custom_color',
            custom_color: '#c22222',
            enabled: true,
            show_all_buttons: false
        }
    };

    // Локалізаційна обгортка (без помилок якщо Lampa.Lang відсутній)
    function L(text) {
        try {
            if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
                return Lampa.Lang.translate(text);
            }
        } catch (e) {}
        return text;
    }

    // --- Функція застосування теми ---
    function applyTheme(theme, color) {
        try {
            // видаляємо попередній стиль, якщо є
            var prev = document.getElementById('interface_mod_theme');
            if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
        } catch (e) {}

        // Якщо плагін відключено або вибрано "default" — нічого не робимо
        if (!SafeStyle.settings.enabled || theme === 'default') return;

        var selectedColor = (theme === 'custom_color') ? (color || SafeStyle.settings.custom_color || '#c22222') : '#c22222';

        // SVG для лоадера (кодований)
        var svgSource = `<svg xmlns="http://www.w3.org/2000/svg" width="135" height="140" fill="${selectedColor}">
            <rect width="10" height="40" y="100" rx="6">
                <animate attributeName="height" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="20" y="100" rx="6">
                <animate attributeName="height" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="40" y="100" rx="6">
                <animate attributeName="height" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="60" y="100" rx="6">
                <animate attributeName="height" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="80" y="100" rx="6">
                <animate attributeName="height" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="100" y="100" rx="6">
                <animate attributeName="height" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
            <rect width="10" height="40" x="120" y="100" rx="6">
                <animate attributeName="height" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>
                <animate attributeName="y" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/>
            </rect>
        </svg>`;

        var svgCode = encodeURIComponent(svgSource);

        var dynamicCSS = `
/* SafeStyle dynamic theme */
.navigation-bar__body { background: rgba(20,20,20,0.96); }
.card__quality, .card--tv .card__type { background: linear-gradient(to right, ${selectedColor}dd, ${selectedColor}99); }
.screensaver__preload { background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%; }
.activity__loader { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%; }
body { background: linear-gradient(135deg, #1a1a1a, ${selectedColor}33); color: #ffffff; }
.company-start.icon--broken .company-start__icon, .explorer-card__head-img > img, .bookmarks-folder__layer, .card-more__box, .card__img { background-color: #2a2a2a; }
.search-source.focus, .simple-button.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .full-person.selector.focus, .tag-count.selector.focus {
    background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
    color: #fff;
    box-shadow: 0 0 0.4em ${selectedColor}33;
    border-radius: 0.5em;
}
.selectbox-item.focus, .settings-folder.focus, .settings-param.focus {
    background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
    color: #fff;
    box-shadow: 0 0 0.4em ${selectedColor}33;
    border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after, .card-episode.focus .full-episode::after, .items-cards .selector.focus::after, .card-more.focus .card-more__box::after, .card-episode.hover .full-episode::after, .card.focus .card__view::after, .card.hover .card__view::after {
    border: 0.2em solid ${selectedColor};
    box-shadow: 0 0 0.8em ${selectedColor}33;
    border-radius: 1em;
}
.head__action.focus, .head__action.hover { background: linear-gradient(45deg, ${selectedColor}, ${selectedColor}cc); }
.modal__content { background: rgba(20,20,20,0.96); border: 0 solid rgba(20,20,20,0.96); }
.settings__content, .settings-input__content, .selectbox__content { background: rgba(20,20,20,0.96); }
.torrent-serial { background: rgba(0,0,0,0.22); border: 0.2em solid rgba(0,0,0,0.22); }
.torrent-serial.focus { background-color: ${selectedColor}33; border: 0.2em solid ${selectedColor}; }
`;

        try {
            var styleEl = document.createElement('style');
            styleEl.id = 'interface_mod_theme';
            styleEl.type = 'text/css';
            styleEl.appendChild(document.createTextNode(dynamicCSS));
            document.head.appendChild(styleEl);
        } catch (e) {}
    }

    // ----------------- Управління стилем кнопок -----------------
    var _buttonObserver = null;
    var _buttonSelector = '.view--online.lampac--button';

    function applyButtonStylesToElement(el) {
        try {
            if (!el) return;
            var $el = $(el);
            if (SafeStyle.settings.show_all_buttons) {
                $el.addClass('full-start__button selector');
                $el.attr('data-safe-style', '1');
            } else {
                if ($el.attr('data-safe-style')) {
                    $el.removeClass('full-start__button selector');
                    $el.removeAttr('data-safe-style');
                }
            }
        } catch (e) {}
    }

    function applyButtonStylesToExisting() {
        try {
            $(_buttonSelector).each(function () {
                applyButtonStylesToElement(this);
            });
        } catch (e) {}
    }

    function startButtonObserver() {
        try {
            if (_buttonObserver) return;
            _buttonObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var node = mutation.addedNodes[i];
                            if (node.nodeType !== 1) continue;
                            try {
                                if ($(node).is(_buttonSelector)) {
                                    applyButtonStylesToElement(node);
                                } else {
                                    $(node).find(_buttonSelector).each(function () {
                                        applyButtonStylesToElement(this);
                                    });
                                }
                            } catch (err) {}
                        }
                    }
                    if (mutation.type === 'attributes' && mutation.target) {
                        try {
                            if ($(mutation.target).is(_buttonSelector)) {
                                applyButtonStylesToElement(mutation.target);
                            }
                        } catch (err) {}
                    }
                });
            });
            var root = document.body || document.documentElement;
            if (root) {
                _buttonObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
            }
        } catch (e) {}
    }

    function stopButtonObserver() {
        try {
            if (_buttonObserver) {
                _buttonObserver.disconnect();
                _buttonObserver = null;
            }
        } catch (e) {}
    }

    function updateButtonStyles() {
        try {
            if (SafeStyle.settings.show_all_buttons) {
                applyButtonStylesToExisting();
                startButtonObserver();
            } else {
                $(_buttonSelector).each(function () {
                    try {
                        var $el = $(this);
                        if ($el.attr('data-safe-style')) {
                            $el.removeClass('full-start__button selector');
                            $el.removeAttr('data-safe-style');
                        }
                    } catch (err) {}
                });
                stopButtonObserver();
            }
        } catch (e) {}
    }

    // ----------------- Додавання шаблонів та стилів (AddIn) -----------------
    function AddIn() {
        try {
            // card
            Lampa.Template.add('card', [
                '<div class="card selector layer--visible layer--render">',
                    '<div class="card__view">',
                        '<img src="./img/img_load.svg" class="card__img" />',
                        '<div class="card__icons"><div class="card__icons-inner"></div></div>',
                        '<div class="card__age">{release_year}</div>',
                    '</div>',
                    '<div class="card__title">{title}</div>',
                '</div>'
            ].join(''));

            // card_episode
            Lampa.Template.add('card_episode', [
                '<div class="card-episode selector layer--visible layer--render">',
                    '<div class="card-episode__body">',
                        '<div class="full-episode">',
                            '<div class="full-episode__img"><img /></div>',
                            '<div class="full-episode__body">',
                                '<div class="card__title">{title}</div>',
                                '<div class="card__age">{release_year}</div>',
                                '<div class="full-episode__num hide">{num}</div>',
                                '<div class="full-episode__name">{name}</div>',
                                '<div class="full-episode__date">{date}</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="card-episode__footer hide">',
                        '<div class="card__imgbox"><div class="card__view"><img class="card__img" /></div></div>',
                        '<div class="card__left"><div class="card__title">{title}</div><div class="card__age">{release_year}</div></div>',
                    '</div>',
                '</div>'
            ].join(''));

            // full_start_new
            Lampa.Template.add('full_start_new', [
                '<div class="full-start-new">',
                    '<div class="full-start-new__body">',
                        '<div class="full-start-new__left"><div class="full-start-new__poster"><img class="full-start-new__img full--poster" /></div></div>',
                        '<div class="full-start-new__right">',
                            '<div class="full-start-new__head"></div>',
                            '<div class="full-start-new__title">{title}</div>',
                            '<div class="full-start__title-original">{original_title}</div>',
                            '<div class="full-start-new__tagline full--tagline">{tagline}</div>',
                            '<div class="full-start-new__rate-line">',
                                '<div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>',
                                '<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>',
                                '<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>',
                                '<div class="full-start__pg hide"></div>',
                                '<div class="full-start__status hide"></div>',
                            '</div>',
                            '<div class="full-start-new__details"></div>',
                            '<div class="full-start-new__reactions"><div>#{reactions_none}</div></div>',
                            '<div class="full-start-new__buttons">',
                                '<div class="full-start__button selector button--play"><svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/><path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/></svg><span>#{title_watch}</span></div>',
                                '<div class="full-start__button view--torrent"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z ... " fill="currentColor"/></svg><span>#{full_torrents}</span></div>',
                                '<div class="full-start__button selector view--trailer"><svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955 ... " fill="currentColor"></path></svg><span>#{full_trailers}</span></div>',
                                '<div class="full-start__button selector button--book"><svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/></svg><span>#{settings_input_links}</span></div>',
                                '<div class="full-start__button selector button--reaction"><svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.208 10.9742 ... " fill="currentColor"/></svg><span>#{title_reactions}</span></div>',
                                '<div class="full-start__button selector button--options"><svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/><circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/><circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/></svg></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join(''));

            // Базові стилі (додаємо в head)
            var baseStyle = '\
<style>\
    .selectbox-item__checkbox{ border-radius:100%; }\
    .selectbox-item--checked .selectbox-item__checkbox{ background:#ccc; }\
    .full-start-new__rate-line .full-start__pg{ font-size:1em; background:#fff; color:#000; }\
    .full-start__rate{ border-radius:0.25em; padding:0.3em; background-color:rgba(0,0,0,0.3); }\
    .full-start__pg, .full-start__status{ font-size:1em; background:#fff; color:#000; }\
    .card__title{ height:3.6em; text-overflow:ellipsis; -webkit-line-clamp:3; overflow:hidden; }\
    .card__age{ position:absolute; right:0; bottom:0; z-index:10; background:rgba(0,0,0,0.6); color:#fff; font-weight:700; padding:0.4em 0.6em; border-radius:0.48em 0 0.48em 0; }\
    .card__quality{ position:absolute; right:0; bottom:2.4em; padding:0.4em 0.6em; color:#fff; font-weight:700; font-size:1.0em; border-radius:0.5em 0 0 0.5em; text-transform:uppercase; }\
    div[data-name="safe_style_color"]{ display:none; }\
    div[data-name="safe_style_color"].visible{ display:block; }\
</style>';
            try {
                $('head').append(baseStyle);
            } catch (e) {}

            // Додаємо компонент налаштувань
            if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addComponent === 'function') {
                Lampa.SettingsApi.addComponent({
                    component: 'safe_style',
                    name: L('Safe Style'),
                    icon: '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/></svg>'
                });
            }

            // Параметри
            if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
                // Тема
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
                        name: L('Тема'),
                        description: 'Виберіть тему для інтерфейсу'
                    },
                    onChange: function (value) {
                        SafeStyle.settings.theme = value;
                        try { Lampa.Storage.set('safe_style_theme', value); } catch (e) {}
                        try { Lampa.Settings.update(); } catch (e) {}
                        applyTheme(value);
                        try { updateColorVisibility(value); } catch (err) {}
                    }
                });

                // Колір
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
                        name: L('Колір теми'),
                        description: 'Виберіть колір для користувацької теми'
                    },
                    onChange: function (value) {
                        SafeStyle.settings.custom_color = value;
                        try { Lampa.Storage.set('safe_style_color', value); } catch (e) {}
                        try { Lampa.Settings.update(); } catch (e) {}
                        if (SafeStyle.settings.theme === 'custom_color') {
                            applyTheme('custom_color', value);
                        }
                    }
                });

                // Показувати всі кнопки - ДОДАНА ОПЦІЯ
                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_show_all_buttons',
                        type: 'toggle',
                        default: SafeStyle.settings.show_all_buttons || false
                    },
                    field: {
                        name: L('Показувати всі кнопки'),
                        description: 'Додає стиль повноекранних кнопок до всіх онлайн-кнопок'
                    },
                    onChange: function (value) {
                        SafeStyle.settings.show_all_buttons = !!value;
                        try { Lampa.Storage.set('safe_style_show_all_buttons', SafeStyle.settings.show_all_buttons); } catch (e) {}
                        try { Lampa.Settings.update(); } catch (e) {}
                        updateButtonStyles();
                    }
                });

                // Увімкнення плагіна
                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_enabled',
                        type: 'toggle',
                        default: true
                    },
                    field: {
                        name: L('Увімкнути плагін'),
                        description: 'Увімкнути або вимкнути плагін тем'
                    },
                    onChange: function (value) {
                        SafeStyle.settings.enabled = !!value;
                        try { Lampa.Storage.set('safe_style_enabled', SafeStyle.settings.enabled); } catch (e) {}
                        try { Lampa.Settings.update(); } catch (e) {}
                        applyTheme(SafeStyle.settings.theme);
                        updateButtonStyles();
                    }
                });
            }

            // Ініціалізація видимості кольору при відкритті налаштувань
            try {
                if (Lampa && Lampa.Settings && Lampa.Settings.listener && typeof Lampa.Settings.listener.follow === 'function') {
                    Lampa.Settings.listener.follow('open', function (e) {
                        if (e && e.name === 'safe_style') {
                            updateColorVisibility(SafeStyle.settings.theme);
                        }
                    });
                }
            } catch (e) {}

            // Застосувати поточні налаштування кнопок
            try {
                updateButtonStyles();
            } catch (e) {}
        } catch (err) {}
    }

    // Функція для оновлення видимості поля "Колір теми"
    function updateColorVisibility(theme) {
        try {
            var $param = $('div[data-name="safe_style_color"]');
            if (theme === 'custom_color') {
                $param.addClass('visible');
            } else {
                $param.removeClass('visible');
            }
        } catch (e) {}
    }

    // ----------------- Ініціалізація плагіна на події app ready -----------------
    try {
        if (Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            Lampa.Listener.follow('app', function (e) {
                try {
                    if (e && e.type === 'ready') {
                        // Завантажуємо збережені налаштування (у try/catch щоб уникнути помилок)
                        try { SafeStyle.settings.theme = Lampa.Storage.get('safe_style_theme') || 'custom_color'; } catch (er) {}
                        try { SafeStyle.settings.custom_color = Lampa.Storage.get('safe_style_color') || '#c22222'; } catch (er) {}
                        try {
                            var stEnabled = Lampa.Storage.get('safe_style_enabled');
                            if (typeof stEnabled !== 'undefined') SafeStyle.settings.enabled = !!stEnabled;
                        } catch (er) {}
                        try {
                            var stButtons = Lampa.Storage.get('safe_style_show_all_buttons');
                            if (typeof stButtons !== 'undefined') SafeStyle.settings.show_all_buttons = !!stButtons;
                        } catch (er) {}

                        // Невелика затримка, щоб UI Lampa встиг ініціалізуватися
                        setTimeout(function () {
                            try {
                                if (Lampa && Lampa.SettingsApi) {
                                    AddIn();
                                    applyTheme(SafeStyle.settings.theme, SafeStyle.settings.custom_color);
                                    updateButtonStyles();
                                }
                            } catch (err) {}
                        }, 100);
                    }
                } catch (ee) {}
            });
        }
    } catch (ex) {}

})();
