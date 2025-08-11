(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    var _0x20094e = function () {
      var _0x30da22 = true;
      return function (_0x5459f3, _0x5b6ab4) {
        var _0x47549f = _0x30da22 ? function () {
          if (_0x5b6ab4) {
            var _0x4a789f = _0x5b6ab4.apply(_0x5459f3, arguments);
            _0x5b6ab4 = null;
            return _0x4a789f;
          }
        } : function () {};
        _0x30da22 = false;
        return _0x47549f;
      };
    }();
    'use strict';
    function _0x1a2c77() {
      var _0x4e7d70 = _0x20094e(this, function () {
        var _0x983e0b = function () {
          var _0xdee394;
          try {
            _0xdee394 = Function("return (function() {}.constructor(\"return this\")( ));")();
          } catch (_0x38e770) {
            _0xdee394 = window;
          }
          return _0xdee394;
        };
        var _0x40a369 = _0x983e0b();
        var _0x26fd22 = _0x40a369.console = _0x40a369.console || {};
        var _0x3a76e7 = ['log', "warn", "info", "error", "exception", "table", "trace"];
        for (var _0x3c533c = 0x0; _0x3c533c < _0x3a76e7.length; _0x3c533c++) {
          var _0xf0109a = _0x20094e.constructor.prototype.bind(_0x20094e);
          var _0x2ed603 = _0x3a76e7[_0x3c533c];
          var _0x52c2a6 = _0x26fd22[_0x2ed603] || _0xf0109a;
          _0xf0109a.__proto__ = _0x20094e.bind(_0x20094e);
          _0xf0109a.toString = _0x52c2a6.toString.bind(_0x52c2a6);
          _0x26fd22[_0x2ed603] = _0xf0109a;
        }
      });
      _0x4e7d70();
      var _0x56025e = localStorage.getItem("selectedTheme");
      if (_0x56025e) {
        var _0xe66e1 = $("<link rel=\"stylesheet\" href=\"" + _0x56025e + "\">");
        $("body").append(_0xe66e1);
      }
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
        'onRender': function (_0x2d6c7c) {
          setTimeout(function () {
            $(".settings-param > div:contains(\"Мои темы\")").parent().insertAfter($("div[data-name=\"interface_size\"]"));
            _0x2d6c7c.on("hover:enter", function () {
              setTimeout(function () {
                if ($(".settings-param").length || $(".settings-folder").length) {
                  window.history.back();
                }
              }, 0x32);
              setTimeout(function () {
                var _0x1e2736 = Lampa.Storage.get("themesCurrent");
                if (_0x1e2736 !== '') {
                  var _0x373de1 = JSON.parse(JSON.stringify(_0x1e2736));
                } else {
                  var _0x373de1 = {
                    'url': "https://bylampa.github.io/themes/categories/stroke.json",
                    'title': "Focus Pack",
                    'component': "my_themes",
                    'page': 0x1
                  };
                }
                Lampa.Activity.push(_0x373de1);
                Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
              }, 0x64);
            });
          }, 0x0);
        }
      });
      function _0x537304(_0x1ba60d) {
        var _0x542685 = new Lampa.Reguest();
        var _0x580b1a = new Lampa.Scroll({
          'mask': true,
          'over': true,
          'step': 0xfa
        });
        var _0x104145 = [];
        var _0x40c2c0 = $("<div></div>");
        var _0x1ba394 = $("<div class=\"my_themes category-full\"></div>");
        var _0x3c2eb3;
        var _0x2a4fa5;
        var _0x58448e = [{
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
          var _0x5ebeeb = this;
          this.activity.loader(true);
          _0x542685.silent(_0x1ba60d.url, this.build.bind(this), function () {
            var _0x4b076a = new Lampa.Empty();
            _0x40c2c0.append(_0x4b076a.render());
            _0x5ebeeb.start = _0x4b076a.start;
            _0x5ebeeb.activity.loader(false);
            _0x5ebeeb.activity.toggle();
          });
          return this.render();
        };
        this.append = function (_0x3c2b2d) {
          _0x3c2b2d.forEach(function (_0x27244b) {
            var _0x4c4392 = Lampa.Template.get("card", {
              'title': _0x27244b.title,
              'release_year': ''
            });
            _0x4c4392.addClass("card--collection");
            _0x4c4392.find(".card__img").css({
              'cursor': "pointer",
              'background-color': "#353535a6"
            });
            _0x4c4392.css({
              'text-align': 'center'
            });
            var _0x4ff3fb = _0x4c4392.find(".card__img")[0x0];
            _0x4ff3fb.onload = function () {
              _0x4c4392.addClass("card--loaded");
            };
            _0x4ff3fb.onerror = function (_0x9da7d0) {
              _0x4ff3fb.src = "./img/img_broken.svg";
            };
            _0x4ff3fb.src = _0x27244b.logo;
            $('.info__title').remove();
            function _0x33e230() {
              var _0x551cfd = document.createElement("div");
              _0x551cfd.innerText = "Установлена";
              _0x551cfd.classList.add("card__quality");
              _0x4c4392.find('.card__view').append(_0x551cfd);
              $(_0x551cfd).css({
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
            var _0x4f1ec8 = localStorage.getItem("selectedTheme");
            if (_0x4f1ec8 && _0x27244b.css === _0x4f1ec8) {
              _0x33e230();
            }
            _0x4c4392.on('hover:focus', function () {
              _0x2a4fa5 = _0x4c4392[0x0];
              _0x580b1a.update(_0x4c4392, true);
              _0x3c2eb3.find('.info__title').text(_0x27244b.title);
            });
            var _0x18bca4 = _0x27244b.css;
            _0x4c4392.on("hover:enter", function (_0x21bd56) {
              var _0x5cfd58 = [];
              _0x5cfd58.push({
                'title': "Установить"
              });
              _0x5cfd58.push({
                'title': "Удалить"
              });
              Lampa.Select.show({
                'title': '',
                'items': _0x5cfd58,
                'onBack': function _0x1d997d() {
                  Lampa.Controller.toggle('content');
                },
                'onSelect': function _0xb23144(_0x49b243) {
                  if (_0x49b243.title == "Установить") {
                    $("link[rel=\"stylesheet\"][href^=\"https://bylampa.github.io/themes/css/\"]").remove();
                    var _0x2d8584 = $("<link rel=\"stylesheet\" href=\"" + _0x18bca4 + "\">");
                    $("body").append(_0x2d8584);
                    localStorage.setItem('selectedTheme', _0x18bca4);
                    console.log("Тема установлена:", _0x18bca4);
                    if ($(".card__quality").length > 0x0) {
                      $(".card__quality").remove();
                    }
                    _0x33e230();
                    if (Lampa.Storage.get("background") == true) {
                      var _0x99607 = Lampa.Storage.get("background");
                      Lampa.Storage.set('myBackground', _0x99607);
                      Lampa.Storage.set("background", "false");
                    }
                    if (Lampa.Storage.get("glass_style") == true) {
                      var _0x4ec8d2 = Lampa.Storage.get('glass_style');
                      Lampa.Storage.set("myGlassStyle", _0x4ec8d2);
                      Lampa.Storage.set("glass_style", "false");
                    }
                    if (Lampa.Storage.get('black_style') == true) {
                      var _0x141469 = Lampa.Storage.get("black_style");
                      Lampa.Storage.set("myBlackStyle", _0x141469);
                      Lampa.Storage.set("black_style", "false");
                    }
                    Lampa.Controller.toggle("content");
                  } else if (_0x49b243.title == "Удалить") {
                    $("link[rel=\"stylesheet\"][href^=\"https://bylampa.github.io/themes/css/\"]").remove();
                    localStorage.removeItem("selectedTheme");
                    $(".card__quality").remove();
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
            _0x1ba394.append(_0x4c4392);
            _0x104145.push(_0x4c4392);
          });
        };
        this.build = function (_0x2cfc2b) {
          var _0x1568dc = this;
          Lampa.Background.change('');
          Lampa.Template.add("button_category", "<div id='button_category'><style>@media screen and (max-width: 2560px) {.themes .card--collection {width: 14.2%!important;}.scroll__content {padding:1.5em 0!important;}.info {height:9em!important;}.info__title-original {font-size:1.2em;}}@media screen and (max-width: 385px) {.info__right {display:contents!important;}.themes .card--collection {width: 33.3%!important;}}@media screen and (max-width: 580px) {.info__right {display:contents!important;}.themes .card--collection {width: 25%!important;}}</style><div class=\"full-start__button selector view--category\"><svg style=\"enable-background:new 0 0 512 512;\" version=\"1.1\" viewBox=\"0 0 24 24\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><g id=\"info\"/><g id=\"icons\"><g id=\"menu\"><path d=\"M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z\" fill=\"currentColor\"/><path d=\"M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z\" fill=\"currentColor\"/><path d=\"M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z\" fill=\"currentColor\"/></g></g></svg> <span>Категории тем</span>\n </div></div>");
          Lampa.Template.add('info_tvtv', "<div class=\"info layer--width\"><div class=\"info__left\"><div class=\"info__title\"></div><div class=\"info__title-original\"></div><div class=\"info__create\"></div></div><div class=\"info__right\">  <div id=\"stantion_filtr\"></div></div></div>");
          var _0x4ee695 = Lampa.Template.get('button_category');
          _0x3c2eb3 = Lampa.Template.get("info_tvtv");
          _0x3c2eb3.find("#stantion_filtr").append(_0x4ee695);
          _0x3c2eb3.find(".view--category").on("hover:enter hover:click", function () {
            _0x1568dc.selectGroup();
          });
          _0x580b1a.render().addClass('layer--wheight').data("mheight", _0x3c2eb3);
          _0x40c2c0.append(_0x3c2eb3.append());
          _0x40c2c0.append(_0x580b1a.render());
          this.append(_0x2cfc2b);
          _0x580b1a.append(_0x1ba394);
          $('.my_themes').append("<div id=\"spacer\" style=\"height: 25em;\"></div>");
          this.activity.loader(false);
          this.activity.toggle();
        };
        this.selectGroup = function () {
          Lampa.Select.show({
            'title': "Категории тем",
            'items': _0x58448e,
            'onSelect': function _0x41fff1(_0x38f7b8) {
              Lampa.Activity.push({
                'url': _0x38f7b8.url,
                'title': _0x38f7b8.title,
                'component': "my_themes",
                'page': 0x1
              });
              Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
            },
            'onBack': function _0x4752f3() {
              Lampa.Controller.toggle("content");
            }
          });
        };
        this.start = function () {
          var _0x57c5ff = this;
          Lampa.Controller.add("content", {
            'toggle': function _0x39929d() {
              Lampa.Controller.collectionSet(_0x580b1a.render());
              Lampa.Controller.collectionFocus(_0x2a4fa5 || false, _0x580b1a.render());
            },
            'left': function _0x55c2eb() {
              if (Navigator.canmove("left")) {
                Navigator.move('left');
              } else {
                Lampa.Controller.toggle('menu');
              }
            },
            'right': function _0x192c77() {
              if (Navigator.canmove("right")) {
                Navigator.move("right");
              } else {
                _0x57c5ff.selectGroup();
              }
            },
            'up': function _0x5acc50() {
              if (Navigator.canmove('up')) {
                Navigator.move('up');
              } else {
                if (!_0x3c2eb3.find('.view--category').hasClass("focus")) {
                  Lampa.Controller.collectionSet(_0x3c2eb3);
                  Navigator.move("right");
                } else {
                  Lampa.Controller.toggle("head");
                }
              }
            },
            'down': function _0x3fd259() {
              if (Navigator.canmove("down")) {
                Navigator.move('down');
              } else if (_0x3c2eb3.find(".view--category").hasClass('focus')) {
                Lampa.Controller.toggle('content');
              }
            },
            'back': function _0xe55220() {
              Lampa.Activity.backward();
            }
          });
          Lampa.Controller.toggle("content");
        };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
          return _0x40c2c0;
        };
        this.destroy = function () {
          _0x542685.clear();
          _0x580b1a.destroy();
          if (_0x3c2eb3) {
            _0x3c2eb3.remove();
          }
          _0x40c2c0.remove();
          _0x1ba394.remove();
          _0x542685 = null;
          _0x104145 = null;
          _0x40c2c0 = null;
          _0x1ba394 = null;
          _0x3c2eb3 = null;
        };
      }
      Lampa.Component.add('my_themes', _0x537304);
      Lampa.Storage.listener.follow("change", function (_0x33c464) {
        if (_0x33c464.name == 'activity') {
          if (Lampa.Activity.active().component !== "my_themes") {
            setTimeout(function () {
              $('#button_category').remove();
            }, 0x0);
          }
        }
      });
    }
    if (window.appready) {
      _0x1a2c77();
    } else {
      Lampa.Listener.follow("app", function (_0x4c7d44) {
        if (_0x4c7d44.type == "ready") {
          _0x1a2c77();
        }
      });
    }
  })();
})();
