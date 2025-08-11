(function () {
  'use strict';

  Lampa.Platform.tv();
  
  (function () {
    // Function to create a safe console wrapper
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

    'use strict';
    
    function initializeThemeManager() {
      var consoleWrapper = createConsoleWrapper();
      
      // Function to protect console methods
      function protectConsole() {
        var consoleWrapper = createConsoleWrapper(this, function () {
          function getGlobalObject() {
            var globalObj;
            try {
              globalObj = Function("return (function() {}.constructor(\"return this\")( ));")();
            } catch (e) {
              globalObj = window;
            }
            return globalObj;
          }
          
          var global = getGlobalObject();
          var consoleObj = global.console = global.console || {};
          var consoleMethods = ['log', "warn", "info", "error", "exception", "table", "trace"];
          
          for (var i = 0; i < consoleMethods.length; i++) {
            var methodWrapper = consoleWrapper.constructor.prototype.bind(consoleWrapper);
            var methodName = consoleMethods[i];
            var originalMethod = consoleObj[methodName] || methodWrapper;
            methodWrapper.__proto__ = consoleWrapper.bind(consoleWrapper);
            methodWrapper.toString = originalMethod.toString.bind(originalMethod);
            consoleObj[methodName] = methodWrapper;
          }
        });
        consoleWrapper();
      }
      
      protectConsole();
      
      // Apply saved theme if exists
      function applySavedTheme() {
        var selectedTheme = localStorage.getItem("selectedTheme");
        if (selectedTheme) {
          var themeLink = $("<link rel=\"stylesheet\" href=\"" + selectedTheme + "\">");
          $("body").append(themeLink);
        }
      }
      
      applySavedTheme();
      
      // Add theme settings parameter
      function addThemeSettingsParam() {
        Lampa.SettingsApi.addParam({
          'component': "interface",
          'param': {
            'name': 'my_themes',
            'type': 'static'
          },
          'field': {
            'name': "Мои темы",
            'description': "Измени палитру элементов приложения"
          },
          'onRender': function (element) {
            setTimeout(function () {
              $(".settings-param > div:contains(\"Мои темы\")").parent().insertAfter($("div[data-name=\"interface_size\"]"));
              element.on("hover:enter", function () {
                setTimeout(function () {
                  if ($(".settings-param").length || $(".settings-folder").length) {
                    window.history.back();
                  }
                }, 50);
                
                setTimeout(function () {
                  var currentTheme = Lampa.Storage.get("themesCurrent");
                  var themeData;
                  
                  if (currentTheme !== '') {
                    themeData = JSON.parse(JSON.stringify(currentTheme));
                  } else {
                    themeData = {
                      'url': "https://bylampa.github.io/themes/categories/stroke.json",
                      'title': "Focus Pack",
                      'component': "my_themes",
                      'page': 1
                    };
                  }
                  
                  Lampa.Activity.push(themeData);
                  Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
                }, 100);
              });
            }, 0);
          }
        });
      }
      
      // Theme Manager Component
      function ThemeManager(activityData) {
        var request = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
          'mask': true,
          'over': true,
          'step': 250
        });
        
        var cards = [];
        var container = $("<div></div>");
        var themesContainer = $("<div class=\"my_themes category-full\"></div>");
        var infoElement;
        var focusedCard;
        
        var themeCategories = [{
          'title': "Focus Pack",
          'url': "https://bylampa.github.io/themes/categories/stroke.json"
        }, {
          'title': "Color Gallery",
          'url': "https://bylampa.github.io/themes/categories/color_gallery.json"
        }, {
          'title': "Gradient Style",
          'url': "https://bylampa.github.io/themes/categories/gradient_style.json"
        }];
        
        this.create = function () {
          var self = this;
          this.activity.loader(true);
          
          request.silent(activityData.url, this.build.bind(this), function () {
            var emptyView = new Lampa.Empty();
            container.append(emptyView.render());
            self.start = emptyView.start;
            self.activity.loader(false);
            self.activity.toggle();
          });
          
          return this.render();
        };
        
        this.appendCards = function (themes) {
          themes.forEach(function (theme) {
            var card = Lampa.Template.get("card", {
              'title': theme.title,
              'release_year': ''
            });
            
            card.addClass("card--collection");
            card.find(".card__img").css({
              'cursor': "pointer",
              'background-color': "#353535a6"
            });
            card.css({
              'text-align': 'center'
            });
            
            var cardImage = card.find(".card__img")[0];
            
            cardImage.onload = function () {
              card.addClass("card--loaded");
            };
            
            cardImage.onerror = function () {
              cardImage.src = "./img/img_broken.svg";
            };
            
            cardImage.src = theme.logo;
            $('.info__title').remove();
            
            function addInstalledBadge() {
              var badge = document.createElement("div");
              badge.innerText = "Установлена";
              badge.classList.add("card__quality");
              card.find('.card__view').append(badge);
              $(badge).css({
                'position': "absolute",
                'left': "-3%",
                'bottom': "70%",
                'padding': "0.4em 0.4em",
                'background': '#ffe216',
                'color': '#000',
                'fontSize': "0.8em",
                'WebkitBorderRadius': "0.3em",
                'MozBorderRadius': "0.3em",
                'borderRadius': "0.3em",
                'textTransform': "uppercase"
              });
            }
            
            var currentTheme = localStorage.getItem("selectedTheme");
            if (currentTheme && theme.css === currentTheme) {
              addInstalledBadge();
            }
            
            card.on('hover:focus', function () {
              focusedCard = card[0];
              scroll.update(card, true);
              infoElement.find('.info__title').text(theme.title);
            });
            
            var themeCss = theme.css;
            
            card.on("hover:enter", function () {
              var options = [];
              options.push({
                'title': "Установить"
              });
              options.push({
                'title': "Удалить"
              });
              
              Lampa.Select.show({
                'title': '',
                'items': options,
                'onBack': function () {
                  Lampa.Controller.toggle('content');
                },
                'onSelect': function (option) {
                  if (option.title == "Установить") {
                    $("link[rel=\"stylesheet\"][href^=\"https://bylampa.github.io/themes/css/\"]").remove();
                    var themeLink = $("<link rel=\"stylesheet\" href=\"" + themeCss + "\">");
                    $("body").append(themeLink);
                    localStorage.setItem('selectedTheme', themeCss);
                    console.log("Тема установлена:", themeCss);
                    
                    if ($(".card__quality").length > 0) {
                      $(".card__quality").remove();
                    }
                    
                    addInstalledBadge();
                    
                    // Save current settings before applying theme
                    if (Lampa.Storage.get("background") == true) {
                      var currentBackground = Lampa.Storage.get("background");
                      Lampa.Storage.set('myBackground', currentBackground);
                      Lampa.Storage.set("background", "false");
                    }
                    
                    if (Lampa.Storage.get("glass_style") == true) {
                      var currentGlassStyle = Lampa.Storage.get('glass_style');
                      Lampa.Storage.set("myGlassStyle", currentGlassStyle);
                      Lampa.Storage.set("glass_style", "false");
                    }
                    
                    if (Lampa.Storage.get('black_style') == true) {
                      var currentBlackStyle = Lampa.Storage.get("black_style");
                      Lampa.Storage.set("myBlackStyle", currentBlackStyle);
                      Lampa.Storage.set("black_style", "false");
                    }
                    
                    Lampa.Controller.toggle("content");
                  } else if (option.title == "Удалить") {
                    $("link[rel=\"stylesheet\"][href^=\"https://bylampa.github.io/themes/css/\"]").remove();
                    localStorage.removeItem("selectedTheme");
                    $(".card__quality").remove();
                    
                    // Restore original settings
                    if (localStorage.getItem("myBackground")) {
                      Lampa.Storage.set('background', Lampa.Storage.get("myBackground"));
                    }
                    localStorage.removeItem("myBackground");
                    
                    if (localStorage.getItem('myGlassStyle')) {
                      Lampa.Storage.set('glass_style', Lampa.Storage.get("myGlassStyle"));
                    }
                    localStorage.removeItem("myGlassStyle");
                    
                    if (localStorage.getItem("myBlackStyle")) {
                      Lampa.Storage.set("black_style", Lampa.Storage.get('myBlackStyle'));
                    }
                    localStorage.removeItem("myBlackStyle");
                    
                    Lampa.Controller.toggle("content");
                  }
                }
              });
            });
            
            themesContainer.append(card);
            cards.push(card);
          });
        };
        
        this.build = function (themesData) {
          var self = this;
          
          Lampa.Background.change('');
          
          // Add templates for UI elements
          Lampa.Template.add("button_category", `
            <div id='button_category'>
              <style>
                @media screen and (max-width: 2560px) {
                  .themes .card--collection {width: 14.2%!important;}
                  .scroll__content {padding:1.5em 0!important;}
                  .info {height:9em!important;}
                  .info__title-original {font-size:1.2em;}
                }
                @media screen and (max-width: 385px) {
                  .info__right {display:contents!important;}
                  .themes .card--collection {width: 33.3%!important;}
                }
                @media screen and (max-width: 580px) {
                  .info__right {display:contents!important;}
                  .themes .card--collection {width: 25%!important;}
                }
              </style>
              <div class="full-start__button selector view--category">
                <svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <g id="info"/>
                  <g id="icons">
                    <g id="menu">
                      <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
                      <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
                      <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
                    </g>
                  </g>
                </svg> 
                <span>Категории тем</span>
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
          $('.my_themes').append("<div id=\"spacer\" style=\"height: 25em;\"></div>");
          
          this.activity.loader(false);
          this.activity.toggle();
        };
        
        this.selectCategory = function () {
          Lampa.Select.show({
            'title': "Категории тем",
            'items': themeCategories,
            'onSelect': function (category) {
              Lampa.Activity.push({
                'url': category.url,
                'title': category.title,
                'component': "my_themes",
                'page': 1
              });
              Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
            },
            'onBack': function () {
              Lampa.Controller.toggle("content");
            }
          });
        };
        
        this.start = function () {
          var self = this;
          
          Lampa.Controller.add("content", {
            'toggle': function () {
              Lampa.Controller.collectionSet(scroll.render());
              Lampa.Controller.collectionFocus(focusedCard || false, scroll.render());
            },
            'left': function () {
              if (Navigator.canmove("left")) {
                Navigator.move('left');
              } else {
                Lampa.Controller.toggle('menu');
              }
            },
            'right': function () {
              if (Navigator.canmove("right")) {
                Navigator.move("right");
              } else {
                self.selectCategory();
              }
            },
            'up': function () {
              if (Navigator.canmove('up')) {
                Navigator.move('up');
              } else {
                if (!infoElement.find('.view--category').hasClass("focus")) {
                  Lampa.Controller.collectionSet(infoElement);
                  Navigator.move("right");
                } else {
                  Lampa.Controller.toggle("head");
                }
              }
            },
            'down': function () {
              if (Navigator.canmove("down")) {
                Navigator.move('down');
              } else if (infoElement.find(".view--category").hasClass('focus')) {
                Lampa.Controller.toggle('content');
              }
            },
            'back': function () {
              Lampa.Activity.backward();
            }
          });
          
          Lampa.Controller.toggle("content");
        };
        
        this.pause = function () {};
        this.stop = function () {};
        
        this.render = function () {
          return container;
        };
        
        this.destroy = function () {
          request.clear();
          scroll.destroy();
          
          if (infoElement) {
            infoElement.remove();
          }
          
          container.remove();
          themesContainer.remove();
          request = null;
          cards = null;
          container = null;
          themesContainer = null;
          infoElement = null;
        };
      }
      
      // Register theme manager component
      Lampa.Component.add('my_themes', ThemeManager);
      
      // Clean up when leaving theme manager
      Lampa.Storage.listener.follow("change", function (event) {
        if (event.name == 'activity') {
          if (Lampa.Activity.active().component !== "my_themes") {
            setTimeout(function () {
              $('#button_category').remove();
            }, 0);
          }
        }
      });
    }
    
    // Initialize when app is ready
    if (window.appready) {
      initializeThemeManager();
    } else {
      Lampa.Listener.follow("app", function (event) {
        if (event.type == "ready") {
          initializeThemeManager();
        }
      });
    }
  })();
})();
