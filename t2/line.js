import { Trailer } from './trailer.js';

function Line(data) {
    this.data = data;
    this.cards = [];

    this.create = function () {
        this.cards = [];
        this.data.results.forEach(item => {
            const card = new Trailer(item, { type: this.data.type });
            card.create();
            this.cards.push(card);
        });
    };

    this.render = function () {
        const element = Lampa.Template.get('line', { title: this.data.title });
        this.cards.forEach(card => {
            element.find('.line__cards').append(card.render());
        });
        return element;
    };

    this.destroy = function () {
        this.cards.forEach(card => {
            card.destroy();
        });
        this.cards = [];
    };

    // Додаємо методи для навігації, які використовуються в component.js
    this.toggle = function () {
        if (this.cards.length) {
            Lampa.Controller.collectionSet(this.render());
            Lampa.Controller.collectionFocus(this.cards[0].render()[0], this.render());
        }
    };

    this.onDown = function () {};
    this.onUp = function () {};
    this.onBack = function () {};
}

export default Line;
