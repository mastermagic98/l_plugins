import { main } from './api.js';
import { Line } from './line.js';

function Component(object) {
    var scroll;
    var items = [];
    var active = 0;
    var light;

    this.create = function () {
        console.log('Component.create called'); // Діагностика
        try {
            scroll = $('<div class="trailers scroll--h"></div>');
            var menu = [];
            if (!Lampa.Platform.is('tizen')) {
                menu.push({
                    title: Lampa.Lang.translate('settings_reset'),
                    subtitle: Lampa.Lang.translate('trailers_clear_cache'),
                    clear: true
                });
            }
            Lampa.Component.add('trailers', this);
            this.build();
        } catch (e) {
            console.error('Error in Component.create:', e);
            scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
        }
    };

    this.build = function () {
        console.log('Component.build called'); // Діагностика
        try {
            if (!Lampa.Status) {
                console.error('Lampa.Status is undefined');
                scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
                return;
            }
            var status = new Lampa.Status(5);
            var results = {};
            status.onComplite = function () {
                console.log('Status completed:', results); // Діагностика
                var hasItems = false;
                for (var i in results) {
                    if (results[i].results && results[i].results.length) {
                        this.append(results[i]);
                        hasItems = true;
                    }
                }
                if (!hasItems) {
                    console.log('No items to display'); // Діагностика
                    scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
                }
                if (light) Lampa.Background.immediately('');
                this.activity.loader(false);
                this.activity.toggle();
            }.bind(this);
            main(status, results);
        } catch (e) {
            console.error('Error in Component.build:', e);
            scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
        }
    };

    this.append = function (element) {
        console.log('Component.append called:', element); // Діагностика
        try {
            var item = new Line(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onToggle = function () {
                active = items.indexOf(item);
            };
            item.wrap = $('<div></div>');
            if (light) {
                scroll.append(item.wrap);
            } else {
                scroll.append(item.render());
            }
            items.push(item);
        } catch (e) {
            console.error('Error in Component.append:', e);
        }
    };

    this.down = function () { /* ... */ };
    this.up = function () { /* ... */ };
    this.back = function () { /* ... */ };
    this.start = function () { /* ... */ };
    this.activity = object.activity;
    this.destroy = function () { /* ... */ };
}

export { Component };
