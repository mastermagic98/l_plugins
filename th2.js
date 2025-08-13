(function () {
  'use strict';

  // Ініціалізуємо TV-платформу Lampa
  Lampa.Platform.tv();

  (function () {
    // Функція для створення обгортки консолі (захист від деобфускації)
    function createConsoleWrapper() {
      var isFirstCall = true;
      return function (context, callback) {
        var wrapper = isFirstCall ? function () {
          if (callback) {
            var result = callback.apply(context, arguments);
            callback = null;
            return result;
          }
        } : function () {};
        isFirstCall = false;
        return wrapper;
      };
    }

    // Головна функція для ініціалізації менеджера тем
    function initializeThemeManager() {
      console.log('Ініціалізація менеджера тем...');

      // Захищаємо методи консолі
      var consoleWrapper = createConsoleWrapper();
      
      function protectConsole() {
        var wrapper = consoleWrapper(this, function () {
          function getGlobalObject() {
            try {
              return Function("return (function() {}.constructor('return this')());")();
            } catch (e) {
              return window;
            }
          }
          
          var global = getGlobalObject();
          var consoleObj = global.console = global.console || {};
          var methods = ['log', 'warn', 'info', 'error', 'exception', 'table', 'trace'];
          
          methods.forEach(function (method) {
            var methodWrapper = consoleWrapper.constructor.prototype.bind(consoleWrapper);
            var originalMethod = consoleObj[method] || methodWrapper;
            methodWrapper.__proto__ = consoleWrapper.bind(consoleWrapper);
            methodWrapper.toString = originalMethod.toString.bind(originalMethod);
            consoleObj[method] = methodWrapper;
          });
        });
        wrapper();
      }
      
      protectConsole();

      // Налаштування плагіна
      var ThemeSettings = {
        name: 'custom_themes',
        settings: {
          enabled: Lampa.Storage.get('custom_themes_enabled', false), // За замовчуванням вимкнено (Стиль Лампа)
          theme: Lampa.Storage.get('custom_themes_theme', 'default'), // За замовчуванням LAMPA
          custom_color: Lampa.Storage.get('custom_themes_color', '#c22222')
        }
      };

      // Застосовуємо збережену тему
      function applySavedTheme() {
        console.log('Застосовуємо тему, enabled:', ThemeSettings.settings.enabled, 'theme:', ThemeSettings.settings.theme);
        $('#custom_themes_dynamic').remove();
        if (ThemeSettings.settings.enabled && ThemeSettings.settings.theme === 'custom_color') {
          applyDynamicTheme(ThemeSettings.settings.custom_color);
        }
      }

      // Функція для застосування динамічної теми
      function applyDynamicTheme(color) {
        console.log('Застосовуємо динамічну тему з кольором:', color);
        $('#custom_themes_dynamic').remove();
        var style = $('<style id="custom_themes_dynamic"></style>');
        var dynamicTheme = [
          '.navigation-bar__body { background: rgba(20, 20, 20, 0.96); }',
          '.card__quality, .card--tv .card__type { background: linear-gradient(to right, ' + color + 'dd, ' + color + '99); }',
          '.screensaver__preload { background: url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\'><path stroke=\'' + color + '\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5\'/></svg>") no-repeat 50% 50%; }',
          '.activity__loader { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; background: url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\'><path stroke=\'' + color + '\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5\'/></svg>") no-repeat 50% 50%; }',
          'body { background: linear-gradient(135deg, #1a1a1a, ' + color + '33); color: #ffffff; }',
          '.company-start.icon--broken .company-start__icon, .explorer-card__head-img > img, .bookmarks-folder__layer, .card-more__box, .card__img { background-color: #2a2a2a; }',
          '.search-source.focus, .simple-button.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .full-person.selector.focus, .tag-count.selector.focus { background: linear-gradient(to right, ' + color + ', ' + color + 'cc); color: #fff; box-shadow: 0 0 0.4em ' + color + '33; border-radius: 0.5em; }',
          '.selectbox-item.focus, .settings-folder.focus, .settings-param.focus { background: linear-gradient(to right, ' + color + ', ' + color + 'cc); color: #fff; box-shadow: 0 0 0.4em ' + color + '33; border-radius: 0.5em 0 0 0.5em; }',
          '.full-episode.focus::after, .card-episode.focus .full-episode::after, .items-cards .selector.focus::after, .card-more.focus .card-more__box::after, .card-episode.focus .full-episode::after, .card-episode.hover .full-episode::after, .card.focus .card__view::after, .card.hover .card__view::after, .torrent-item.focus::after, .online-prestige.selector.focus::after, .online-prestige--full.selector.focus::after, .explorer-card__head-img.selector.focus::after, .extensions__item.focus::after, .extensions__block-add.focus::after { border: 0.2em solid ' + color + '; box-shadow: 0 0 0.8em ' + color + '33; border-radius: 1em; }',
          '.head__action.focus, .head__action.hover { background: linear-gradient(45deg, ' + color + ', ' + color + 'cc); }',
          '.modal__content { background: rgba(20, 20, 20, 0.96); border: 0 solid rgba(20, 20, 20, 0.96); }',
          '.settings__content, .settings-input__content, .selectbox__content { background: rgba(20, 20, 20, 0.96); }',
          '.torrent-serial { background: rgba(0, 0, 0, 0.22); border: 0.2em solid rgba(0, 0, 0, 0.22); }',
          '.torrent-serial.focus { background-color: ' + color + '33; border: 0.2em solid ' + color + '; }'
        ].join('\n');
        style.html(dynamicTheme);
        $('head').append(style);
        console.log('Динамічна тема застосована');
      }

      // Додаємо компонент і параметри налаштувань
      function addThemeSettings() {
        console.log('Додаємо налаштування тем...');
        
        // Додаємо компонент custom_themes
        if (Lampa.SettingsApi) {
          Lampa.SettingsApi.addComponent({
            component: 'custom_themes',
            name: Lampa.Lang.translate('Custom Themes'),
            icon: '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5"/></svg>'
          });
        }

        // Додаємо CSS для приховування "Колір теми" за замовчуванням
        $('head').append(`
          <style>
            div[data-name="custom_themes_color"] { display: none; }
            div[data-name="custom_themes_color"].visible { display: block; }
          </style>
        `);

        // Додаємо параметри
        if (Lampa.SettingsApi) {
          // Параметр: Увімкнути/вимкнути плагін (Стиль Лампа/Користувацька тема)
          Lampa.SettingsApi.addParam({
            component: 'custom_themes',
            param: {
              name: 'custom_themes_enabled',
              type: 'toggle',
              default: ThemeSettings.settings.enabled
            },
            field: {
              name: 'Тема інтерфейсу',
              description: 'Увімкнути користувацьку тему або використовувати стиль Лампа'
            },
            onChange: function(value) {
              ThemeSettings.settings.enabled = value;
              Lampa.Storage.set('custom_themes_enabled', value);
              console.log('Тема інтерфейсу змінено:', value);
              applySavedTheme();
              Lampa.Settings.update();
              updateColorVisibility();
            }
          });

          // Параметр: Вибір теми
          Lampa.SettingsApi.addParam({
            component: 'custom_themes',
            param: {
              name: 'custom_themes_theme',
              type: 'select',
              values: {
                custom_color: 'Користувацька',
                default: 'LAMPA'
              },
              default: ThemeSettings.settings.theme
            },
            field: {
              name: 'Тема',
              description: 'Виберіть тему для інтерфейсу'
            },
            onChange: function(value) {
              ThemeSettings.settings.theme = value;
              Lampa.Storage.set('custom_themes_theme', value);
              console.log('Тема змінена:', value);
              applySavedTheme();
              Lampa.Settings.update();
              updateColorVisibility();
            }
          });

          // Параметр: Вибір кольору
          Lampa.SettingsApi.addParam({
            component: 'custom_themes',
            param: {
              name: 'custom_themes_color',
              type: 'select',
              values: {
                '#c22222': 'Червоний',
                '#4caf50': 'Зелений',
                '#6a1b9a': 'Фіолетовий',
                '#b0b0b0': 'Світло-сірий',
                '#ffeb3b': 'Жовтий',
                '#4d7cff': 'Синій',
                '#a64dff': 'Пурпурний',
                '#ff9f4d': 'Помаранчевий',
                '#3da18d': 'М’ятний',
                '#ff69b4': 'Рожевий',
                '#26a69a': 'Бірюзовий'
              },
              default: ThemeSettings.settings.custom_color
            },
            field: {
              name: 'Колір теми',
              description: 'Виберіть колір для користувацької теми'
            },
            onChange: function(value) {
              ThemeSettings.settings.custom_color = value;
              Lampa.Storage.set('custom_themes_color', value);
              console.log('Колір змінено:', value);
              if (ThemeSettings.settings.enabled && ThemeSettings.settings.theme === 'custom_color') {
                applyDynamicTheme(value);
              }
              Lampa.Settings.update();
            }
          });
        }

        // Оновлення видимості параметра "Колір теми"
        function updateColorVisibility() {
          console.log('Оновлення видимості, enabled:', ThemeSettings.settings.enabled, 'theme:', ThemeSettings.settings.theme);
          var colorParam = $('div[data-name="custom_themes_color"]');
          if (ThemeSettings.settings.enabled && ThemeSettings.settings.theme === 'custom_color') {
            colorParam.addClass('visible');
          } else {
            colorParam.removeClass('visible');
          }
        }

        // Слухач для оновлення видимості
        Lampa.Settings.listener.follow('open', function(e) {
          if (e.name === 'custom_themes') {
            console.log('Відкрито налаштування custom_themes');
            updateColorVisibility();
          }
        });

        // Ініціалізуємо видимість при запуску
        updateColorVisibility();
      }
      
      addThemeSettings();
      applySavedTheme();
    }
    
    // Запускаємо після готовності додатка
    if (window.appready) {
      initializeThemeManager();
    } else {
      Lampa.Listener.follow("app", function (event) {
        if (event.type === "ready") initializeThemeManager();
      });
    }
  })();
})();
