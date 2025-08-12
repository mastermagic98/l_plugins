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

      // Функція для застосування динамічного кольору
      function applyDynamicColor(color) {
        // Видаляємо попередні динамічні стилі
        $("style#dynamic_theme_css").remove();
        // Створюємо CSS на основі структури red_stroke.css
        var css = `
          :root {
            --accent-color: ${color};
            --button-bg: ${color};
            --button-text: #fff;
          }
          .selector, .button--play, .button--play:hover {
            background-color: var(--button-bg) !important;
            color: var(--button-text) !important;
          }
        `;
        $("body").append($("<style id='dynamic_theme_css'>" + css + "</style>"));
      }

      // Застосовуємо збережений колір (якщо є)
      function applySavedColor() {
        var savedColor = Lampa.Storage.get('theme_color', '#c22222');
        applyDynamicColor(savedColor);
      }
      
      applySavedColor();

      // Додаємо компонент my_themes у меню налаштувань
      if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addComponent({
          component: 'my_themes',
          name: 'Мої теми',
          icon: `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5"/>
            </svg>
          `
        });

        // Додаємо параметр для вибору кольору
        Lampa.SettingsApi.addParam({
          component: 'my_themes',
          param: {
            name: 'theme_color',
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
            name: 'Колір теми',
            description: 'Виберіть колір для динамічної теми'
          },
          onChange: function(value) {
            Lampa.Storage.set('theme_color', value);
            applyDynamicColor(value);
            Lampa.Settings.update();
          }
        });
      }
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
