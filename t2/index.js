// l_plugins/t2/index.js
import { Trailer } from './trailer.js';
import { Line } from './line.js';
import { Component, Component$1 } from './component.js';
import { Api } from './api.js';
import { initTemplates } from './templates.js';

(function () {
    'use strict';

    function startPlugin() {
        if (window.plugin_trailers_ready) return;
        window.plugin_trailers_ready = true;

        // Очищення кешу при зміні мови
        var currentLang = Lampa.Storage.get('language', 'ru');
        var lastLang = Lampa.Storage.get('trailer_last_lang', '');
        if (currentLang !== lastLang) {
            ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
                Lampa.Storage.set('trailer_category_cache_' + key, null);
            });
            Lampa.Storage.set('trailer_last_lang', currentLang);
        }

        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);

        initTemplates();

        var menu_item = {
            title: Lampa.Lang.translate('trailers_main'),
            url: '',
            component: 'trailers_main',
            tab: 'trailers'
        };

        var menu = Lampa.Storage.get('menu', '[]').filter(function (m) {
            return m.component !== 'trailers_main';
        });

        menu.splice(1, 0, menu_item);
        Lampa.Storage.set('menu', menu);

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(function () {
                    if (Lampa.Storage.get('trailers_start', true)) {
                        Lampa.Storage.set('trailers_start', false);
                        Lampa.Activity.push({
                            url: '',
                            title: Lampa.Lang.translate('trailers_main'),
                            component: 'trailers_main',
                            page: 1
                        });
                    }
                }, 1000);
            }
        });
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
