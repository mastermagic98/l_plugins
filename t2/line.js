import { Trailer } from './trailer.js';

function Line(data) {
    console.log('Line constructor called'); // Діагностика
    this.data = data;
    this.cards = [];

    this.create = function () {
        console.log('Line.create called'); // Діагностика
        this.cards = [];
        this.data.results.forEach(item => {
            const card = new Trailer(item, { type: this.data.type });
            card.create();
            this.cards.push(card);
        });
    };

    this.render = function () {
        console.log('Line.render called'); // Діагностика
        const element = Lampa.Template.get('line', { title: this.data.title });
        this.cards.forEach(card => {
            const cardElement = card.render();
            if (cardElement && cardElement.length) {
                element.find('.line__cards').append(cardElement);
            }
        });
        return element;
    };

    this.destroy = function () {
        console.log('Line.destroy called'); // Діагностика
        this.cards.forEach(card => {
            card.destroy();
        });
        this.cards = [];
    };

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

export { Line }; // Явний експорт
