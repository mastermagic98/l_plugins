const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div class="full-start-new__title"></div><div class="full-start-new__tagline"></div><div class="full-start__title"></div><div class="full-start__title-original"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.$ = require('jquery')(dom.window); // Requires: npm install jquery

// Mock Lampa framework for testing in Node.js
global.Lampa = {
    SettingsApi: {
        addParam: function (config) {
            console.log('SettingsApi.addParam called:', config);
        }
    },
    Listener: {
        follow: function (eventType, callback) {
            console.log(`Listener.follow registered for ${eventType}`);
            // Simulate event for testing
            if (eventType === 'app') {
                callback({ type: 'ready' });
            } else if (eventType === 'full') {
                callback({
                    type: 'movie',
                    data: {
                        card_interfice_type: { id: 123, name: null }
                    },
                    render: {
                        full: {
                            html: function () {
                                return $('<div class="full-start-new cardify"></div>');
                            }
                        }
                    }
                });
            }
        }
    },
    Storage: {
        get: function (key) {
            const defaults = {
                language: 'en',
                card_interfice_type: 'new',
                logo_card: true
            };
            return defaults[key] || null;
        }
    },
    Platform: {
        tv: function () {
            console.log('Platform.tv called');
        }
    }
};

// Mock jQuery.get for TMDB API call
$.get = function (url, callback) {
    console.log(`Fetching from: ${url}`);
    // Simulate TMDB API response
    callback({
        logos: [{ file_path: '/example_logo.svg' }]
    });
};

(function () {
    'use strict';

    // Add a settings parameter to toggle logo display
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'logo_card',
            type: 'object',
            default: true
        },
        field: {
            name: 'Logo instead of title'
        },
        onRender: function () {
            setTimeout(function () {
                $('div[data-name="logo_card"]').remove();
                console.log('Removed logo_card div');
            }, 0);
        }
    });

    // Listen for activity events to modify the full card view
    Lampa.Listener.follow('full', function (event) {
        if (event.type === 'movie' && Lampa.Storage.get('logo_card') !== false) {
            const item = event.data.card_interfice_type;
            const mediaType = item.name ? 'tv' : 'movie';
            const apiKey = '4ef0d7355d9ffb5151e987764708ce96';
            const tmdbImageUrl = 'http://image.tmdb.org/t/p/w500';

            // Construct API URL to fetch logos
            const apiUrl = `http://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}&language=${Lampa.Storage.get('language')}`;

            // Fetch logo data from TMDB API
            $.get(apiUrl, function (response) {
                if (response.logos && response.logos[0]) {
                    const logoPath = response.logos[0].file_path;
                    if (logoPath !== '') {
                        const card = event.render.full.html();
                        let logoHtml;

                        // Determine logo display based on interface type and screen width
                        if (window.innerWidth > 585) {
                            if (Lampa.Storage.get('card_interfice_type') === 'new' && !$('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'new' && $('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = `<img style="margin-top: 0.6em; margin-bottom: 0.4em; max-height: 2.8em;" src="${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__title', card).html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !$('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            }
                        } else {
                            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.8em; max-width: 6.8em;" src="${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            } else {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            }
                        }
                        console.log('Logo rendered:', logoHtml);
                    }
                }
            });
        }
    });

    // Execute the plugin when the app is ready
    if (window.appready) {
        Lampa.Platform.tv();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                Lampa.Platform.tv();
            }
        });
    }
})();
