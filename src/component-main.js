(function() {
  'use strict';

  function ComponentMain(params) {
    var _this = this;
    this.cards = [];
    this.lines = [];

    this.create = function() {
      var _this2 = this;
      Lampa.Loading.start(function() {
        TrailerPlugin.Api.clear();
        Lampa.Loading.stop();
      });
      TrailerPlugin.Api.main(function(data) {
        console.log('ComponentMain: Received data for categories:', data.length);
        _this2.cards = [];
        _this2.lines = [];
        data.forEach(function(category) {
          console.log('Processing category:', category.type, 'Items:', category.results.length);
          var line = new TrailerPlugin.Line(category);
          _this2.cards.push.apply(_this2.cards, line.cards);
          _this2.lines.push(line);
        });
        _this2.build();
        _this2.show();
      }, function() {
        console.error('ComponentMain: API main request failed');
        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
        Lampa.Controller.toggle('content');
      });
      Lampa.Controller.enabled().add('content', this);
      return this;
    };

    this.build = function() {
      var _this3 = this;
      this.lines.forEach(function(line) {
        console.log('Building line:', line.params.title, 'Cards:', line.cards.length);
        _this3.dom.content.append(line.render());
      });
    };

    this.show = function() {
      var _this4 = this;
      if (!this.cards.length) {
        console.warn('ComponentMain: No cards to show');
        return;
      }
      this.cards.forEach(function(card) {
        var rendered = card.render();
        if (rendered) {
          card.visible();
        } else {
          console.warn('ComponentMain: Skipped rendering null card');
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.loadMoreCards = function() {
      var _this5 = this;
      var target_line;
      var target_count = 20;
      this.cards.forEach(function(card) {
        var rendered = card.render();
        if (rendered && !card.visibled) {
          card.visible();
          target_count--;
        }
        if (target_count <= 0) return false;
      });
      this.lines.forEach(function(line) {
        if (line.params.page < 10 && line.cards.length < target_count * line.params.page) {
          target_line = line;
          return false;
        }
      });
      if (target_line) {
        console.log('Loading more for:', target_line.params.title, 'Page:', target_line.params.page + 1);
        TrailerPlugin.Api.full({
          url: target_line.params.url,
          type: target_line.params.type,
          page: target_line.params.page + 1
        }, function(data) {
          target_line.params.page++;
          data.results.forEach(function(item) {
            var card = new TrailerPlugin.Trailer(item, target_line.params);
            card.create();
            var rendered = card.render();
            if (rendered) {
              _this5.cards.push(card);
              target_line.cards.push(card);
              card.visible();
            } else {
              console.warn('ComponentMain: Skipped loading null card in loadMoreCards');
            }
          });
        }, function() {
          console.warn('ComponentMain: Failed to load more for', target_line.params.title);
        });
      }
    };

    this.visible = function() {
      var last = this.cards.filter(function(card) {
        return card.visibled;
      }).slice(-1)[0];
      if (last) {
        var rendered = last.render();
        if (rendered) {
          Lampa.Background.change(last.cardImgBackground(last.data));
        }
      }
    };

    this.onKey = function(event) {
      if (event.code === 'Enter' && this.cards.length) {
        var focused = this.cards.find(function(card) {
          return card.focused;
        });
        if (focused) {
          var rendered = focused.render();
          if (rendered) {
            Lampa.Activity.push({
              url: '',
              component: 'trailers_full',
              card: focused.data,
              type: focused.params.type,
              page: 1
            });
          }
        }
      }
    };

    this.destroy = function() {
      this.cards.forEach(function(card) {
        card.destroy();
      });
      this.lines.forEach(function(line) {
        line.destroy();
      });
      this.cards = [];
      this.lines = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.ComponentMain = ComponentMain;
})();
