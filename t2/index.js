import { Component } from './component.js';
import { Api } from './api.js';

function startPlugin() {
    console.log('startPlugin called'); // Діагностика
    if (typeof Lampa === 'undefined' || !Lampa.Status || !Lampa.TMDB) {
        console.error('Lampa API not ready, retrying...');
        setTimeout(startPlugin, 100); // Повторна спроба через 100 мс
        return;
    }
    console.log('Lampa API ready:', Lampa.Status, Lampa.TMDB); // Діагностика
    Lampa.Lang.add({
        // ... (переклади)
    });
    Lampa.Plugin.add({
        url: '',
        title: Lampa.Lang.translate('title_trailers'),
        icon: '<svg>...</svg>',
        in_menu: true,
        in_cub: true,
        status: 1,
        start: function () {
            console.log('Plugin start triggered'); // Діагностика
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                component: 'trailers',
                page: 1
            });
        }
    });
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'app_ready') {
            Lampa.Template.add('trailers', '<div>...</div>');
            Lampa.Template.add('trailer', '<div>...</div>');
            Lampa.Template.add('line', '<div>...</div>');
        }
    });
}

startPlugin();

export { startPlugin, Api, Component };
