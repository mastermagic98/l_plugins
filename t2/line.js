import { Trailer } from './trailer.js';
import { Api } from './api.js';

function Line(data) {
    var line = this;

    this.create = function () {
        var items = [];
        var status = new Lampa.Status(data.results.length);

        status.onComplite = function () {
            items.forEach(function (card) {
                card.create();
            });
            line.cards = items;
        };

        data.results.forEach(function (item) {
            Api.videos(item, function (videos) {
                var trailers = videos.results ? videos.results.filter(function (v) {
                    return v.type === 'Trailer';
                }) : [];
                if (trailers.length > 0) {
                    var card = new Trailer(item, { type: data.type });
                    items.push(card);
                }
                status.append(item.id, {});
            }, function () {
                // Не додаємо картку, якщо трейлери не знайдено
                status.append(item.id, {});
            });
        });
    };

    this.render = function () {
        var element = Lampa.Template.get('line', { title: data.title });
        this.cards.forEach(function (card) {
            element.find('.line__cards').append(card.render());
        });
        return element;
    };

    this.destroy = function () {
        this.cards.forEach(function (card) {
            card.destroy();
        });
        this.cards = [];
    };
}

export default Line;
