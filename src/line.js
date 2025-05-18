(function() {
  'use strict';

  function Line(params) {
    var _this = this;
    this.cards = [];
    this.params = params;
    this.element = null;

    this.create = function() {
      console.log('Line: Creating line for category:', params.title, 'Items:', params.results?.length || 0);
      if (!params.results || !Array.isArray(params.results)) {
        console.error('Line: Invalid or missing results for category:', params.type);
        return;
      }

      this.element = Lampa.Template.get('trailer_line', {
        title: params.title
      });

      params.results.forEach(function(item) {
        var card = new TrailerPlugin.Trailer(item, params);
        card.create();
        var rendered = card.render();
        if (rendered) {
          _this.cards.push(card);
          _this.element.find('.trailer-line__cards').append(rendered);
        } else {
          console.warn('Line: Skipped null card for item:', item);
        }
      });

      console.log('Line: Created with cards:', this.cards.length);
    };

    this.render = function() {
      if (!this.element) {
        console.warn('Line: Render skipped, no element for category:', params.title);
        return null;
      }
      return this.element;
    };

    this.destroy = function() {
      console.log('Line: Destroying line:', params.title);
      this.cards.forEach(function(card) {
        card.destroy();
      });
      if (this.element) {
        this.element.remove();
      }
      this.cards = [];
      this.element = null;
    };

    // Ініціалізація
    this.create();
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Line = Line;
})();
