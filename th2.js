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

      // Функція для застосування теми або кольору
      function applyTheme(theme) {
        // Видаляємо попередні стилі
        $("style#dynamic_theme_css").remove();
        
        // Визначаємо кольори для тем із stroke.json
        var themes = [
          { title: "Красная", value: "theme_red", color: "#c22222" },
          { title: "Зелёная", value: "theme_green", color: "#4caf50" },
          { title: "Фиолетовая", value: "theme_violet", color: "#6a1b9a" },
          { title: "Синяя", value: "theme_blue", color: "#4d7cff" },
          { title: "Оранжевая", value: "theme_orange", color: "#ff9f4d" },
          { title: "Розовая", value: "theme_pink", color: "#ff69b4" }
        ];

        // Перевіряємо, чи це стандартна тема LAMPA
        if (theme === "theme_lampa") {
          console.log('Застосовано стандартну тему LAMPA');
          // Скидаємо стилі до стандартних
          return;
        }

        // Шукаємо тему або колір
        var selectedTheme = themes.find(function(t) { return t.value === theme; });
        var color;
        if (selectedTheme) {
          color = selectedTheme.color;
          console.log('Застосовано тему:', selectedTheme.title);
        } else {
          color = theme.replace('dynamic_', '');
          console.log('Застосовано динамічний колір:', color);
        }

        // Застосовуємо стилі
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
          .button--online, .button--online:hover {
            background-color: var(--button-bg) !important;
            color: var(--button-text) !important;
          }
        `;
        $("body").append($("<style id='dynamic_theme_css'>" + css + "</style>"));

        // Зберігаємо налаштування
        saveCurrentSettings();
      }

      // Застосовуємо збережену тему
      function applySavedTheme() {
        var savedTheme = Lampa.Storage.get('selected_theme', 'dynamic_#c22222');
        applyTheme(savedTheme);
      }
      
      applySavedTheme();

      // Зберігаємо поточні налаштування
      function saveCurrentSettings() {
        ['background', 'glass_style', 'black_style'].forEach(function (setting) {
          if (Lampa.Storage.get(setting) === true) {
            Lampa.Storage.set('my' + setting.charAt(0).toUpperCase() + setting.slice(1), 
              Lampa.Storage.get(setting));
            Lampa.Storage.set(setting, "false");
          }
        });
      }
      
      // Відновлюємо оригінальні налаштування
      function restoreOriginalSettings() {
        ['Background', 'GlassStyle', 'BlackStyle'].forEach(function (setting) {
          var key = 'my' + setting;
          if (localStorage.getItem(key)) {
            Lampa.Storage.set(setting.toLowerCase(), Lampa.Storage.get(key));
            localStorage.removeItem(key);
          }
        });
      }

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

        // Додаємо параметр для вибору теми або кольору
        Lampa.SettingsApi.addParam({
          component: 'my_themes',
          param: {
            name: 'selected_theme',
            type: 'select',
            values: {
              'theme_lampa': 'LAMPA',
              'theme_red': 'Красная',
              'theme_green': 'Зелёная',
              'theme_violet': 'Фиолетовая',
              'theme_blue': 'Синяя',
              'theme_orange': 'Оранжевая',
              'theme_pink': 'Розовая',
              'dynamic_#c22222': 'Червоний (динамічна)',
              'dynamic_#b0b0b0': 'Світло-сірий (динамічна)',
              'dynamic_#ffeb3b': 'Жовтий (динамічна)',
              'dynamic_#4d7cff': 'Синій (динамічна)',
              'dynamic_#a64dff': 'Пурпурний (динамічна)',
              'dynamic_#ff9f4d': 'Помаранчевий (динамічна)',
              'dynamic_#3da18d': 'М’ятний (динамічна)',
              'dynamic_#4caf50': 'Зелений (динамічна)',
              'dynamic_#ff69b4': 'Рожевий (динамічна)',
              'dynamic_#6a1b9a': 'Фіолетовий (динамічна)',
              'dynamic_#26a69a': 'Бірюзовий (динамічна)'
            },
            default: 'dynamic_#c22222'
          },
          field: {
            name: 'Тема або колір',
            description: 'Виберіть тему або колір для інтерфейсу'
          },
          onChange: function(value) {
            Lampa.Storage.set('selected_theme', value);
            applyTheme(value);
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
