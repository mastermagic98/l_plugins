(function () {
    'use strict';

    // Initialize window.UACollections
    window.UACollections = window.UACollections || {};
    if (window.UACollections.__initialized) {
        console.log('UACollections already initialized, skipping.');
        return;
    }

    window.UACollections.__initialized = true;
    console.log('UACollections initializing...');

    // Localization (English and Ukrainian)
    Lampa.Lang.add({
        uaCollections_title: {
            en: "Themed Collections",
            uk: "Тематичні колекції"
        },
        uaCollections_conjuring: {
            en: "The Conjuring Universe Timeline",
            uk: "Хронологія всесвіту «Закляття»"
        },
        uaCollections_fast_furious: {
            en: "All Fast & Furious Movies",
            uk: "Усі фільми франшизи «Форсаж»"
        },
        uaCollections_paramount_series: {
            en: "Paramount+ Original Series",
            uk: "Оригінальні серіали Paramount+"
        },
        uaCollections_stephen_king: {
            en: "Best Stephen King Adaptations",
            uk: "Найкращі екранізації Стівена Кінга"
        },
        uaCollections_tarantino: {
            en: "Quentin Tarantino: Best to Good",
            uk: "Квентін Тарантіно: від найкращого до хорошого"
        },
        uaCollections_horror_parodies: {
            en: "Comedy Horror Parodies",
            uk: "Комедійні пародії на фільми жахів"
        },
        uaCollections_buddy_movies: {
            en: "Best Buddy Movies",
            uk: "Найкращі бадді-муви"
        },
        uaCollections_items: {
            en: "{0} items",
            uk: "{0} елементів"
        },
        uaCollections_views: {
            en: "{0} views",
            uk: "{0} переглядів"
        },
        uaCollections_date: {
            en: "Created: {0}",
            uk: "Створено: {0}"
        },
        uaCollections_error: {
            en: "Failed to load collection: {0}",
            uk: "Не вдалося завантажити колекцію: {0}"
        },
        uaCollections_no_data: {
            en: "No data available for this collection",
            uk: "Немає даних для цієї колекції"
        }
    });

    // Collection class
    function Collection(data) {
        this.data = data;

        this.build = function () {
            console.log('Building collection card:', data.title);
            this.item = Lampa.Template.js('ua_collection');
            this.img = this.item.find('.card__img');
            this.item.find('.card__title').text(Lampa.Utils.capitalizeFirstLetter(data.title));
            this.item.find('.ua-collection-card__items').text(Lampa.Lang.translate('uaCollections_items').format(data.items_count || 0));
            this.item.find('.ua-collection-card__date').text(Lampa.Lang.translate('uaCollections_date').format(Lampa.Utils.parseTime(data.time).full));
            this.item.find('.ua-collection-card__views').text(Lampa.Lang.translate('uaCollections_views').format(Lampa.Utils.bigNumberToShort(data.views || 0)));
            this.item.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
            var _this = this;
            this.img.onload = function () {
                _this.item.classList.add('card--loaded');
                console.log('Image loaded for:', data.title);
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.svg';
                console.log('Image failed to load for:', data.title);
            };
        };

        this.create = function () {
            var _this = this;
            this.build();
            this.item.addEventListener('hover:focus', function () {
                if (_this.onFocus) _this.onFocus(_this.item, data);
            });
            this.item.addEventListener('hover:touch', function () {
                if (_this.onTouch) _this.onTouch(_this.item, data);
            });
            this.item.addEventListener('hover:hover', function () {
                if (_this.onHover) _this.onHover(_this.item, data);
            });
            this.item.addEventListener('hover:enter', function () {
                console.log('Entering collection:', data.title);
                Lampa.Activity.push({
                    url: data.id,
                    collection: data,
                    title: Lampa.Utils.capitalizeFirstLetter(data.title),
                    component: 'ua_collections_view',
                    page: 1
                });
            });
            this.image();
        };

        this.visible = function () {
            var imgSrc = Lampa.TMDB.image('w500' + (data.backdrop_path || data.poster_path || ''));
            this.img.src = imgSrc || './img/img_broken.svg';
            console.log('Setting image for:', data.title, imgSrc);
            if (this.onVisible) this.onVisible(this.item, data);
        };

        this.destroy = function () {
            this.img.onerror = function () {};
            this.img.onload = function () {};
            this.img.src = '';
            if (this.item) this.item.remove();
            this.item = null;
            this.img = null;
            console.log('Destroyed collection:', data.title);
        };

        this.render = function (js) {
            return js ? this.item : $(this.item);
        };
    }

    // TMDB API request handler
    var network = new Lampa.Reguest();

    // Collection categories
    var collections = [
        {
            hpu: 'conjuring',
            title: Lampa.Lang.translate('uaCollections_conjuring'),
            url: 'collection/531219', // The Conjuring Universe
            type: 'collection'
        },
        {
            hpu: 'fast_furious',
            title: Lampa.Lang.translate('uaCollections_fast_furious'),
            url: 'collection/435259', // Fast & Furious
            type: 'collection'
        },
        {
            hpu: 'paramount_series',
            title: Lampa.Lang.translate('uaCollections_paramount_series'),
            url: 'discover/tv?with_networks=4330&sort_by=popularity.desc',
            type: 'discover'
        },
        {
            hpu: 'stephen_king',
            title: Lampa.Lang.translate('uaCollections_stephen_king'),
            url: 'discover/movie?with_keywords=1396&sort_by=vote_average.desc&vote_count.gte=100',
            type: 'discover'
        },
        {
            hpu: 'tarantino',
            title: Lampa.Lang.translate('uaCollections_tarantino'),
            url: 'discover/movie?with_crew=138&sort_by=vote_average.desc&vote_count.gte=500',
            type: 'discover'
        },
        {
            hpu: 'horror_parodies',
            title: Lampa.Lang.translate('uaCollections_horror_parodies'),
            url: 'discover/movie?with_genres=35&with_keywords=10062',
            type: 'discover'
        },
        {
            hpu: 'buddy_movies',
            title: Lampa.Lang.translate('uaCollections_buddy_movies'),
            url: 'discover/movie?with_keywords=9726&sort_by=vote_average.desc',
            type: 'discover'
        }
    ];

    // Fallback data for testing
    var fallbackCollections = collections.map(function (i, index) {
        return {
            id: i.hpu + '_fallback',
            title: i.title,
            backdrop_path: '',
            items_count: 0,
            time: new Date().toISOString(),
            views: 0,
            liked: 0
        };
    });

    function main(params, oncomplite, onerror) {
        console.log('Fetching main collections...');
        var status = new Lampa.Status(collections.length);

        status.onComplite = function () {
            let keys = Object.keys(status.data);
            let sort = collections.map(a => a.hpu);

            if (keys.length) {
                console.log('Collections loaded:', keys);
                let fulldata = keys.map(key => {
                    let data = status.data[key];
                    data.title = collections.find(item => item.hpu === key).title;
                    data.cardClass = Collection;
                    return data;
                }).sort((a, b) => sort.indexOf(a.category) - 'sort.indexOf(b.category.hpu));
                onComplite(fulldata);
            } else {
                console.warn('No collections loaded, using fallback data.');
                Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
                let fallback_data = [{
                    collection: true,
                    line_type: 'collection',
                    category: 'fallback',
                    title: Lampa.Lang.translate('uaCollections_title'),
                    results: fallbackCollections,
                    cardClass: Collection
                }];
                onComplite(fallback_data);
            }
        };

        collections.forEach(function (item) {
            let apiPath = item.type === 'collection' ? `collection/${item.url}` : item.url;
            let url = Lampa.TMDB.api(apiPath);
            console.log('Requesting TMDB:', url);
            network.silent(url, function (data) {
                console.log('TMDB response for', item.hpu, ':', data);
                let results = item.type === 'collection' ? (data.parts || []) : (data.results || []).slice(0, 10);
                if (!results.length) {
                    console.warn('No results for', item.hpu);
                    Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data') + ': ' + item.title);
                }
                let collection_data = {
                    collection: true,
                    line_type: 'collection',
                    category: item.hpu,
                    results: results.map((result, index) => ({
                        id: item.hpu + '_' + index,
                        title: result.title || result.name || 'Untitled',
                        backdrop_path: result.backdrop_path || result.poster_path,
                        items_count: results.length,
                        time: new Date().toISOString(),
                        views: Math.floor(Math.random() * 10000),
                        liked: Math.floor(Math.random() * 1000)
                    }))
                };
                status.append(item.hpu, collection_data);
            }, function (error) {
                console.error('TMDB error for', item.hpu, ':', error);
                Lampa.Noty.show(Lampa.Lang.translate('uaCollections_error').format(item.title));
                status.error();
            });
        })();
    }

    function collection(params, oncomplite, onerror) {
        console.log('Fetching collection:', params.url);
        let category = collections.find(c => c.hpu === params.url);
        if (!category) {
            console.error('Category not found:', params.url);
            return onerror();
        }

        let apiPath = category.type === 'collection' ? `collection/${category.url}` : category.url + '&page=' + params.page;
        let url = Lampa.TMDB(apiPath);
        console.log(url);
        network.silent(url, function (data) {
            console.log('Collection response for', category.hpu, ':', data);
            let results = category.type === 'collection' ? (data.parts || []) : (data.results || []);
            let collection_data = {
                collection: true,
                total_pages: category.type === 'collection' ? 1 : (data.total_pages || 15),
                results: results.map(function (result, index) {
                    return {
                        id: category.hpu + '_' + index + '_' + params.page,
                        title: result.title || result.name || 'Untitled',
                        backdrop_path: result.backdrop_path || result.poster_path,
                        items_count: results.length,
                        time: new Date().toISOString(),
                        views: Math.floor(Math.random() * 10000),
                        liked: Math.floor(Math.random() * 1000)
                    },
                );
            },
            cardClass: Collection
            };
            oncomplite(collection_data);
        }, function (error) {
            console.error('Collection error:', error);
            Lampa.Noty.show(Lampa.Lang.translate('uaCollections_error').format(category.title));
            onerror();
        });
    }

    function full(params, oncomplite, onerror) {
        console.log('Fetching full collection:', params.url);
        let category = collections.find(c => c.hpu === params.url.split('_')[0]);
        if (!category) {
            console.error('Category not found:', params.url);
            return onerror();
        }

        let apiPath = category.type === 'collection' ? `collection/${category.url}` : category.url + '&page=' + params.page;
        let url = Lampa.TMDB.api(apiPath);
        console.log('Requesting full:', url);
        network.silent(url, function (data) {
            console.log('Full response for', category.hpu, ':', data);
            let results = category.type === 'collection' ? (data.parts || []) : (data.results || []);
            let collection_data = {
                total_pages: category.type === 'collection' ? 1 : (data.total_pages || 15),
                results: results.map(result => ({
                    id: result.id,
                    title: result.title || result.name || 'Untitled',
                    poster_path: result.poster_path,
                    backdrop_path: result.backdrop_path,
                    overview: result.overview,
                    release_date: result.release_date || result.first_air_date
                }))
            };
            oncomplite(collection_data);
        }, function (error) {
            console.error('Full error:', error);
            Lampa.Noty.show(Lampa.Lang.translate('uaCollections_error').format(category.title));
            onerror();
        });
    }

    function clear() {
        network.clear();
        console.log('Network cleared');
    }

    var Api = {
        main: main,
        collection: collection,
        full: full,
        clear: clear
    };

    function componentMain(object) {
        var comp = new Lampa.InteractionMain(object);

        comp.create = function () {
            console.log('Creating main component');
            var _this = this;
            this.activity.loader(true);
            Api.main(object, function (data) {
                console.log('Main component built with data:', data);
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                console.error('Main component failed to load');
                _this.empty();
                _this.activity.loader(false);
                Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
            });
            return this.render();
        };

        comp.onMore = function (data) {
            console.log('Navigating to more:', data.title);
            Lampa.Activity.push({
                url: data.category,
                title: data.title,
                component: 'ua_collections_collection',
                page: 1
            });
        };

        return comp;
    }

    function componentCollection(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            console.log('Creating collection component:', object.url);
            var _this = this;
            this.activity.loader(true);
            Api.collection(object, function (data) {
                console.log('Collection component built:', data);
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                console.error('Collection component failed');
                _this.empty();
                _this.activity.loader(false);
                Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
            });
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            console.log('Requesting next page:', object.page);
            Api.collection(object, resolve.bind(comp), reject.bind(comp));
        };

        comp.cardRender = function (object, element, card) {
            card.onMenu = false;
            card.onEnter = function () {
                console.log('Entering card:', element.title);
                Lampa.Activity.push({
                    url: element.id,
                    title: element.title,
                    component: 'ua_collections_view',
                    page: 1
                });
            };
        };

        return comp;
    }

    function componentView(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            console.log('Creating view component:', object.url);
            var _this = this;
            this.activity.loader(true);
            Api.full(object, function (data) {
                console.log('View component built:', data);
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                console.error('View component failed');
                _this.empty();
                _this.activity.loader(false);
                Lampa.Noty.show(Lampa.Lang.translate('uaCollections_no_data'));
            });
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            console.log('Requesting next page for view:', object.page);
            Api.full(object, resolve.bind(comp), reject.bind(comp));
        };

        return comp;
    }

    function startPlugin() {
        console.log('Starting UACollections plugin');
        var manifest = {
            type: 'video',
            version: '1.0.3',
            name: Lampa.Lang.translate('uaCollections_title'),
            description: 'Themed movie and series collections powered by TMDB',
            component: 'ua_collections'
        };
        Lampa.Manifest.plugins = manifest;

        Lampa.Component.add('ua_collections_main', componentMain);
        Lampa.Component.add('ua_collections_collection', componentCollection);
        Lampa.Component.add('ua_collections_view', componentView);

        Lampa.Template.add('ua_collection', `
            <div class="card ua-collection-card selector layer--visible layer--render card--collection">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="ua-collection-card__head">
                        <div class="ua-collection-card__items"></div>
                        <div class="ua-collection-card__date"></div>
                    </div>
                    <div class="ua-collection-card__bottom">
                        <div class="ua-collection-card__views"></div>
                    </div>
                </div>
                <div class="card__title"></div>
            </div>
        `);

        var style = `
            <style>
            .ua-collection-card__head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: .5em 1em;
                color: #fff;
                font-size: 1em;
                font-weight: 500;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }
            .ua-collection-card__bottom {
                display: flex;
                align-items: center;
                padding: .5em 1em;
                background-color: rgba(0,0,0,0.5);
                color: #fff;
                font-size: 1em;
                font-weight: 400;
                border-radius: 1em;
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
            }
            .ua-collection-card__items {
                background: rgba(0,0,0,0.5);
                padding: .3em;
                border-radius: .2em;
            }
            .category-full .ua-collection-card {
                padding-bottom: 2em;
            }
            </style>
        `;
        Lampa.Template.add('ua_collections_css', style);
        $('body').append(Lampa.Template.get('ua_collections_css', {}, true));

        function add() {
            console.log('Adding menu button');
            var button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg width="191" height="239" viewBox="0 0 191 239" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M35.3438 35.3414V26.7477C35.3438 19.9156 38.0594 13.3543 42.8934 8.51604C47.7297 3.68251 54.2874 0.967027 61.125 0.966431H164.25C171.086 0.966431 177.643 3.68206 182.482 8.51604C187.315 13.3524 190.031 19.91 190.031 26.7477V186.471C190.031 189.87 189.022 193.192 187.133 196.018C185.245 198.844 182.561 201.046 179.421 202.347C176.28 203.647 172.825 203.988 169.492 203.325C166.158 202.662 163.096 201.026 160.692 198.623L155.656 193.587V220.846C155.656 224.245 154.647 227.567 152.758 230.393C150.87 233.219 148.186 235.421 145.046 236.722C141.905 238.022 138.45 238.363 135.117 237.7C131.783 237.037 128.721 235.401 126.317 232.998L78.3125 184.993L30.3078 232.998C27.9041 235.401 24.8419 237.037 21.5084 237.7C18.1748 238.363 14.7195 238.022 11.5794 236.722C8.43922 235.421 5.75517 233.219 3.86654 230.393C1.9779 227.567 0.969476 224.245 0.96875 220.846V61.1227C0.96875 54.2906 3.68437 47.7293 8.51836 42.891C13.3547 38.0575 19.9124 35.342 26.75 35.3414H35.3438ZM138.469 220.846V61.1227C138.469 58.8435 137.563 56.6576 135.952 55.046C134.34 53.4343 132.154 52.5289 129.875 52.5289H26.75C24.4708 52.5289 22.2849 53.4343 20.6733 55.046C19.0617 56.6576 18.1562 58.8435 18.1562 61.1227V220.846L66.1609 172.841C69.3841 169.619 73.755 167.809 78.3125 167.809C82.87 167.809 87.2409 169.619 90.4641 172.841L138.469 220.846ZM155.656 169.284L172.844 186.471V26.7477C172.844 24.4685 171.938 22.2826 170.327 20.671C168.715 19.0593 166.529 18.1539 164.25 18.1539H61.125C58.8458 18.1539 56.6599 19.0593 55.0483 20.671C53.4367 22.2826 52.5312 24.4685 52.5312 26.7477V35.3414H129.875C136.711 35.3414 143.268 38.0571 148.107 42.891C152.94 47.7274 155.656 54.285 155.656 61.1227V169.284Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="menu__text">${manifest.name}</div>
                </li>
            `);
            button.on('hover:enter', function () {
                console.log('Menu button clicked');
                Lampa.Activity.push({
                    url: '',
                    title: manifest.name,
                    component: 'ua_collections_main',
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

    if (!window.ua_collections_ready && Lampa.Manifest.app_digital >= 242) {
        console.log('UACollections plugin ready to start');
        window.ua_collections_ready = true;
        startPlugin();
    } else {
        console.log('Plugin not started: ua_collections_ready=', window.ua_collections_ready, 'app_digital=', Lampa.Manifest.app_digital);
    }
})();
