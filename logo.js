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
        // Hide the logo_card settings field
        setTimeout(function () {
            $('div[data-name="logo_card"]').remove();
        }, 0);
    }
});

// Listen for activity events to modify the full card view
Lampa.Listener.follow('full', function (event) {
    if (event.type === 'movie' && Lampa.Storage.get('logo_card') !== false) {
        var item = event.data.card_interfice_type,
            mediaType = item.name ? 'tv' : 'movie',
            apiKey = '4ef0d7355d9ffb5151e987764708ce96',
            proxyUrl = 'http://212.113.103.137:9118/proxy/',
            tmdbImageUrl = 'http://image.tmdb.org/t/p/w500';

        // Construct API URL to fetch logos
        var apiUrl = `http://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}&language=${Lampa.Storage.get('language')}`;

        // Fetch logo data from TMDB API
        $.get(apiUrl, function (response) {
            if (response.logos && response.logos[0]) {
                var logoPath = response.logos[0].file_path;
                if (logoPath !== '') {
                    var card = event.render.full.html(),
                        logoHtml;

                    // Determine logo display based on interface type and screen width
                    if (window.innerWidth > 585) {
                        if (Lampa.Storage.get('card_interfice_type') === 'new' && !$('div[data-name="card_interfice_cover"]').length) {
                            logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="${proxyUrl}${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                            $('.full-start-new__tagline', card).remove();
                            $('.full-start-new__title', card).html(logoHtml);
                        } else if (Lampa.Storage.get('card_interfice_type') === 'new' && $('div[data-name="card_interfice_cover"]').length) {
                            logoHtml = `<img style="margin-top: 0.6em; margin-bottom: 0.4em; max-height: 2.8em;" src="${proxyUrl}${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                            $('.full-start-new__title', card).html(logoHtml);
                        } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !$('div[data-name="card_interfice_cover"]').length) {
                            logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${proxyUrl}${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                            $('.full-start__title-original', card).remove();
                            $('.full-start__title', card).html(logoHtml);
                        }
                    } else {
                        if (Lampa.Storage.get('card_interfice_type') === 'new') {
                            logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.8em; max-width: 6.8em;" src="${proxyUrl}${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                            $('.full-start-new__tagline', card).remove();
                            $('.full-start-new__title', card).html(logoHtml);
                        } else {
                            logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="${proxyUrl}${tmdbImageUrl}${logoPath.replace('.svg', '.png')}" />`;
                            $('.full-start__title-original', card).remove();
                            $('.full-start__title', card).html(logoHtml);
                        }
                    }
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
