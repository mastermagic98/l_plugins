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
          enabled: Lampa.Storage.get('custom_themes_enabled', false), // За замовчуванням вимкнено ("Тема Лампа")
          theme: Lampa.Storage.get('custom_themes_theme', 'default'), // За замовчуванням "LAMPA"
          custom_color: Lampa.Storage.get('custom_themes_color', '#c22222')
        }
      };

      // Зберігаємо поточні налаштування
      function saveCurrentSettings() {
        ['background', 'glass_style', 'black_style'].forEach(function (setting) {
          if (Lampa.Storage.get(setting) === true) {
            Lampa.Storage.set('my' + setting.charAt(0).toUpperCase() + setting.slice(1), 
              Lampa.Storage.get(setting));
            Lampa.Storage.set(setting, false);
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
        Lampa.Storage.set('black_style', true); // Увімкнути чорний стиль при відновленні
      }

      // Застосовуємо збережену тему
      function applySavedTheme() {
        if (!ThemeSettings.settings.enabled) {
          $('#custom_themes_stylesheet, #custom_themes_dynamic').remove();
          restoreOriginalSettings();
          return;
        }
        var savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme && ThemeSettings.settings.theme === 'default') {
          $("body").append($("<link rel='stylesheet' id='custom_themes_stylesheet' href='" + savedTheme + "'>"));
          console.log('Застосовано збережену тему:', savedTheme);
          Lampa.Storage.set('black_style', true); // Увімкнути чорний стиль
        } else if (ThemeSettings.settings.theme === 'custom_color') {
          applyDynamicTheme(ThemeSettings.settings.custom_color);
          Lampa.Storage.set('black_style', true); // Увімкнути чорний стиль
        }
      }

      // Функція для застосування динамічної теми
      function applyDynamicTheme(color) {
        $('#custom_themes_dynamic').remove();
        var style = $('<style id="custom_themes_dynamic"></style>');
        var dynamicTheme = [
          '.navigation-bar__body { background: #1a1a1a; }', // Темний фон для навігації
          '.card__quality, .card--tv .card__type { background: linear-gradient(to right, ' + color + 'dd, ' + color + '99); }',
          '.screensaver__preload { background: url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\'><path stroke=\'' + color + '\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5\'/></svg>") no-repeat 50% 50%; }',
          '.activity__loader { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: none; background: url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\'><path stroke=\'' + color + '\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5\'/></svg>") no-repeat 50% 50%; }',
          'body { background: #1a1a1a; color: #ffffff; }', // Темний фон
          '.company-start.icon--broken .company-start__icon, .explorer-card__head-img > img, .bookmarks-folder__layer, .card-more__box, .card__img { background-color: #2a2a2a; }',
          '.search-source.focus, .simple-button.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .full-person.selector.focus, .tag-count.selector.focus { background: linear-gradient(to right, ' + color + ', ' + color + 'cc); color: #fff; box-shadow: 0 0 0.4em ' + color + '33; border-radius: 0.5em; }',
          '.menu__item.focus svg, .head__action.focus svg { fill: #fff !important; }', // Іконки не змінюють колір
          '.selectbox-item.focus, .settings-folder.focus, .settings-param.focus { background: linear-gradient(to right, ' + color + ', ' + color + 'cc); color: #fff; box-shadow: 0 0 0.4em ' + color + '33; border-radius: 0.5em 0 0 0.5em; }',
          '.full-episode.focus::after, .card-episode.focus .full-episode::after, .items-cards .selector.focus::after, .card-more.focus .card-more__box::after, .card-episode.focus .full-episode::after, .card-episode.hover .full-episode::after, .card.focus .card__view::after, .card.hover .card__view::after, .torrent-item.focus::after, .online-prestige.selector.focus::after, .online-prestige--full.selector.focus::after, .explorer-card__head-img.selector.focus::after, .extensions__item.focus::after, .extensions__block-add.focus::after { border: 0.2em solid ' + color + '; box-shadow: 0 0 0.8em ' + color + '33; border-radius: 1em; }',
          '.head__action.focus, .head__action.hover { background: linear-gradient(45deg, ' + color + ', ' + color + 'cc); }',
          '.modal__content { background: #1a1a1a; border: 0 solid #1a1a1a; }', // Темний фон для модальних вікон
          '.settings__content, .settings-input__content, .selectbox__content { background: #1a1a1a; }', // Темний фон для меню
          '.torrent-serial { background: rgba(0, 0, 0, 0.22); border: 0.2em solid rgba(0, 0, 0, 0.22); }',
          '.torrent-serial.focus { background-color: ' + color + '33; border: 0.2em solid ' + color + '; }'
        ].join('\n');
        style.html(dynamicTheme);
        $('head').append(style);
      }

      // Додаємо компонент і параметри налаштувань
      function addThemeSettings() {
        console.log('Додаємо налаштування тем...');
        
        // Додаємо компонент custom_themes
        if (Lampa.SettingsApi) {
          Lampa.SettingsApi.addComponent({
            component: 'custom_themes',
            name: Lampa.Lang.translate('Custom Themes'),
            icon: '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns=" Gypsy://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5"/></svg>'
          });
        }

        // Додаємо параметри
        if (Lampa.SettingsApi) {
          // Параметр: Увімкнути/вимкнути плагін
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
              if (value) {
                applySavedTheme();
              } else {
                $('#custom_themes_stylesheet, #custom_themes_dynamic').remove();
                restoreOriginalSettings();
              }
              Lampa.Settings.update();
              updateColorVisibility(ThemeSettings.settings.theme);
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
              if (ThemeSettings.settings.enabled) {
                if (value === 'custom_color') {
                  applyDynamicTheme(ThemeSettings.settings.custom_color);
                } else {
                  $('#custom_themes_dynamic').remove();
                  applySavedTheme();
                }
              }
              Lampa.Settings.update();
              updateColorVisibility(value);
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
              if (ThemeSettings.settings.enabled && ThemeSettings.settings.theme === 'custom_color') {
                applyDynamicTheme(value);
              }
              Lampa.Settings.update();
            }
          });
        }

        // Оновлення видимості параметра "Колір теми"
        function updateColorVisibility(theme) {
          var colorParam = $('div[data-name="custom_themes_color"]');
          if (ThemeSettings.settings.enabled && theme === 'custom_color') {
            colorParam.addClass('visible');
          } else {
            colorParam.removeClass('visible');
          }
        }

        // Слухач для оновлення видимості
        Lampa.Settings.listener.follow('open', function(e) {
          if (e.name === 'custom_themes') {
            updateColorVisibility(ThemeSettings.settings.theme);
          }
        });
      }
      
      addThemeSettings();
      applySavedTheme();

      // Основний клас для роботи з темами (залишено для зворотної сумісності)
      function ThemeManager(activityData) {
        var self = this;
        var apiRequest = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var cards = [];
        var container = $("<div></div>");
        var themesContainer = $("<div class='custom_themes category-full'></div>");
        var infoElement;
        var focusedCard;
        
        // Список категорій тем
        var categories = [
          { title: "Focus Pack", url: "https://bylampa.github.io/themes/categories/stroke.json" },
          { title: "Color Gallery", url: "https://bylampa.github.io/themes/categories/color_gallery.json" },
          { title: "Gradient Style", url: "https://bylampa.github.io/themes/categories/gradient_style.json" }
        ];

        // Функція для додавання позначки "Встановлено"
        function addInstalledBadge(card) {
          var badge = $("<div class='card__quality'>Установлена</div>").css({
            position: "absolute",
            left: "-3%",
            bottom: "70%",
            padding: "0.4em 0.4em",
            background: '#ffe216',
            color: '#000',
            fontSize: "0.8em",
            borderRadius: "0.3em",
            textTransform: "uppercase"
          });
          card.find('.card__view').append(badge);
        }

        // Створюємо інтерфейс
        this.create = function () {
          self.activity.loader(true);
          apiRequest.silent(activityData.url, self.build.bind(self), function () {
            var emptyView = new Lampa.Empty();
            container.append(emptyView.render());
            self.start = emptyView.start;
            self.activity.loader(false);
            self.activity.toggle();
          });
          return self.render();
        };

        // Додаємо картки тем
        this.appendCards = function (themes) {
          themes.forEach(function (theme) {
            var card = Lampa.Template.get("card", {
              title: theme.title,
              release_year: ''
            });
            
            card.addClass("card--collection")
              .find(".card__img").css({ cursor: "pointer", 'background-color': "#353535a6" }).end()
              .css({ 'text-align': 'center' });
            
            var cardImage = card.find(".card__img")[0];
            
            cardImage.onload = function () { card.addClass("card--loaded"); };
            cardImage.onerror = function () { cardImage.src = "./img/img_broken.svg"; };
            cardImage.src = theme.logo;
            
            $('.info__title').remove();
            
            // Перевіряємо чи ця тема встановлена
            if (localStorage.getItem("selectedTheme") === theme.css) {
              addInstalledBadge(card);
            }
            
            // Обробники подій
            card.on('hover:focus', function () {
              focusedCard = card[0];
              scroll.update(card, true);
              infoElement.find('.info__title').text(theme.title);
            });
            
            card.on("hover:enter", function () {
              showThemeOptions(theme);
            });
            
            themesContainer.append(card);
            cards.push(card);
          });
        };
        
        // Показуємо опції для теми (встановити/видалити)
        function showThemeOptions(theme) {
          Lampa.Select.show({
            title: '',
            items: [{ title: "Установить" }, { title: "Удалить" }],
            onBack: function () { Lampa.Controller.toggle('content'); },
            onSelect: function (option) {
              if (option.title === "Установить") {
                installTheme(theme);
              } else {
                removeTheme();
              }
            }
          });
        }
        
        // Встановлюємо тему
        function installTheme(theme) {
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          $('#custom_themes_dynamic').remove();
          $("body").append($("<link rel='stylesheet' id='custom_themes_stylesheet' href='" + theme.css + "'>"));
          
          localStorage.setItem('selectedTheme', theme.css);
          console.log("Тема установлена:", theme.css);
          
          $(".card__quality").remove();
          var currentCard = cards.find(function (card) {
            return card.find(".card__img")[0].src === theme.logo;
          });
          if (currentCard) {
            addInstalledBadge(currentCard);
          }
          
          saveCurrentSettings();
          Lampa.Controller.toggle("content");
        }
        
        // Видаляємо тему
        function removeTheme() {
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          $('#custom_themes_dynamic').remove();
          localStorage.removeItem("selectedTheme");
          $(".card__quality").remove();
          
          restoreOriginalSettings();
          Lampa.Controller.toggle("content");
        }
        
        // Будуємо інтерфейс
        this.build = function (themesData) {
          Lampa.Background.change('');
          
          // Додаємо шаблони для UI
          Lampa.Template.add("button_category", `
            <div id='button_category'>
              <style>
                .themes .card--collection { width: 14.2% !important; }
                .scroll__content { padding: 1.5em 0 !important; }
                .info { height: 9em !important; }
                .info__title-original { font-size: 1.2em; }
                @media (max-width: 385px) {
                  .info__right { display: contents !important; }
                  .themes .card--collection { width: 33.3% !important; }
                }
                @media (max-width: 580px) {
                  .info__right { display: contents !important; }
                  .themes .card--collection { width: 25% !important; }
                }
                div[data-name="custom_themes_color"] { display: none; }
                div[data-name="custom_themes_color"].visible { display: block; }
              </style>
              <div class="full-start__button selector view--category">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
                  <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
                  <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
                </svg>
                <span>Категорії тем</span>
              </div>
            </div>
          `);
          
          Lampa.Template.add('info_tvtv', `
            <div class="info layer--width">
              <div class="info__left">
                <div class="info__title"></div>
                <div class="info__title-original"></div>
                <div class="info__create"></div>
              </div>
              <div class="info__right">
                <div id="stantion_filtr"></div>
              </div>
            </div>
          `);
          
          // Створюємо елементи інтерфейсу
          var categoryButton = Lampa.Template.get('button_category');
          infoElement = Lampa.Template.get("info_tvtv");
          infoElement.find("#stantion_filtr").append(categoryButton);
          
          infoElement.find(".view--category").on("hover:enter hover:click", function () {
            self.selectCategory();
          });
          
          scroll.render().addClass('layer--wheight').data("mheight", infoElement);
          container.append(infoElement.append());
          container.append(scroll.render());
          
          this.appendCards(themesData);
          scroll.append(themesContainer);
          $('.custom_themes').append("<div id='spacer' style='height: 25em;'></div>");
          
          this.activity.loader(false);
          this.activity.toggle();
        };
        
        // Вибір категорії
        this.selectCategory = function () {
          Lampa.Select.show({
            title: "Категорії тем",
            items: categories,
            onSelect: function (category) {
              Lampa.Activity.push({
                url: category.url,
                title: category.title,
                component: "custom_themes",
                page: 1
              });
              Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
            },
            onBack: function () { Lampa.Controller.toggle("content"); }
          });
        };
        
        // Керування через пульт
        this.start = function () {
          Lampa.Controller.add("content", {
            toggle: function () {
              Lampa.Controller.collectionSet(scroll.render());
              Lampa.Controller.collectionFocus(focusedCard || false, scroll.render());
            },
            left: function () {
              Navigator.canmove("left") ? Navigator.move('left') : Lampa.Controller.toggle('menu');
            },
            right: function () {
              Navigator.canmove("right") ? Navigator.move('right') : self.selectCategory();
            },
            up: function () {
              if (Navigator.canmove('up')) {
                Navigator.move('up');
              } else if (!infoElement.find('.view--category').hasClass("focus")) {
                Lampa.Controller.collectionSet(infoElement);
                Navigator.move("right");
              } else {
                Lampa.Controller.toggle("head");
              }
            },
            down: function () {
              Navigator.canmove("down") ? Navigator.move('down') 
                : infoElement.find(".view--category").hasClass('focus') && Lampa.Controller.toggle('content');
            },
            back: function () { Lampa.Activity.backward(); }
          });
          
          Lampa.Controller.toggle("content");
        };
        
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return container; };
        this.destroy = function () {
          apiRequest.clear();
          scroll.destroy();
          infoElement && infoElement.remove();
          container.remove();
          themesContainer.remove();
        };
      }
      
      // Реєструємо компонент
      Lampa.Component.add('custom_themes', ThemeManager);
      
      // Слідкуємо за змінами
      Lampa.Storage.listener.follow("change", function (event) {
        if (event.name === 'activity' && Lampa.Activity.active().component !== "custom_themes") {
          setTimeout(function () { $('#button_category').remove(); }, 0);
        }
      });
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
