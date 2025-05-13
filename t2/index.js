import { Component } from './component.js';
import { Api } from './api.js';

function initPlugin() {
    console.log('initPlugin called');
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'app_ready') {
            console.log('Lampa app ready:', Lampa.Status, Lampa.TMDB);
            if (!Lampa.Status || !Lampa.TMDB) {
                console.error('Lampa API not available');
                return;
            }
            Lampa.Lang.add({
                trailers_in_theaters: { ru: 'В кинотеатрах', uk: 'У кінотеатрах', en: 'In Theaters' },
                // ... (інші переклади)
            });
            Lampa.Plugin.add({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                icon: '<svg>...</svg>',
                in_menu: true,
                in_cub: true,
                status: 1,
                start: function () {
                    console.log('Plugin start triggered');
                    Lampa.Activity.push({
                        url: '',
                        title: Lampa.Lang.translate('title_trailers'),
                        component: 'trailers',
                        page: 1
                    });
                }
            });
            Lampa.Template.add('trailers', '<div>...</div>');
            Lampa.Template.add('trailer', '<div>...</div>');
            Lampa.Template.add('line', '<div>...</div>');
        }
    });
}

initPlugin();

export { initPlugin, Api, Component };
