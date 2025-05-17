(function() {
  'use strict';

  function Component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
    var items = [];
    var html = $('<div></div>');
    var body = $('<div class="category-full category-full--trailers"></div>');
    var newlampa = Lampa.Manifest.app_digital >= 166;
    var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
    var total_pages = 0;
    var last;
    var waitload = false;
    var active = 0;

    this.create = function() {
      TrailerPlugin.Api.full(object, this.build.bind(this), this.empty.bind(this));
      return this.render();
    };

    this.empty = function() {
      var empty = new Lampa.Empty();
      scroll.append(empty.render());
      this.start = empty.start;
      this.activity.loader(false);
      this.activity.toggle();
    };

    this.next = function() {
      var _this = this;
      if (waitload) return;
      if (object.page < total_pages && object.page < 30) {
        waitload = true;
        object.page++;
        TrailerPlugin.Api.full(object, function(result) {
          if (result.results && result.results.length) {
            _this.append(result, true);
          } else {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          }
          waitload = false;
        }, function() {
          Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          waitload = false;
        });
      } else {
        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
      }
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
      }
      return '';
    };

    this.append = function(data, append) {
      var _this2 = this;
      if (!append) body.empty();
      data.results.forEach(function(element) {
        var card = new TrailerPlugin.Trailer(element, { type: object.type });
        card.create();
        card.visible();
        card.onFocus = function(target, card_data) {
          last = target;
          scroll.update(card.render(), true);
          if (!light && !newlampa && scroll.isEnd()) _this2.next();
          if (items.length > 0 && items.indexOf(card) === items.length - 1) {
            var message = Lampa.Lang.translate('trailers_last_movie').replace('[title]', card_data.title || card_data.name);
            Lampa.Noty.show(message);
          }
        };
        body.append(card.render());
        items.push(card);
      });
      var cardCount = data.results.length;
      if (cardCount < 20) {
        for (var i = cardCount; i < 20; i++) {
          var placeholder = $('<div class="card card--placeholder" style="width: 33.3%; margin-bottom: 1.5em; visibility: hidden;"></div>');
          body.append(placeholder);
        }
      }
    };

    this.build = function(data) {
      var _this3 = this;
      if (data.results && data.results.length) {
        total_pages = data.total_pages || 1;
        scroll.minus();
        html.append(scroll.render());
        this.append(data);
        if (light && items.length) this.back();
        if (total_pages > data.page && items.length) {
          this.more();
        }
        scroll.append(body);
        if (newlampa) {
          scroll.onEnd = this.next.bind(this);
          scroll.onWheel = function(step) {
            if (!Lampa.Controller.own(_this3)) _this3.start();
            if (step > 0) Navigator.move('down');
            else if (active > 0) Navigator.move('up');
          }.bind(this);
          var debouncedLoad = TrailerPlugin.Utils.debounce(function() {
            if (scroll.isEnd() && !waitload) {
              _this3.next();
            }
          }, 100);
          scroll.render().on('scroll', debouncedLoad);
        }
        this.activity.loader(false);
        this.activity.toggle();
      } else {
        html.append(scroll.render());
        this.empty();
      }
    };

    this.more = function() {
      var _this = this;
      var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
      more.on('hover:enter', function() {
        var next = Lampa.Arrays.clone(object);
        delete next.activity;
        next.page = (next.page || 1) + 1;
        Lampa.Activity.push({
          url: next.url,
          title: object.title || Lampa.Lang.translate('title_trailers'),
          component: 'trailers_full',
          type: next.type,
          page: next.page
        });
      });
      body.append(more);
    };

    this.back = function() {
      last = items[0].render()[0];
      var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
      more.on('hover:enter', function() {
        if (object.page > 1) {
          Lampa.Activity.backward();
        } else {
          Lampa.Controller.toggle('head');
        }
      });
      body.prepend(more);
    };

    this.start = function() {
      if (Lampa.Activity.active().activity !== this.activity) return;
      Lampa.Controller.add('content', {
        link: this,
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(last || false, scroll.render());
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
        back: function() {
          Lampa.Activity.backward();
        }
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
      body.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.ComponentFull = Component;
})();
