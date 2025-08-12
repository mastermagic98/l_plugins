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

      // Застосовуємо збережену тему (якщо вона є)
      function applySavedTheme() {
        var savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme) {
          $("body").append($("<link rel='stylesheet' href='" + savedTheme + "'>"));
          console.log('Застосовано збережену тему:', savedTheme);
        }
      }
      
      applySavedTheme();

      // Додаємо розділ тем в налаштування
      function addThemeSettings() {
        console.log('Додаємо налаштування тем...');
        
        Lampa.SettingsApi.addParam({
          component: "interface",
          param: {
            name: 'my_themes',
            type: 'static'
          },
          field: {
            name: "Мої теми",
            description: "Змінити палітру елементів додатка"
          },
          onRender: function (element) {
            setTimeout(function () {
              $(".settings-param > div:contains('Мої теми')").parent()
                .insertAfter($("div[data-name='interface_size']"));
              
              element.on("hover:enter", function () {
                setTimeout(function () {
                  if ($(".settings-param").length || $(".settings-folder").length) {
                    window.history.back();
                  }
                }, 50);
                
                setTimeout(function () {
                  var currentTheme = Lampa.Storage.get("themesCurrent");
                  var themeData = currentTheme ? JSON.parse(JSON.stringify(currentTheme)) : {
                    url: "https://bylampa.github.io/themes/categories/stroke.json",
                    title: "Focus Pack",
                    component: "my_themes",
                    page: 1
                  };
                  
                  Lampa.Activity.push(themeData);
                  Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
                }, 100);
              });
            }, 0);
          }
        });
      }
      
      addThemeSettings();

      // Основний клас для роботи з темами
      function ThemeManager(activityData) {
        var self = this;
        var apiRequest = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var cards = [];
        var container = $("<div></div>");
        var themesContainer = $("<div class='my_themes category-full'></div>");
        var infoElement;
        var focusedCard;
        
        var categories = [
          { title: "Focus Pack", url: "https://bylampa.github.io/themes/categories/stroke.json" },
          { title: "Color Gallery", url: "https://bylampa.github.io/themes/categories/color_gallery.json" },
          { title: "Gradient Style", url: "https://bylampa.github.io/themes/categories/gradient_style.json" }
        ];

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
            
            if (localStorage.getItem("selectedTheme") === theme.css) {
              addInstalledBadge(card);
            }
            
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
        
        function installTheme(theme) {
          // Видаляємо стилі SafeStyle
          $("style#safe_style_css").remove();
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          $("body").append($("<link rel='stylesheet' href='" + theme.css + "'>"));
          
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
        
        function removeTheme() {
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          localStorage.removeItem("selectedTheme");
          $(".card__quality").remove();
          
          restoreOriginalSettings();
          
          Lampa.Controller.toggle("content");
        }
        
        function saveCurrentSettings() {
          ['background', 'glass_style', 'black_style'].forEach(function (setting) {
            if (Lampa.Storage.get(setting) === true) {
              Lampa.Storage.set('my' + setting.charAt(0).toUpperCase() + setting.slice(1), 
                Lampa.Storage.get(setting));
              Lampa.Storage.set(setting, "false");
            }
          });
        }
        
        function restoreOriginalSettings() {
          ['Background', 'GlassStyle', 'BlackStyle'].forEach(function (setting) {
            var key = 'my' + setting;
            if (localStorage.getItem(key)) {
              Lampa.Storage.set(setting.toLowerCase(), Lampa.Storage.get(key));
              localStorage.removeItem(key);
            }
          });
        }
        
        this.build = function (themesData) {
          Lampa.Background.change('');
          
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
          $('.my_themes').append("<div id='spacer' style='height: 25em;'></div>");
          
          this.activity.loader(false);
          this.activity.toggle();
        };
        
        this.selectCategory = function () {
          Lampa.Select.show({
            title: "Категорії тем",
            items: categories,
            onSelect: function (category) {
              Lampa.Activity.push({
                url: category.url,
                title: category.title,
                component: "my_themes",
                page: 1
              });
              Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
            },
            onBack: function () { Lampa.Controller.toggle("content"); }
          });
        };
        
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
              Navigator.canmove("right") ? Navigator.move("right") : self.selectCategory();
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
      
      Lampa.Component.add('my_themes', ThemeManager);

      // Додаємо компонент SafeStyle
      function SafeStyle() {
        var settings = {
          theme: Lampa.Storage.get('safe_style_theme', 'custom_color'),
          custom_color: Lampa.Storage.get('safe_style_color', '#c22222'),
          enabled: Lampa.Storage.get('safe_style_enabled', true),
          show_all_buttons: Lampa.Storage.get('safe_style_show_all_buttons', false)
        };

        function applyTheme(theme, color) {
          if (!settings.enabled) {
            $("style#safe_style_css").remove();
            return;
          }

          if (theme === 'custom_color') {
            var selectedColor = color || settings.custom_color;
            var css = `
              :root {
                --accent-color: ${selectedColor};
                --button-bg: ${selectedColor};
                --button-text: #fff;
              }
              .selector, .button--play, .button--play:hover {
                background-color: var(--button-bg) !important;
                color: var(--button-text) !important;
              }
              ${settings.show_all_buttons ? `
              .button--online, .button--online:hover {
                background-color: var(--button-bg) !important;
                color: var(--button-text) !important;
              }` : ''}
            `;
            $("style#safe_style_css").remove();
            $("body").append($("<style id='safe_style_css'>" + css + "</style>"));
            // Видаляємо теми my_themes
            $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
            localStorage.removeItem("selectedTheme");
            $(".card__quality").remove();
          } else {
            $("style#safe_style_css").remove();
          }
        }

        function updateButtonStyles() {
          if (settings.enabled && settings.show_all_buttons) {
            $(".button--online").css({
              'background-color': settings.custom_color,
              'color': '#fff'
            });
          } else {
            $(".button--online").css({
              'background-color': '',
              'color': ''
            });
          }
        }

        function updateColorVisibility(theme) {
          var colorParam = $('div[data-name="safe_style_color"]');
          if (theme === 'custom_color') {
            colorParam.addClass('visible');
          } else {
            colorParam.removeClass('visible');
          }
        }

        if (Lampa.SettingsApi) {
          Lampa.SettingsApi.addComponent({
            component: 'safe_style',
            name: 'Safe Style',
            icon: `
              <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5"/>
              </svg>
            `
          });

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
              name: 'Тема',
              description: 'Виберіть тему для інтерфейсу'
            },
            onChange: function(value) {
              settings.theme = value;
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
              name: 'Колір теми',
              description: 'Виберіть колір для користувацької теми'
            },
            onChange: function(value) {
              settings.custom_color = value;
              Lampa.Storage.set('safe_style_color', value);
              Lampa.Settings.update();
              if (settings.theme === 'custom_color') {
                applyTheme('custom_color', value);
              }
            }
          });

          Lampa.SettingsApi.addParam({
            component: 'safe_style',
            param: {
              name: 'safe_style_show_all_buttons',
              type: 'toggle',
              default: false
            },
            field: {
              name: 'Показувати всі кнопки',
              description: 'Додає стиль повноекранних кнопок до всіх онлайн-кнопок'
            },
            onChange: function(value) {
              settings.show_all_buttons = value;
              Lampa.Storage.set('safe_style_show_all_buttons', value);
              Lampa.Settings.update();
              updateButtonStyles();
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
              name: 'Увімкнути плагін',
              description: 'Увімкнути або вимкнути плагін тем'
            },
            onChange: function(value) {
              settings.enabled = value;
              Lampa.Storage.set('safe_style_enabled', value);
              Lampa.Settings.update();
              applyTheme(settings.theme);
              updateButtonStyles();
            }
          });
        }

        Lampa.Settings.listener.follow('open', function(e) {
          if (e.name === 'safe_style') {
            updateColorVisibility(settings.theme);
          }
        });

        this.applyTheme = applyTheme;
        this.updateButtonStyles = updateButtonStyles;
      }

      Lampa.Component.add('safe_style', SafeStyle);

      Lampa.Storage.listener.follow("change", function (event) {
        if (event.name === 'activity' && Lampa.Activity.active().component !== "my_themes") {
          setTimeout(function () { $('#button_category').remove(); }, 0);
        }
      });
    }

    if (window.appready) {
      initializeThemeManager();
    } else {
      Lampa.Listener.follow("app", function (event) {
        if (event.type === "ready") initializeThemeManager();
      });
    }
  })();
})();
