(function () {
    'use strict';

    if (window.UACollections && window.UACollections.__initialized) return;

    window.UACollections = window.UACollections || {};
    window.UACollections.__initialized = true;

    // Localization for UI strings (English and Ukrainian only)
    Lampa.Lang.add({
        uaCollections_menu_title: {
            en: "Ukrainian Collections",
            uk: "Українські колекції"
        },
        uaCollections_ua_films: {
            en: "Ukrainian Films",
            uk: "Українські фільми"
        },
        uaCollections_ua_series: {
            en: "Ukrainian Series",
            uk: "Українські серіали"
        },
        uaCollections_ua_cartoons: {
            en: "Ukrainian Cartoons",
            uk: "Українські мультфільми"
        },
        uaCollections_ua_cartoon_series: {
            en: "Ukrainian Cartoon Series",
            uk: "Українські мультсеріали"
        },
        uaCollections_sorting: {
            en: "Sorting",
            uk: "Сортування"
        },
        uaCollections_vote_count_desc: {
            en: "Most Votes",
            uk: "Багато голосів"
        },
        uaCollections_vote_average_desc: {
            en: "High Rating",
            uk: "Високий рейтинг"
        },
        uaCollections_first_air_date_desc: {
            en: "New Releases",
            uk: "Новинки"
        },
        uaCollections_popularity_desc: {
            en: "Popular",
            uk: "Популярні"
        },
        uaCollections_revenue_desc: {
            en: "Audience Interest",
            uk: "Інтерес глядачів"
        }
    });

    // Get today's date in YYYY-MM-DD format
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    var formattedDate = year + '-' + month + '-' + day;

    // Hardcoded Ukrainian collections with TMDB requests
    var uaCollections = [
        {
            title: Lampa.Lang.translate('uaCollections_ua_films'),
            img: 'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/2y2Z22p2x3iX3MKcW7G7mmy3Kmo.jpg', // Example image for Ukrainian films
            request: 'discover/movie?with_origin_country=UA&sort_by=release_date.desc&vote_count.gte=5&vote_average.gte=5&release_date.lte=' + formattedDate
        },
        {
            title: Lampa.Lang.translate('uaCollections_ua_series'),
            img: 'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/3z5xW56hT1r1s3X3n8JNZ1hVapp.jpg', // Example image for Ukrainian series
            request: 'discover/tv?with_origin_country=UA&sort_by=first_air_date.desc&vote_count.gte=5&vote_average.gte=5&first_air_date.lte=' + formattedDate
        },
        {
            title: Lampa.Lang.translate('uaCollections_ua_cartoons'),
            img: 'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/zo8CIjJ2nfNOevqNajwMRO6Hwka.jpg', // Reused cartoon image
            request: 'discover/movie?with_genres=16&with_original_language=uk&sort_by=release_date.desc&vote_count.gte=5&vote_average.gte=5&release_date.lte=' + formattedDate + '&include_adult=false'
        },
        {
            title: Lampa.Lang.translate('uaCollections_ua_cartoon_series'),
            img: 'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/3MY7hMWrJ13Xtb1Y4jd7tztyPaZ.jpg', // Reused cartoon series image
            request: 'discover/tv?with_genres=16&with_original_language=uk&sort_by=first_air_date.desc&vote_count.gte=5&vote_average.gte=5&first_air_date.lte=' + formattedDate + '&include_adult=false'
        }
    ];

    var sortOptionsTV = [
        { id: 'first_air_date.desc', title: 'uaCollections_first_air_date_desc', extraParams: '' },
        { id: 'vote_average.desc', title: 'uaCollections_vote_average_desc', extraParams: '' },
        { id: 'popularity.desc', title: 'uaCollections_popularity_desc', extraParams: '' }
    ];

    var sortOptionsMovie = [
        { id: 'release_date.desc', title: 'uaCollections_first_air_date_desc', extraParams: '' },
        { id: 'vote_average.desc', title: 'uaCollections_vote_average_desc', extraParams: '' },
        { id: 'popularity.desc', title: 'uaCollections_popularity_desc', extraParams: '' }
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

        if (!isNewRelease) {
            params += '&vote_count.gte=30';
        } else {
            params += '&vote_count.gte=5';
        }

        params += '&without_keywords=' + encodeURIComponent(baseExcludedKeywords.join(','));

        sort.extraParams = params;
        return sort;
    }

    function main(params, oncomplite, onerror) {
        var data = {
            collection: true,
            total_pages: 1,
            results: uaCollections.map(function(item) {
                return {
                    title: item.title,
                    poster_path: item.img,
                    backdrop_path: item.img,
                    hpu: item.request
                };
            })
        };
        oncomplite(data);
    }

    function full(params, oncomplite, onerror) {
        var network = new Lampa.Reguest();
        var url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + params.url + '&page=' + (params.page || 1);

        network.native(url, function(data) {
            data.title = params.title;
            oncomplite(data);
        }, onerror);
    }

    function clear() {
        // Cleanup resources
    }

    var Api = {
        main: main,
        full: full,
        clear: clear
    };

    function showSortList(collection) {
        var sortItems = [];
        var isMovie = collection.request.startsWith('discover/movie');
        var currentSortOptions = isMovie ? sortOptionsMovie : sortOptionsTV;

        for (var i = 0; i < currentSortOptions.length; i++) {
            sortItems.push({
                title: Lampa.Lang.translate(currentSortOptions[i].title),
                sort: applySortParams(currentSortOptions[i], { isUkrainian: true })
            });
        }

        Lampa.Select.show({
            title: Lampa.Lang.translate('uaCollections_sorting'),
            items: sortItems,
            onSelect: function (sortItem) {
                var sort = sortItem.sort;
                var url = collection.request.split('?')[0] + '?' + collection.request.split('?')[1].split('&sort_by=')[0] + '&sort_by=' + sort.id + sort.extraParams;

                Lampa.Activity.push({
                    url: url,
                    title: collection.title,
                    component: 'category_full',
                    source: 'tmdb',
                    card_type: 'true',
                    page: 1,
                    sort_by: sort.id
                });
            },
            onBack: function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('uaCollections_menu_title'),
                    component: 'ua_collections',
                    page: 1
                });
            }
        });
    }

    function component$1(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function() {
            Api.main(object, this.build.bind(this), this.empty.bind(this));
        };

        comp.nextPageReuest = function(object, resolve, reject) {
            Api.main(object, resolve.bind(comp), reject.bind(comp));
        };

        comp.cardRender = function(object, element, card) {
            card.onMenu = false;

            card.onEnter = function() {
                showSortList({
                    title: element.title,
                    request: element.hpu
                });
            };
        };

        return comp;
    }

    function component(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function() {
            Api.full(object, this.build.bind(this), this.empty.bind(this));
        };

        comp.nextPageReuest = function(object, resolve, reject) {
            Api.full(object, resolve.bind(comp), reject.bind(comp));
        };

        return comp;
    }

    function startPlugin() {
        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: Lampa.Lang.translate('uaCollections_menu_title'),
            description: 'Ukrainian collections for films, series, and cartoons',
            component: 'ua_collections'
        };

        if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
        Lampa.Manifest.plugins['ua_collections'] = manifest;

        Lampa.Component.add('ua_collections', component$1);
        Lampa.Component.add('ua_collection', component);

        var menu_icon = '<svg width="191" height="239" viewBox="0 0 191 239" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path fill-rule="evenodd" clip-rule="evenodd" d="M35.3438 35.3414V26.7477C35.3438 19.9156 38.0594 13.3543 42.8934 8.51604C47.7297 3.68251 54.2874 0.967027 61.125 0.966431H164.25C171.086 0.966431 177.643 3.68206 182.482 8.51604C187.315 13.3524 190.031 19.91 190.031 26.7477V186.471C190.031 189.87 189.022 193.192 187.133 196.018C185.245 198.844 182.561 201.046 179.421 202.347C176.28 203.647 172.825 203.988 169.492 203.325C166.158 202.662 163.096 201.026 160.692 198.623L155.656 193.587V220.846C155.656 224.245 154.647 227.567 152.758 230.393C150.87 233.219 148.186 235.421 145.046 236.722C141.905 238.022 138.45 238.363 135.117 237.7C131.783 237.037 128.721 235.401 126.317 232.998L78.3125 184.993L30.3078 232.998C27.9041 235.401 24.8419 237.037 21.5084 237.7C18.1748 238.363 14.7195 238.022 11.5794 236.722C8.43922 235.421 5.75517 233.219 3.86654 230.393C1.9779 227.567 0.969476 224.245 0.96875 220.846V61.1227C0.96875 54.2906 3.68437 47.7293 8.51836 42.891C13.3547 38.0575 19.9124 35.342 26.75 35.3414H35.3438ZM138.469 220.846V61.1227C138.469 58.8435 137.563 56.6576 135.952 55.046C134.34 53.4343 132.154 52.5289 129.875 52.5289H26.75C24.4708 52.5289 22.2849 53.4343 20.6733 55.046C19.0617 56.6576 18.1562 58.8435 18.1562 61.1227V220.846L66.1609 172.841C69.3841 169.619 73.755 167.809 78.3125 167.809C82.87 167.809 87.2409 169.619 90.4641 172.841L138.469 220.846ZM155.656 169.284L172.844 186.471V26.7477C172.844 24.4685 171.938 22.2826 170.327 20.671C168.715 19.0593 166.529 18.1539 164.25 18.1539H61.125C58.8458 18.1539 56.6599 19.0593 55.0483 20.671C53.4367 22.2826 52.5312 24.4685 52.5312 26.7477V35.3414H129.875C136.711 35.3414 143.268 38.0571 148.107 42.891C152.94 47.7274 155.656 54.285 155.656 61.1227V169.284Z" fill="currentColor"/>\n                </svg>';

        function add() {
            var button = $('<li class="menu__item selector" data-action="ua_collections">' +
                '<div class="menu__ico">' + menu_icon + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('uaCollections_menu_title') + '</div>' +
                '</li>');

            button.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('uaCollections_menu_title'),
                    component: 'ua_collections',
                    page: 1
                });
            });

            $('.menu .menu__list').eq(0).append(button);
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') add();
            });
        }
    }

    if (!window.ua_collections_ready) {
        window.ua_collections_ready = true;
        startPlugin();
    }
})();
