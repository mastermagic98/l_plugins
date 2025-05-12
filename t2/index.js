import { Trailer } from './trailer.js';
import { Line } from './line.js';
import { Component, Component$1 } from './component.js';
import { Api } from './api.js';
import { initTemplates, translations } from './templates.js';

function startPlugin() {
    if (window.plugin_trailers_ready) return;
    window.plugin_trailers_ready = true;

    // Додаємо переклади 
    Lampa.Lang.add(translations);

    // Реєструємо компоненти
    Lampa.Component.add('trailers_main', Component$1);
    Lampa.Component.add('trailers_full', Component);

    // Додаємо шаблони та стилі
    initTemplates();

    function add() {
        var button = $('<li class="menu__item selector"><div class="menu__ico"><svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg></div><div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div></li>');
        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                component: 'trailers_main',
                page: 1
            });
        });
        $('.menu .menu__list').eq(0).append(button);
        $('body').append(Lampa.Template.get('trailer_style', {}, true));
        Lampa.Storage.listener.follow('change', function (event) {
            if (event.name === 'language') {
                Api.clear();
            }
        });
    }

    if (Lampa.TMDB && Lampa.TMDB.key()) {
        add();
    } else {
        Lampa.Noty.show('TMDB API key is missing. Trailers plugin cannot be loaded.');
    }
}

// Запускаємо плагін
if (!window.appready) {
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            startPlugin();
        }
    });
} else {
    startPlugin();
}
