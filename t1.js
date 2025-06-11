(function () {
    'use strict';

    var menu_icon = '<svg width="191" height="239" viewBox="0 0 191 239" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M35.3438 35.3414V26.7477C35.3438 19.9156 38.0594 13.3543 42.8934 8.51604C47.7297 3.68251 54.2874 0.967027 61.125 0.966431H164.25C171.086 0.966431 177.643 3.68206 182.482 8.51604C187.315 13.3524 190.031 19.91 190.031 26.7477V186.471C190.031 189.87 189.022 193.192 187.133 196.018C185.245 198.844 182.561 201.046 179.421 202.347C176.28 203.647 172.825 203.988 169.492 203.325C166.158 202.662 163.096 201.026 160.692 198.623L155.656 193.587V220.846C155.656 224.245 154.647 227.567 152.758 230.393C150.87 233.219 148.186 235.421 145.046 236.722C141.905 238.022 138.45 238.363 135.117 237.7C131.783 237.037 128.721 235.401 126.317 232.998L78.3125 184.993L30.3078 232.998C27.9041 235.401 24.8419 237.037 21.5084 237.7C18.1748 238.363 14.7195 238.022 11.5794 236.722C8.43922 235.421 5.75517 233.219 3.86654 230.393C1.9779 227.567 0.969476 224.245 0.96875 220.846V61.1227C0.96875 54.2906 3.68437 47.7293 8.51836 42.891C13.3547 38.0575 19.9124 35.342 26.75 35.3414H35.3438ZM138.469 220.846V61.1227C138.469 58.8435 137.563 56.6576 135.952 55.046C134.34 53.4343 132.154 52.5289 129.875 52.5289H26.75C24.4708 52.5289 22.2849 53.4343 20.6733 55.046C19.0617 56.6576 18.1562 58.8435 18.1562 61.1227V220.846L66.1609 172.841C69.3841 169.619 73.755 167.809 78.3125 167.809C82.87 167.809 87.2409 169.619 90.4641 172.841L138.469 220.846ZM155.656 169.284L172.844 186.471V26.7477C172.844 24.4685 171.938 22.2826 170.327 20.671C168.715 19.0593 166.529 18.1539 164.25 18.1539H61.125C58.8458 18.1539 56.6599 19.0593 55.0483 20.671C53.4367 22.2826 52.5312 24.4685 52.5312 26.7477V35.3414H129.875C136.711 35.3414 143.268 38.0571 148.107 42.891C152.94 47.7274 155.656 54.285 155.656 61.1227V169.284Z" fill="currentColor"/></svg>';

    // Localization (English and Ukrainian)
    Lampa.Lang.add({
        uaCollections_title: {
            en: "Themed Collections",
            uk: "Тематичні колекції"
        },
        uaCollections_fast_furious: {
            en: "All Fast & Furious Movies",
            uk: "Усі фільми франшизи «Форсаж»"
        },
        uaCollections_items: {
            en: "{0} items",
            uk: "{0} елементів"
        },
        uaCollections_no_data: {
            en: "No data available",
            uk: "Немає даних"
        }
    });

    // Hardcoded collection for Fast & Furious
    var hardcoded_collections = [
        {
            title: Lampa.Lang.translate('uaCollections_fast_furious'),
            img: 'https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/8M5YqS7W1W2qN2caS7oDGvM4A9q.jpg', // Fast & Furious backdrop
            request: 'collection/9485',
            items_count: 0 // Will be updated with TMDB response
        }
    ];

    // Fallback data
    var fallbackCollections = [
        {
            title: Lampa.Lang.translate('uaCollections_fast_furious'),
            img: './img/img_broken.svg',
            request: 'collection/9485',
            items_count: 0
        }
    ];

    function main(params, oncomplite, onerror) {
        console.log('Fetching main collections...');
        var network = new Lampa.Reguest();
        var url = Lampa.TMDB.api('collection/9485');
        console.log('TMDB request:', url);

        network.silent(url, function (data) {
            console.log('TMDB response for Fast & Furious:', data);
            var results = data.parts || [];
            var collection_data = {
                collection: true,
                total_pages: 1,
                results: results.length ? hardcoded_collections.map(function (item) {
                    return {
                        title: item.title,
                        poster_path: item.img,
                        backdrop_path: item.img,
                        hpu: item.request,
                        items_count: results.length
                    };
                }) : fallbackCollections.map(function (item) {
                    return {
                        title: item.title,
                        poster_path: item.img,
                        backdrop_path: item.img,
                        hpu: item.request,
                        items_count: 0
                    };
                })
            };
            oncomplite(collection_data);
        }, function (error) {
            console.error('TMDB error:', error);
            Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
            var fallback_data = {
                collection: true,
                total_pages: 1,
                results: fallbackCollections.map(function (item) {
                    return {
                        title: item.title,
                        poster_path: item.img,
                        backdrop_path: item.img,
                        hpu: item.request,
                        items_count: 0
                    };
                })
            };
            oncomplite(fallback_data);
        });
    }

    function full(params, oncomplite, onerror) {
        console.log('Fetching full collection:', params.url);
        var network = new Lampa.Reguest();
        var url = Lampa.TMDB.api(params.url);
        console.log('TMDB full request:', url);

        network.silent(url, function (data) {
            console.log('TMDB full response:', data);
            var results = data.parts || [];
            var collection_data = {
                total_pages: 1,
                results: results.length ? results.map(function (result) {
                    return {
                        id: result.id,
                        title: result.title || 'Untitled',
                        poster_path: result.poster_path,
                        backdrop_path: result.backdrop_path,
                        overview: result.overview,
                        release_date: result.release_date
                    };
                }) : fallbackCollections
            };
            collection_data.title = Lampa.Lang.translate('uaCollections_fast_furious');
            oncomplite(collection_data);
        }, function (error) {
            console.error('TMDB full error:', error);
            Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
            var fallback_data = {
                total_pages: 1,
                results: fallbackCollections,
                title: Lampa.Lang.translate('uaCollections_fast_furious')
            };
            oncomplite(fallback_data);
        });
    }

    function clear() {
        var network = new Lampa.Reguest();
        network.clear();
        console.log('Network cleared');
    }

    var Api = {
        main: main,
        full: full,
        clear: clear
    };

    function componentMain(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            console.log('Creating main component');
            var _this = this;
            this.activity.loader(true);
            Api.main(object, function (data) {
                console.log('Main component built with data:', data);
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                console.error('Main component failed');
                var fallback_data = {
                    collection: true,
                    total_pages: 1,
                    results: fallbackCollections.map(function (item) {
                        return {
                            title: item.title,
                            poster_path: item.img,
                            backdrop_path: item.img,
                            hpu: item.request,
                            items_count: 0
                        };
                    })
                };
                _this.build(fallback_data);
                _this.activity.loader(false);
            });
            return this.render();
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            console.log('Requesting next page for main:', object.page);
            Api.main(object, resolve.bind(comp), reject.bind(comp));
        };

        comp.cardRender = function (object, element, card) {
            card.onMenu = false;
            card.onEnter = function () {
                console.log('Entering card:', element.title);
                Lampa.Activity.push({
                    url: element.hpu,
                    title: element.title,
                    component: 'category_full',
                    source: 'tmdb',
                    page: 1
                });
            };
        };

        return comp;
    }

    function componentFull(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            console.log('Creating full component');
            var _this = this;
            this.activity.loader(true);
            Api.full(object, function (data) {
                console.log('Full component built with data:', data);
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                console.error('Full component failed');
                var fallback_data = {
                    total_pages: 1,
                    results: fallbackCollections,
                    title: Lampa.Lang.translate('uaCollections_fast_furious')
                };
                _this.build(fallback_data);
                _this.activity.loader(false);
            });
            return this.render();
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            console.log('Requesting next page for full:', object.page);
            Api.full(object, resolve.bind(comp), reject.bind(comp));
        };

        return comp;
    }

    function startPlugin() {
        console.log('Starting UACollections plugin');
        var manifest = {
            type: 'video',
            version: '1.0.8',
            name: Lampa.Lang.translate('uaCollections_title'),
            description: 'Fast & Furious collection powered by TMDB',
            component: 'ua_collections'
        };

        if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
        Lampa.Manifest.plugins['ua_collections'] = manifest;

        Lampa.Component.add('ua_collections', componentMain);
        Lampa.Component.add('ua_collection', componentFull);

        console.log('Adding template: ua_collections_css');
        Lampa.Template.add('ua_collections_css', `<style>.category-full .card--collection{padding-bottom:2em}</style>`);
        console.log('Template ua_collections_css added');
        $('body').append(Lampa.Template.get('ua_collections_css', {}, true));

        function add() {
            console.log('Adding menu button');
            var button = $('<li class="menu__item selector">' +
                '<div class="menu__ico">' + menu_icon + '</div>' +
                '<div class="menu__text">' + manifest.name + '</div>' +
                '</li>');

            button.on('hover:enter', function () {
                console.log('Menu button clicked');
                Lampa.Activity.push({
                    url: '',
                    title: manifest.name,
                    component: 'ua_collections',
                    page: 1
                });
            });

            $('.menu .menu__list').eq(0).append(button);
        }

        if (window.appready) {
            console.log('App ready, adding menu');
            add();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    console.log('App ready event, adding menu');
                    add();
                }
            });
        }
    }

    if (!window.ua_collections_ready) {
        console.log('UACollections plugin ready to start');
        window.ua_collections_ready = true;
        startPlugin();
    }
})();
