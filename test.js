(function () {
  'use strict';

  function start() {
    Lampa.SettingsApi.addParam({
      'component': 'interface',
      'param': {
        'name': "hide_online_option",
        'type': "trigger",
        'default': false
      },
      'field': {
        'name': "Скрыть опции онлайн",
        'description': "в меню карточки на Главной"
      }
    });
    if (localStorage.getItem("card_interfice_type") == "old") {
      function bookManipulator(_0x5f1915, _0x2a9161) {
        function _0x3e9037(_0x445388) {
          var _0x2c620d = Lampa.Storage.get("favorite").book;
          var _0x2afc2b = _0x2c620d.indexOf(_0x445388);
          if (_0x2afc2b !== -0x1) {
            _0x2c620d.splice(_0x2afc2b, 0x1);
            _0x2c620d.unshift(_0x445388);
          }
          _0x4a0094();
        }
        ;
        function _0x42cf8e(_0x5ed8ac) {
          var _0x19a3b8 = Lampa.Storage.get("favorite").book;
          var _0x20a9b5 = _0x19a3b8.indexOf(_0x5ed8ac);
          if (_0x20a9b5 !== -0x1) {
            _0x19a3b8.splice(_0x20a9b5, 0x1);
            _0x19a3b8.push(_0x5ed8ac);
          }
          _0x554e46(_0x19a3b8);
        }
        ;
        function _0x45e4f7(_0x3ed08b) {
          var _0x48fb60 = Lampa.Storage.get("favorite").book;
          var _0x33f6ac = _0x48fb60.indexOf(_0x3ed08b);
          if (_0x33f6ac > -0x1 && _0x33f6ac < _0x48fb60.length - 0x1) {
            var _0x536d02 = _0x48fb60[_0x33f6ac];
            _0x48fb60[_0x33f6ac] = _0x48fb60[_0x33f6ac + 0x1];
            _0x48fb60[_0x33f6ac + 0x1] = _0x536d02;
          }
          _0x554e46(_0x48fb60);
        }
        ;
        function _0x2fb0dd(_0x94842) {
          var _0x4de5e8 = Lampa.Storage.get("favorite").book;
          var _0x57c8f1 = _0x4de5e8.indexOf(_0x94842);
          if (_0x57c8f1 > 0x0) {
            var _0x3741ec = _0x4de5e8[_0x57c8f1];
            _0x4de5e8[_0x57c8f1] = _0x4de5e8[_0x57c8f1 - 0x1];
            _0x4de5e8[_0x57c8f1 - 0x1] = _0x3741ec;
          }
          _0x554e46(_0x4de5e8);
        }
        ;
        function _0x4a0094() {
          var _0x56fc90 = Lampa.Storage.get('account', '{}');
          var _0xef2fd4 = new Lampa.Reguest();
          _0xef2fd4.silent("https://iqslgbok.deploy.cx/http://cub.red/api/bookmarks/all?full=1", function (_0x3ae5e5) {
            Lampa.Noty.show("Удачно");
            window.myresp = _0x3ae5e5.bookmarks;
            ;
            _0x457452 = null;
            var _0x457452 = Lampa.Storage.get('favorite');
            _0x457452.book = [0xded09, 0x88571, 0x5e667, 0x6021d];
            Lampa.Storage.set("favorite", _0x457452);
            Lampa.Select.close();
            setTimeout(function () {
              var _0xb4c823 = Lampa.Activity.active();
              Lampa.Activity.push(_0xb4c823);
            }, 0x12c);
          }, function (_0x35a601) {
            Lampa.Noty.show('Провал');
            ;
          }, false, {
            'headers': {
              'token': _0x56fc90.token,
              'profile': _0x56fc90.id
            }
          });
        }
        function _0x554e46(_0x2d7873) {
          _0x5f3fae = null;
          var _0x5f3fae = Lampa.Storage.get("favorite");
          _0x5f3fae.book = _0x2d7873;
          Lampa.Storage.set("favorite", _0x5f3fae);
          Lampa.Select.close();
          var _0x7bd05c = Lampa.Activity.active();
          Lampa.Activity.push(_0x7bd05c);
        }
        if (_0x2a9161 == "moveToFront") {
          _0x3e9037(_0x5f1915);
        }
        if (_0x2a9161 == "moveToEnd") {
          _0x42cf8e(_0x5f1915);
        }
        if (_0x2a9161 == "moveBackward") {
          _0x45e4f7(_0x5f1915);
        }
        if (_0x2a9161 == 'moveForward') {
          _0x2fb0dd(_0x5f1915);
        }
      }
      function focusPocus() {
        if (!window.lastfocus) {
          window.lastfocus = jQueryToNative($(".focus"));
        }
        if (!$(".focus")) {
          window.lastfocus = getButton();
        }
        if (!Lampa.Platform.screen("mobile")) {
          Lampa.Controller.focus(window.lastfocus);
          Navigator.focus(window.lastfocus);
        } else {
          var _0xeef15a = setInterval(function () {
            var _0x4b9647 = getButton();
            if (_0x4b9647) {
              Lampa.Controller.focus(_0x4b9647);
              Navigator.focus(_0x4b9647);
              clearInterval(_0xeef15a);
            }
          }, 0xc8);
        }
      }
      function getButtonsMulti() {
        var _0x153f10 = document.querySelector(".activity--active");
        if (_0x153f10) {
          var _0x444dd1 = _0x153f10.querySelectorAll(".full-start__button");
        } else {
          var _0x444dd1 = document.querySelectorAll(".full-start__button");
        }
        return _0x444dd1;
      }
      function getButton() {
        var _0x541666 = document.querySelector('.activity--active');
        if (_0x541666) {
          var _0x273370 = _0x541666.querySelector(".full-start__button");
        } else {
          var _0x273370 = document.querySelector(".full-start__button");
        }
        return _0x273370;
      }
      function getButtonsContainer() {
        var _0x2ba95e = document.querySelector(".activity--active");
        if (_0x2ba95e) {
          var _0x1b660b = _0x2ba95e.querySelector(".full-start__buttons");
        } else {
          var _0x1b660b = document.querySelector(".full-start__buttons");
        }
        return _0x1b660b;
      }
      function triggerIt(_0x119700, _0xcbc6e6) {
        Lampa.Controller.focus(_0x119700);
        Lampa.Controller.enter();
        setTimeout(function () {
          if ($(".selectbox__title").text() !== "Фильтр") {
            Lampa.Utils.trigger(jQueryToNative(_0x119700), "click");
          }
        }, 0x12c);
      }
      function jQueryToNative(_0x24525e) {
        if (typeof _0x24525e === "string") {
          return document.querySelector(_0x24525e);
        } else {
          return _0x24525e instanceof jQuery ? _0x24525e.get(0x0) : _0x24525e;
        }
      }
      function getCurrentPlayButtons() {
        var _0x5baaea = getButtonsMulti();
        _0x5baaea.forEach(function (_0x1b64a6) {
          if (!_0x1b64a6.querySelector("span")) {
            var _0x17dd90 = document.createElement("span");
            var _0x580d3e = _0x1b64a6.textContent.trim();
            _0x17dd90.textContent = _0x580d3e;
            var _0x4c28fe = _0x1b64a6.querySelector('svg');
            while (_0x1b64a6.firstChild) {
              _0x1b64a6.removeChild(_0x1b64a6.firstChild);
            }
            _0x1b64a6.appendChild(_0x4c28fe);
            if (_0x580d3e !== '') {
              _0x1b64a6.appendChild(_0x17dd90);
            }
          }
        });
        var _0x4151f5 = [];
        var _0x5d711e = JSON.parse(localStorage.getItem('hiddenButtons')) || [];
        for (var _0x482698 = 0x0; _0x482698 < _0x5baaea.length; _0x482698++) {
          var _0x5c840b = _0x5baaea[_0x482698].className;
          if (!_0x4151f5.includes(_0x5c840b)) {
            _0x4151f5.push(_0x5baaea[_0x482698].className);
          } else {}
          if (_0x5baaea[_0x482698].classList.contains("hide")) {
            if (!_0x5d711e.includes(_0x5c840b)) {
              _0x5d711e.push(_0x5baaea[_0x482698].className);
            }
          }
        }
        localStorage.setItem("buttonOrder", JSON.stringify(_0x4151f5));
        localStorage.setItem("hiddenButtons", JSON.stringify(_0x5d711e));
        focusPocus();
      }
      function setCurrentPlayButtons() {
        window.renamedButtons = JSON.parse(localStorage.getItem('renamedButtons')) || [];
        var _0xecaf0a = JSON.parse(localStorage.getItem("buttonOrder")) || [];
        var _0x4149cb = JSON.parse(localStorage.getItem("hiddenButtons")) || [];
        var _0x58e362 = JSON.parse(localStorage.getItem('buttonOrderRenamed')) || {};
        $(".focus").removeClass("focus");
        var _0x50236a = getButtonsMulti();
        _0x50236a.forEach(function (_0x1cd763) {
          if (!_0x1cd763.querySelector("span")) {
            var _0x4866f6 = document.createElement("span");
            var _0x4752c5 = _0x1cd763.textContent.trim();
            _0x4866f6.textContent = _0x4752c5;
            var _0x6d6326 = _0x1cd763.querySelector('svg');
            while (_0x1cd763.firstChild) {
              _0x1cd763.removeChild(_0x1cd763.firstChild);
            }
            _0x1cd763.appendChild(_0x6d6326);
            if (_0x4752c5 !== '') {
              _0x1cd763.appendChild(_0x4866f6);
            }
          }
          if (_0x1cd763.attributes["data-subtitle"]) {
            var _0x153884 = _0x1cd763.attributes["data-subtitle"].textContent;
            _0x153884 = _0x153884.replace(/\s+/g, '-');
            _0x153884 = _0x153884.replace(/[^\w-]/g, '');
            _0x153884 = _0x153884.replace(/[0-9]/g, '');
            _0x153884 = _0x153884.toLowerCase();
            _0x1cd763.classList.add(_0x153884);
          }
          if (_0x1cd763.classList.contains("view--torrent") && !_0x1cd763.classList.contains("selector")) {
            _0x1cd763.classList.add("selector");
            _0x1cd763.classList.add('pva');
          }
          if (_0x1cd763.classList.contains("cinema--button")) {
            _0x1cd763.classList.add("genuine");
          }
          if (_0x1cd763.classList.contains('cinema--button') && document.getElementsByClassName(_0x1cd763.classList).length > 0x1) {
            document.getElementsByClassName(_0x1cd763.classList)[0x1].remove();
          }
        });
        var _0x1a4460 = getButtonsContainer();
        var _0x50236a = Array.prototype.slice.call(_0x1a4460.children);
        var _0x16f8ba = {};
        _0x50236a.forEach(function (_0x4b940a) {
          _0x16f8ba[_0x4b940a.className] = _0x4b940a;
        });
        _0xecaf0a.forEach(function (_0x4ab5c8) {
          if (_0x16f8ba[_0x4ab5c8]) {
            _0x1a4460.appendChild(_0x16f8ba[_0x4ab5c8]);
            var _0x175ab2 = _0x16f8ba[_0x4ab5c8].querySelector('span');
            for (var _0x450684 in _0x58e362) {
              if (_0x58e362.hasOwnProperty(_0x450684) && _0x450684 === _0x4ab5c8) {
                if (_0x175ab2) {
                  _0x175ab2.innerHTML = _0x58e362[_0x4ab5c8];
                }
              }
            }
            delete _0x16f8ba[_0x4ab5c8];
          }
        });
        for (var _0xb24dcb in _0x16f8ba) {
          _0x1a4460.appendChild(_0x16f8ba[_0xb24dcb]);
        }
        _0x50236a.forEach(function (_0x523027) {
          _0x4149cb.forEach(function (_0x475c66) {
            if (_0x475c66.includes(_0x523027.className)) {
              _0x523027.classList.add("hide");
            }
          });
        });
      }
      function moveCardFavorite() {
        setTimeout(function () {
          if ($(".activity--active >").find(".card")) {
            $(".card").on("hover:long", function () {
              var _0x368fd6 = $(".card").index(this);
              var _0x1a048a = $(".card")[_0x368fd6].card_data.id;
              if (_0x1a048a) {
                window.current_card_id = _0x1a048a;
              }
              var _0x31c6c5 = $("<div class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">В начало списка</div></div>");
              var _0x280327 = $("<div class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">Сдвинуть вверх</div></div>");
              var _0x246f4e = $("<div class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">Сдвинуть вниз</div></div>");
              var _0x46ef5f = $("<div class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">В конец списка</div></div>");
              var _0x37815d = [_0x46ef5f, _0x246f4e, _0x280327, _0x31c6c5];
              _0x37815d.forEach(function (_0x1771b7) {
                var _0x57a567 = $("body > .selectbox").find('.scroll__body');
                _0x57a567.append(_0x1771b7);
                _0x57a567 = jQueryToNative(_0x57a567);
                _0x57a567.insertBefore(_0x57a567.lastChild, _0x57a567.firstChild);
              });
              var _0x583d88 = $("body > .selectbox").find('.scroll__body');
              Lampa.Controller.collectionSet(_0x583d88);
              setTimeout(function () {
                var _0x57dd36 = jQueryToNative($("body > .selectbox").find(".selector"));
                Lampa.Controller.focus(_0x57dd36);
                Navigator.focus(_0x57dd36);
              }, 0xa);
              _0x31c6c5.on('hover:enter', function () {
                var _0x5ccd6c = window.current_card_id;
                bookManipulator(_0x5ccd6c, 'moveToFront');
              });
              _0x46ef5f.on("hover:enter", function () {
                var _0x1a7702 = window.current_card_id;
                bookManipulator(_0x1a7702, "moveToEnd");
              });
              _0x280327.on("hover:enter", function () {
                var _0x4b698d = window.current_card_id;
                bookManipulator(_0x4b698d, "moveForward");
              });
              _0x246f4e.on('hover:enter', function () {
                var _0x2bed07 = window.current_card_id;
                bookManipulator(_0x2bed07, 'moveBackward');
              });
            });
          }
        }, 0xc8);
      }
      function moveButton(_0x1abf99, _0x38e23d) {
        _0x1abf99 = jQueryToNative(_0x1abf99);
        window.lastfocus = jQueryToNative(_0x1abf99);
        var _0x4b3d4a = _0x1abf99;
        var _0x10e00d = 0x0;
        var _0x1ad281 = getButtonsMulti();
        var _0x5460f4 = [];
        _0x5460f4.push(_0x1ad281);
        function _0x2f5922(_0x3e0b1a) {
          if (_0x3e0b1a === 'up') {
            var _0x292fe9 = _0x4b3d4a.previousElementSibling;
            if (_0x292fe9) {
              _0x4b3d4a.parentElement.insertBefore(_0x4b3d4a, _0x292fe9);
            }
          } else {
            if (_0x3e0b1a === "down") {
              var _0x4cccea = _0x4b3d4a.nextElementSibling;
              if (_0x4cccea) {
                _0x4b3d4a.parentElement.insertBefore(_0x4cccea, _0x4b3d4a);
              }
            }
          }
        }
        _0x2f5922(_0x38e23d);
        var _0x3324ea = [];
        _0x3324ea.push(_0x1ad281);
        if (_0x3324ea.toString() !== _0x5460f4.toString() && _0x10e00d < 0x6) {
          _0x10e00d++;
          _0x2f5922(_0x38e23d);
        }
        ;
        Lampa.Controller.move("left");
        $(".focus").removeClass("focus");
      }
      function menuDo(_0x21c15e, _0x38ae37) {
        var _0x27cec5 = [];
        _0x27cec5.push({
          'title': "Сдвинуть влево",
          'todo': "drop_up"
        });
        _0x27cec5.push({
          'title': "Сдвинуть вправо",
          'todo': "drop_down"
        });
        _0x27cec5.push({
          'title': 'Скрыть',
          'todo': 'hide_it'
        });
        _0x27cec5.push({
          'title': "Показать скрытые",
          'todo': "show_hidden"
        });
        _0x27cec5.push({
          'title': "Сменить название",
          'todo': 'rename'
        });
        _0x27cec5.push({
          'title': "Сбросить порядок",
          'todo': "reset"
        });
        Lampa.Select.show({
          'title': Lampa.Lang.translate("title_action"),
          'items': _0x27cec5,
          'onBack': function _0x57acba() {
            Lampa.Controller.toggle('content');
          },
          'onSelect': function _0x1b14f8(_0x1477a4) {
            if (_0x1477a4.todo == "drop_up") {
              moveButton(_0x21c15e, 'up');
              getCurrentPlayButtons();
            }
            if (_0x1477a4.todo == "drop_down") {
              moveButton(_0x21c15e, "down");
              getCurrentPlayButtons();
            }
            if (_0x1477a4.todo == "hide_it") {
              _0x21c15e.addClass("hide");
              getCurrentPlayButtons();
            }
            if (_0x1477a4.todo == "show_hidden") {
              localStorage.setItem("hiddenButtons", JSON.stringify([]));
              var _0x391ac7 = getButtonsContainer();
              var _0x596054 = Array.prototype.slice.call(_0x391ac7.children);
              _0x596054.forEach(function (_0xc93649) {
                _0xc93649.classList.remove("hide");
              });
            }
            if (_0x1477a4.todo == "rename") {
              Lampa.Input.edit({
                'title': "Укажите новое название",
                'value': _0x38ae37,
                'free': true,
                'nosave': true
              }, function (_0x5e5483) {
                if (_0x5e5483 !== '' && _0x5e5483 !== _0x38ae37) {
                  _0x21c15e.find('span').text(_0x5e5483);
                  var _0x35e67b = JSON.parse(localStorage.getItem("buttonOrderRenamed")) || {};
                  var _0x593f5f = jQueryToNative(_0x21c15e).className;
                  _0x35e67b[_0x593f5f] = _0x5e5483;
                  localStorage.setItem("buttonOrderRenamed", JSON.stringify(_0x35e67b));
                  Lampa.Controller.toggle('content');
                  setTimeout(function () {
                    Lampa.Controller.focus(jQueryToNative(_0x21c15e));
                    Navigator.focus(jQueryToNative(_0x21c15e));
                  }, 0xa);
                }
                ;
              });
            }
            if (_0x1477a4.todo == "reset") {
              localStorage.setItem('buttonOrder', JSON.stringify([]));
              getCurrentPlayButtons();
              setCurrentPlayButtons();
            }
          }
        });
      }
      function card_init() {
        if (!window.lastfocus_status) {
          window.lastfocus = jQueryToNative($(".focus"));
        }
        $(".focus").removeClass("focus");
        setCurrentPlayButtons();
        getCurrentPlayButtons();
        Lampa.Controller.collectionSet(getButtonsContainer());
        if (window.lastfocus_status) {
          Lampa.Controller.focus(window.lastfocus);
        } else {
          Lampa.Controller.focus(getButton());
        }
        Navigator.focus(document.getElementsByClassName("focus"));
        getButtonsContainer().classList.remove("hide");
        $('.full-start__button').unbind("hover:long").on("hover:long", function () {
          var _0x6b0215 = $(this).find("span").text();
          var _0x226186 = $(this);
          menuDo(_0x226186, _0x6b0215);
        }).on("hover:enter", function () {
          window.lastfocus = jQueryToNative($(this));
          window.lastfocus_status = true;
        });
      }
      Lampa.Controller.listener.follow("toggle", function (_0x4ac370) {
        if (_0x4ac370.name == "select" && Lampa.Activity.active().component == "online_mod" && $(".selectbox__title").text() == Lampa.Lang.translate("title_action") && $('.extensions__block').length == 0x0 && window.menu_type !== "sub_menu") {
          var _0x26219c = $("<div id = \"addToBegin\" class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">К началу</div></div>");
          var _0x9cbc1 = $("<div id=\"addFilter\" class=\"selectbox-item selector\"><div class=\"selectbox-item__title\">Фильтр</div></div>");
          var _0x50baa9 = [_0x26219c, _0x9cbc1];
          _0x50baa9.forEach(function (_0x267d65) {
            var _0xcb4410 = $("body > .selectbox").find(".scroll__body");
            _0xcb4410.append(_0x267d65);
            _0xcb4410 = jQueryToNative(_0xcb4410);
            _0xcb4410.insertBefore(_0xcb4410.lastChild, _0xcb4410.firstChild);
          });
          var _0x5830f1 = $("body > .selectbox").find('.scroll__body');
          Lampa.Controller.collectionSet(_0x5830f1);
          setTimeout(function () {
            var _0x145b60 = jQueryToNative($("body > .selectbox").find('.selector'));
            Lampa.Controller.focus(_0x145b60);
            Navigator.focus(_0x145b60);
          }, 0xa);
          _0x26219c.on("hover:enter", function () {
            history.back();
            setTimeout(function () {
              var _0x50479b = $(".scroll__content > .torrent-list");
              _0x50479b = jQueryToNative(_0x50479b);
              var _0x126a82 = _0x50479b.firstChild;
              Lampa.Controller.focus(_0x126a82);
              Navigator.focus(_0x126a82);
            }, 0x14);
          });
          _0x9cbc1.on('hover:enter', function () {
            var _0x48ef0d = jQueryToNative($(".filter--filter"));
            setTimeout(function () {
              triggerIt(_0x48ef0d);
            }, 0x14);
          });
        }
        if (_0x4ac370.name == 'menu') {
          window.main_menu_first = true;
        }
        if (_0x4ac370.name == 'content' && window.main_menu_first && getButtonsContainer()) {
          window.lastfocus = getButton();
          focusPocus();
          window.main_menu_first = false;
        }
        if (_0x4ac370.name == "select" && Lampa.Storage.get("hide_online_option")) {
          function _0x147b33() {
            if (Lampa.Activity.active().component == "main") {
              var _0x363099 = true;
            } else {
              if (Lampa.Activity.active().component == "favorite") {
                var _0x363099 = true;
              } else {
                if (Lampa.Activity.active().component == "bookmarks") {
                  var _0x363099 = true;
                } else {
                  var _0x363099 = false;
                }
              }
            }
            if (Lampa.Activity.active().component == "favorite" && Lampa.Activity.active().type == "history") {
              var _0x363099 = false;
            }
            return _0x363099;
          }
          if (_0x147b33()) {
            $(".selectbox-item__subtitle").each(function () {
              $(this).parent().hide();
              var _0x4b3eab = document.querySelector(".settings-param-title").find('span');
              if (_0x4b3eab && _0x4b3eab.textContent == "Еще") {
                _0x4b3eab.addClass("hide");
              }
              var _0x20eede = $("body > .selectbox").find(".scroll__body");
              Lampa.Controller.collectionSet(_0x20eede);
              setTimeout(function () {
                var _0x499b70 = jQueryToNative($("body > .selectbox").find(".selectbox-item--checkbox")[0x0]);
                Lampa.Controller.focus(_0x499b70);
                Navigator.focus(_0x499b70);
              }, 0xa);
            });
          }
        }
        if (_0x4ac370.name == "select" && $('.selectbox__title').text() == Lampa.Lang.translate('filter_sorted') && $(".extensions__block").length == 0x0) {
          $(".selectbox-item.selector").parent().hide();
          setTimeout(function () {
            var _0x193f80 = Lampa.Activity.active().component + '_ignoreCat';
            Lampa.Storage.set(_0x193f80, localStorage.getItem(_0x193f80) || []);
            var _0x1467fc = Lampa.Storage.get(_0x193f80) || [];
            $('.selectbox-item').on('hover:long', function () {
              window.menu_type = 'sub_menu';
              var _0xc04661 = jQueryToNative($(this));
              var _0x25339e = [];
              _0x25339e.push({
                'title': "Скрыть",
                'todo': 'hide_it'
              });
              _0x25339e.push({
                'title': "Показать скрытые",
                'todo': "show_hidden"
              });
              Lampa.Select.show({
                'title': Lampa.Lang.translate("title_action"),
                'items': _0x25339e,
                'onBack': function _0x40a9a1() {
                  window.menu_type = null;
                  var _0x290402 = jQueryToNative($(".filter--sort"));
                  setTimeout(function () {
                    triggerIt(_0x290402);
                  }, 0xa);
                },
                'onSelect': function _0x4443bc(_0x27802b) {
                  window.menu_type = null;
                  if (_0x27802b.todo == "hide_it") {
                    if (_0xc04661.classList.contains("selected")) {
                      Lampa.Noty.show("Активный источник нельзя скрыть, пока вы внутри. Смените источник!");
                    } else {
                      var _0x4d9498 = _0xc04661.innerText.trim();
                      var _0x302bd5 = _0x4d9498.replace(/(\[.*?\]|\n)/g, '');
                      _0x1467fc.push(_0x302bd5);
                      Lampa.Storage.set(_0x193f80, _0x1467fc);
                      var _0x44595f = jQueryToNative($('.filter--sort'));
                      setTimeout(function () {
                        triggerIt(_0x44595f);
                      }, 0x14);
                      Lampa.Noty.show("Источник " + _0x302bd5 + " скрыт");
                    }
                  }
                  if (_0x27802b.todo == "show_hidden") {
                    Lampa.Storage.set(_0x193f80, []);
                    var _0x44595f = jQueryToNative($(".filter--sort"));
                    setTimeout(function () {
                      triggerIt(_0x44595f);
                    }, 0xa);
                  }
                }
              });
            });
            _0x1467fc.forEach(function (_0x342476) {
              var _0x3d4c82 = $(".selectbox-item.selector > div:contains(\"" + _0x342476 + "\")");
              if (_0x3d4c82.length > 0x0) {
                _0x3d4c82.parent("div").hide();
              }
            });
            $(".selectbox-item.selector").parent().show();
          }, 0xa);
        }
        if (_0x4ac370.name == 'select' && Lampa.Activity.active().component == "full" && $(".selectbox__title").text() == Lampa.Lang.translate("settings_rest_source") && localStorage.getItem("card_interfice_type") !== 'old' && Lampa.Storage.get("extend_play_buttons") == false) {
          $(".selectbox-item__title").show();
        }
      });
      Lampa.Listener.follow("full", function (_0x4d9c47) {
        if (localStorage.getItem("card_interfice_type") !== 'old') {
          return;
        }
        if (_0x4d9c47.type == "complite") {
          getButtonsContainer().classList.add("hide");
          setTimeout(function () {
            card_init();
            Lampa.Controller.move('right');
          }, 0x12c);
        }
      });
      Lampa.Storage.listener.follow('change', function (_0x207ea8) {
        if (localStorage.getItem("card_interfice_type") !== "old") {
          return;
        }
        if (_0x207ea8.name == "activity") {
          if (Lampa.Activity.active().component === "full") {
            if ($('.full-start__buttons').length > 0x0) {
              if (!window.lastfocus) {
                window.lastfocus = jQueryToNative($('.focus'));
              }
              if (!$(".focus")) {
                window.lastfocus = getButton();
              }
              if (!Lampa.Platform.screen("mobile")) {
                setCurrentPlayButtons();
                Lampa.Controller.focus(window.lastfocus);
                Navigator.focus(window.lastfocus);
              } else {
                var _0x3eff7d = setInterval(function () {
                  if (getButton()) {
                    Lampa.Controller.focus(getButton());
                    Navigator.focus(getButton());
                    setCurrentPlayButtons();
                    clearInterval(_0x3eff7d);
                  }
                }, 0xc8);
              }
              if (!$('.focus').hasClass('full-start__button')) {
                window.lastfocus = getButton();
                Lampa.Controller.focus(window.lastfocus);
                Navigator.focus(window.lastfocus);
              }
            }
          }
          if (Lampa.Activity.active().component === "favorite") {
            moveCardFavorite();
          }
        }
      });
      Navigator.follow("focus", function (_0x2f6b72) {
        var _0x2cfda6 = _0x2f6b72.target._collection || [];
        if (_0x2f6b72.elem) {
          var _0x291d01 = _0x2f6b72.elem;
          if (_0x291d01.classList.contains("full-start__button")) {
            var _0x1fddd4 = _0x2cfda6.indexOf(_0x291d01) + 0x1;
            if (_0x1fddd4 < 0x3) {
              _0x291d01.parentNode.parentNode.style.transform = "translate3d(0px, 0px, 0px)";
            }
          }
        }
      });
    }
  } // start

  /* запускаемся */

  if (window.appready) {
    start();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type == 'ready') {
        start();
      }
    });
  }
})();
