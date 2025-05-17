(function() {
  'use strict';

  function Component$1(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
    var items = [];
    var html = $('<div></div>');
    var active = 0;
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;

    this.create = function() {
      TrailerPlugin.Api.main(this.build.bind(this), this.empty.bind(this));
      return this.render();
    };

    this.empty = function() {
      var empty = new Lampa.Empty();
      html.append(empty.render());
      this.start = empty.start;
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.build = function(data) {
      var _this = this;
      scroll.minus();
      html.append(scroll.render());
      data.forEach(this.append.bind(this));
      if (light) {
        scroll.onWheel = function(step) {
          if (step > 0) _this.down();
          else _this.up();
        };
      }
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.append = function(element) {
      var item = new TrailerPlugin.Line(element);
      item.create();
      item.onDown = this.down.bind(this);
      item.onUp = this.up.bind(this);
      item.onBack = this.back.bind(this);
      item.onToggle = function() {
        active = items.indexOf(item);
      };
      item.wrap = $('<div></div>');
      if (light) {
        scroll.append(item.wrap);
      } else {
        scroll.append(item.render());
      }
      items.push(item);
    };

    this.back = function() {
      Lampa.Activity.backward();
    };

    this.detach = function() {
      if (light) {
        items.forEach(function(item) {
          item.render().detach();
        });
        items.slice(active, active + 2).forEach(function(item) {
          item.wrap.append(item.render());
        });
      }
    };

    this.down = function() {
      active++;
      active = Math.min(active, items.length - 1);
      this.detach();
      items[active].toggle();
      scroll.update(items[active].render());
    };

    this.up = function() {
      active--;
      if (active < 0) {
        active = 0;
        this.detach();
        Lampa.Controller.toggle('head');
      } else {
        this.detach();
        items[active].toggle();
      }
      scroll.update(items[active].render());
    };

    this.start = function() {
      var _this2 = this;
      if (Lampa.Activity.active().activity !== this.activity) return;
      Lampa.Controller.add('content', {
        toggle: function() {
          if (items.length) {
            _this2.detach();
            items[active].toggle();
          }
        },
        left: function() {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function() {
          Navigator.move('right');
        },
        up: function() {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function() {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: this.back
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function() {};
    this.stop = function() {};
    this.render = function() {
      return html;
    };

    this.destroy = function() {
      Lampa.Arrays.destroy(items);
      scroll.destroy();
      html.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.ComponentMain = Component$1;
})();
