//deepseek
(function () {
  'use strict';

  Lampa.Platform.tv();

  (function () {
    function initializeThemeManager() {
      function applySavedTheme() {
        var savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme) {
          $("body").append($("<link rel='stylesheet' href='" + savedTheme + "'>"));
        }
      }
      
      applySavedTheme();

      function addThemeSettings() {
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
                  var currentTheme = Lampa.Storage.get("themesCurrent");
                  var themeData = currentTheme ? JSON.parse(currentTheme) : {
                    url: "https://bylampa.github.io/themes/categories/stroke.json",
                    title: "Focus Pack",
                    component: "my_themes",
                    page: 1
                  };
                  
                  Lampa.Activity.push(themeData);
                }, 100);
              });
            }, 0);
          }
        });
      }
      
      addThemeSettings();

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
              self.showThemeOptions(theme, card);
            });
            
            themesContainer.append(card);
            cards.push(card);
          });
        };
        
        this.showThemeOptions = function (theme, card) {
          Lampa.Select.show({
            title: '',
            items: [{ title: "Установить" }, { title: "Удалить" }],
            onBack: function () { Lampa.Controller.toggle('content'); },
            onSelect: function (option) {
              if (option.title === "Установить") {
                self.installTheme(theme, card);
              } else {
                self.removeTheme();
              }
            }
          });
        }
        
        this.installTheme = function (theme, card) {
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          $("body").append($("<link rel='stylesheet' href='" + theme.css + "'>"));
          
          localStorage.setItem('selectedTheme', theme.css);
          $(".card__quality").remove();
          addInstalledBadge(card);
          
          ['background', 'glass_style', 'black_style'].forEach(function (setting) {
            if (Lampa.Storage.get(setting) === true) {
              Lampa.Storage.set('my' + setting.charAt(0).toUpperCase() + setting.slice(1), 
                Lampa.Storage.get(setting));
              Lampa.Storage.set(setting, "false");
            }
          });
          
          Lampa.Controller.toggle("content");
        }
        
        this.removeTheme = function () {
          $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
          localStorage.removeItem("selectedTheme");
          $(".card__quality").remove();
          
          ['Background', 'GlassStyle', 'BlackStyle'].forEach(function (setting) {
            var key = 'my' + setting;
            if (localStorage.getItem(key)) {
              Lampa.Storage.set(setting.toLowerCase(), Lampa.Storage.get(key));
              localStorage.removeItem(key);
            }
          });
          
          Lampa.Controller.toggle("content");
        }
        
        this.build = function (themesData) {
          Lampa.Background.change('');
          
          Lampa.Template.add("button_category", [
            '<div id="button_category">',
            '<style>',
            '.themes .card--collection { width: 14.2% !important; }',
            '.scroll__content { padding: 1.5em 0 !important; }',
            '.info { height: 9em !important; }',
            '@media (max-width: 385px) {',
            '  .themes .card--collection { width: 33.3% !important; }',
            '}',
            '@media (max-width: 580px) {',
            '  .themes .card--collection { width: 25% !important; }',
            '}',
            '</style>',
            '<div class="full-start__button selector view--category">',
            '<svg viewBox="0 0 24 24"><path d="M20 10H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM4 8h12c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2zm12 8H4c-1.1 0-2 .9-2 2s.9 2 2 2h12c1.1 0 2-.9 2-2s-.9-2-2-2z"></path></svg>',
            '<span>Категорії тем</span>',
            '</div>',
            '</div>'
          ].join(''));
          
          Lampa.Template.add('info_tvtv', [
            '<div class="info layer--width">',
            '<div class="info__left">',
            '<div class="info__title"></div>',
            '</div>',
            '<div class="info__right">',
            '<div id="stantion_filtr"></div>',
            '</div>',
            '</div>'
          ].join(''));
          
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
