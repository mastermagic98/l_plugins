import { Component } from './component.js';
import { Api } from './api.js';

function initPlugin() {
    console.log('initPlugin called');
    if (typeof Lampa === 'undefined') {
        console.error('Lampa not defined, retrying...');
        setTimeout(initPlugin, 100);
        return;
    }

    // Спроба ініціалізації одразу
    initializePlugin();

    // Додаткове очікування app_ready
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'app_ready') {
            console.log('Lampa app ready:', typeof Lampa.Status, typeof Lampa.TMDB);
            initializePlugin();
        }
    });
}

function initializePlugin() {
    console.log('initializePlugin called');
    if (!Lampa.Status || !Lampa.TMDB) {
        console.error('Lampa API not available:', { Status: Lampa.Status, TMDB: Lampa.TMDB });
        return;
    }

    // Додавання перекладів
    Lampa.Lang.add({
        trailers_in_theaters: { ru: 'В кинотеатрах', uk: 'У кінотеатрах', en: 'In Theaters' },
        trailers_upcoming: { ru: 'Скоро', uk: 'Незабаром', en: 'Upcoming' },
        trailers_series_new: { ru: 'Новые сезоны', uk: 'Нові сезони', en: 'New Seasons' },
        trailers_series_upcoming: { ru: 'Скоро сериалы', uk: 'Незабаром серіали', en: 'Upcoming Series' },
        trailers_popular: { ru: 'Популярные трейлеры', uk: 'Популярні трейлери', en: 'Popular Trailers' },
        trailers_empty: { ru: 'Здесь пусто', uk: 'Тут порожньо', en: 'Nothing here' },
        trailers_clear_cache: { ru: 'Очистить кэш', uk: 'Очистити кеш', en: 'Clear cache' },
        title_trailers: { ru: 'Трейлеры', uk: 'Трейлери', en: 'Trailers' }
    });

    // Реєстрація плагіна
    Lampa.Plugin.add({
        url: '',
        title: Lampa.Lang.translate('title_trailers'),
        icon: '<svg width="24" height="24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
        in_menu: true,
        in_cub: true,
        status: 1,
        component: 'trailers', // Додано для асоціації з компонентом
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

    // Додавання шаблонів
    Lampa.Template.add('trailers', '<div class="trailers__body"></div>');
    Lampa.Template.add('trailer', '<div class="trailer card--trailer"><div class="trailer__content"></div></div>');
    Lampa.Template.add('line', '<div class="line"><div class="line__title"></div><div class="line__cards scroll--h"></div></div>');

    console.log('Plugin initialized');
}

// Автоматичний виклик
initPlugin();

// Експорт для Webpack
window.LampaPlugin = { initPlugin, Api, Component };
