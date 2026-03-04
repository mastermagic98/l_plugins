(function () {
    'use strict';

    if (window.UASelect && window.UASelect.__initialized) return;

    window.UASelect = window.UASelect || {};
    window.UASelect.__initialized = true;

    // Localization for UI strings (English and Ukrainian only)
    Lampa.Lang.add({
        uaSelect_menu_title: {
            en: "Ukrainian Collections",
            uk: "Українські колекції"
        },
        uaSelect_ua_films: {
            en: "Ukrainian Films",
            uk: "Українські фільми"
        },
        uaSelect_ua_series: {
            en: "Ukrainian Series",
            uk: "Українські серіали"
        },
        uaSelect_ua_cartoons: {
            en: "Ukrainian Cartoons",
            uk: "Українські мультфільми"
        },
        uaSelect_ua_cartoon_series: {
            en: "Ukrainian Cartoon Series",
            uk: "Українські мультсеріали"
        },
        uaSelect_sorting: {
            en: "Sorting",
            uk: "Сортування"
        },
        uaSelect_vote_count_desc: {
            en: "Most Votes",
            uk: "Багато голосів"
        },
        uaSelect_vote_average_desc: {
            en: "High Rating",
            uk: "Високий рейтинг"
        },
        uaSelect_first_air_date_desc: {
            en: "New Releases",
            uk: "Новинки"
        },
        uaSelect_popularity_desc: {
            en: "Popular",
            uk: "Популярні"
        },
        uaSelect_revenue_desc: {
            en: "Audience Interest",
            uk: "Інтерес глядачів"
        }
    });

    var sortOptionsTV = [
        { id: 'first_air_date.desc', title: 'uaSelect_first_air_date_desc', extraParams: '' },
        { id: 'vote_average.desc', title: 'uaSelect_vote_average_desc', extraParams: '' },
        { id: 'popularity.desc', title: 'uaSelect_popularity_desc', extraParams: '' }
    ];

    var sortOptionsMovie = [
        { id: 'release_date.desc', title: 'uaSelect_first_air_date_desc', extraParams: '' },
        { id: 'vote_average.desc', title: 'uaSelect_vote_average_desc', extraParams: '' },
        { id: 'popularity.desc', title: 'uaSelect_popularity_desc', extraParams: '' }
    ];

    var baseExcludedKeywords = ['346488', '158718', '41278', '196034', '272265', '13141', '345822', '315535', '290667', '323477', '290609'];

    function applySortParams(sort, options) {
        var params = '';
        var now = new Date();

        var isNewRelease = sort.id === 'first_air_date.desc' || sort.id === 'release_date.desc';

        if (sort.id === 'first_air_date.desc') {
            var end = new Date(now);
            end.setDate(now.getDate() - 10);
            var start = new Date(now);
            start.setFullYear(start.getFullYear() - 1);

            params += '&first_air_date.gte=' + start.toISOString().split('T')[0];
            params += '&first_air_date.lte=' + end.toISOString().split('T')[0];
        }

        if (sort.id === 'release_date.desc') {
            var end = new Date(now);
            end.setDate(now.getDate() - 40);
            var start = new Date(now);
            start.setFullYear(start.getFullYear() - 1);

            params += '&release_date.gte=' + start.toISOString().split('T')[0];
            params += '&release_date.lte=' + end.toISOString().split('T')[0];
        }

        if (!options.isUkrainian || !isNewRelease) {
            params += '&vote_count.gte=30';
        } else if (options.isUkrainian && sort.id === 'release_date.desc') {
            params += '&vote_count.gte=5';
        }

        params += '&without_keywords=' + encodeURIComponent(baseExcludedKeywords.join(','));

        sort.extraParams = params;
        return sort;
    }

    function showUASelectMenu() {
        var items = [
            { title: Lampa.Lang.translate('uaSelect_ua_films'), url: 'discover/movie?with_origin_country=UA', type: 'movie' },
            { title: Lampa.Lang.translate('uaSelect_ua_series'), url: 'discover/tv?with_origin_country=UA', type: 'tv' },
            { title: Lampa.Lang.translate('uaSelect_ua_cartoons'), url: 'discover/movie?with_genres=16&with_original_language=uk', type: 'movie' },
            { title: Lampa.Lang.translate('uaSelect_ua_cartoon_series'), url: 'discover/tv?with_genres=16&with_original_language=uk', type: 'tv' }
        ];

        Lampa.Select.show({
            title: Lampa.Lang.translate('uaSelect_menu_title'),
            items: items,
            onSelect: function (item) {
                showSortList(item);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function showSortList(service) {
        var sortItems = [];
        var isMovie = service.url.startsWith('discover/movie');
        var currentSortOptions = isMovie ? sortOptionsMovie : sortOptionsTV;

        for (var i = 0; i < currentSortOptions.length; i++) {
            sortItems.push({
                title: Lampa.Lang.translate(currentSortOptions[i].title),
                sort: applySortParams(currentSortOptions[i], {
                    isUkrainian: true
                })
            });
        }

        Lampa.Select.show({
            title: Lampa.Lang.translate('uaSelect_sorting'),
            items: sortItems,
            onSelect: function (sortItem) {
                var sort = sortItem.sort;
                var url = service.url + sort.extraParams;

                Lampa.Activity.push({
                    url: url,
                    title: service.title,
                    component: 'category_full',
                    card_type: 'true',
                    page: 1,
                    sort_by: sort.id,
                    source: 'tmdb'
                });
            },
            onBack: showUASelectMenu
        });
    }

    function initPlugin() {
        var sidebarButtonIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512">   <g stroke-width="0" transform="matrix(0.8, 0, 0, 0.8, -0.000002, 0)"></g>  <g stroke-linecap="round" stroke-linejoin="round" transform="matrix(0.8, 0, 0, 0.8, -0.000002, 0)"></g>   <g transform="matrix(0.8, 0, 0, 0.8, -0.000004, 102.4)">    <path fill="CurrentColor" d="M 592 -64 L 48 -64 C 21.49 -64 0 -42.51 0 -16 L 0 304 C 0 330.51 21.49 352 48 352 L 288 352 L 288 384 L 112 384 C 103.163 384 96 391.163 96 400 L 96 432 C 96 440.837 103.163 448 112 448 L 528 448 C 536.837 448 544 440.837 544 432 L 544 400 C 544 391.163 536.837 384 528 384 L 352 384 L 352 352 L 592 352 C 618.51 352 640 330.51 640 304 L 640 -16 C 640 -42.51 618.51 -64 592 -64 Z M 576 288 L 64 288 L 64 0 L 576 0 L 576 288 Z"></path>  </g>  <g transform="matrix(1, 0, 0, 1, -283.995663, -30.755001)">    <g stroke-width="0" transform="matrix(1, 0, 0, 1, 411.873653, 162.499998)"></g>    <g stroke-linecap="round" stroke-linejoin="round" transform="matrix(1, 0, 0, 1, 411.873653, 162.499998)"></g>    <g transform="matrix(1, 0, 0, 1, 411.873653, 162.499998)">      <polygon fill="CurrentColor" points="256.122 67.362 254.275 62.982 241.488 55.357 225.268 55.475 216.411 44.867 206.206 48.987 198.083 45.885 192.448 47.779 181.863 29.285 174.356 28.646 169.289 8.921 149.019 5.843 145.065 10.91 128.134 10.697 122.688 18.63 122.143 28.504 116.839 23.081 106.017 24.928 103.199 19.411 83.403 21.092 55.84 9.324 40.354 8.471 28.751 18.866 33.297 34.921 9.878 55.996 11.536 67.528 7.084 65.61 0.122 75.319 11.488 89.55 33.108 93.67 37.796 99.046 56.432 94.783 58.729 90.237 76.441 85.998 95.361 97.412 98.558 107.665 104.762 112.496 104.431 120.641 109.356 130.066 98.534 133.097 94.509 140.58 83.569 150.359 90.957 157.061 112.127 145.268 122.451 132.079 128.347 128.29 139.903 126.49 138.174 130.776 137.629 131.605 144.212 139.348 164.695 139.443 165.713 143.966 148.072 153.816 163.866 161.678 164.009 166.888 161.12 173.115 166.542 176.667 175.659 173.399 195.479 160.589 207.839 161.157 209.686 153.295 202.867 152.846 193.016 156.729 185.51 147.636 169.287 137.454 189.156 136.057 189.369 136.175 198.368 127.295 222.758 116.663 232.087 115.811 233.342 104.8 242.885 98.69 253.423 98.335 255.956 88.532 251.386 75.413"></polygon>    </g>  </g></svg>';

        var menuItem = $('<li class="menu__item selector" data-action="ua_collections">' +
            '<div class="menu__ico">' + sidebarButtonIcon + '</div>' +
            '<div class="menu__text">' + Lampa.Lang.translate('uaSelect_menu_title') + '</div>' +
            '</li>');

        menuItem.on('hover:enter', function () {
            showUASelectMenu();
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }

    window.UASelect.showUASelectMenu = showUASelectMenu;
})();
