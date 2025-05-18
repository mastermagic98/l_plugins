(function() {
  'use strict';

  function Line(params) {
    var _this = this;
    this.cards = [];
    this.params = params || {};
    this.element = null;

    this.create = function() {
      console.log('Line: Creating line for category:', this.params.title, 'Type:', this.params.type, 'Items:', this.params.results?.length || 0, 'Params:', this.params);
      if (!this.params.results || !Array.isArray(this.params.results)) {
        console.error('Line: Invalid or missing results for category:', this.params.type);
        return;
      }

      this.element = Lampa.Template.get('trailer_line', {
        title: this.params.title || 'Untitled'
      });
      if (!this.element || !this.element.find('.trailer-line__cards').length) {
        console.error('Line: Failed to create element or missing .trailer-line__cards for category:', this.params.type);
        this.element = null;
        return;
      }

      this.params.results.forEach(function(item, index) {
        console.log('Line: Creating card for item:', index, 'Item:', item);
        var card = new TrailerPlugin.Trailer(item, _this.params);
        card.create();
        var rendered = card.render();
        if (rendered) {
          _this.cards.push(card);
          _this.element.find('.trailer-line__cards').append(rendered);
          console.log('Line: Card added for item:', index);
        } else {
          console.warn('Line: Skipped null card for item at index:', index, 'Item:', item);
        }
      });

      console.log('Line: Created with cards:', this.cards.length, 'for category:', this.params.type);
    };

    this.render = function() {
      if (!this.element) {
        console.warn('Line: Render skipped, no element for category:', this.params.title);
        return null;
      }
      console.log('Line: Rendering line:', this.params.title, 'Cards:', this.cards.length);
      return this.element;
    };

    this.destroy = function() {
      console.log('Line: Destroying line:', this.params.title);
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
