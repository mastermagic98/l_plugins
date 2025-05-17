(function() {
    function startPlugin() {
        console.log('Trailers', 'startPlugin called');

        if (!window.TrailersComponent) {
            console.error('Trailers', 'Component not defined');
            return;
        }

        console.log('Trailers', 'Registering component');
        try {
            // Register component
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;
            console.log('Trailers', 'Component added via Lampa.Components');

            // Try Lampa.Component.add
            if (typeof Lampa.Component?.add === 'function') {
                Lampa.Component.add('trailers', window.TrailersComponent);
                console.log('Trailers', 'Component added via Lampa.Component.add');
            }

            // Add CSS
            Lampa.Template.add('trailers_css', '<style>.trailers-list{display:flex;flex-wrap:wrap;gap:20px}.trailers-card{width:150px;cursor:pointer}.trailers-card__img img{width:100%;border-radius:8px}.trailers-card__title{font-size:14px;margin-top:8px;color:#fff}.trailers-card__date{font-size:12px;color:#999;margin-top:4px}.trailers-category__title{font-size:18px;margin:20px 0 10px;color:#fff}.trailers-category__more{font-size:14px;color:#1e88e5;cursor:pointer;margin-top:10px}</style>');
            console.log('Trailers', 'CSS added');

            // Add to menu
            try {
                Lampa.Menu = Lampa.Menu || {};
                Lampa.Menu.items = Lampa.Menu.items || [];
                Lampa.Menu.items.push({
                    title: 'Трейлери',
                    component: 'trailers',
                    name: 'trailers',
                    id: 'trailers',
                    enabled: true,
                    visible: true,
                    order: 10,
                    type: 'plugin'
                });
                console.log('Trailers', 'Menu item added via Lampa.Menu.items');
                console.log('Trailers', 'Menu item details:', Lampa.Menu.items[Lampa.Menu.items.length - 1]);

                // Try Lampa.Menu.register
                if (typeof Lampa.Menu?.register === 'function') {
                    Lampa.Menu.register({
                        title: 'Трейлери',
                        component: 'trailers',
                        name: 'trailers',
                        id: 'trailers',
                        enabled: true,
                        visible: true,
                        order: 10,
                        type: 'plugin'
                    });
                    console.log('Trailers', 'Menu item registered via Lampa.Menu.register');
                }

                // Synchronous logs
                console.log('Trailers', 'Available components:', Object.keys(Lampa.Components || {}));
                console.log('Trailers', 'Menu items:', Lampa.Menu.items);
                console.log('Trailers', 'Lampa.Menu:', Lampa.Menu);
                console.log('Trailers', 'TrailersComponent methods:', Object.keys(window.TrailersComponent));
                if (typeof Lampa.Component?.get === 'function') {
                    console.log('Trailers', 'Component exists:', !!Lampa.Component.get('trailers'));
                }

                // Test component initialization
                if (typeof window.TrailersComponent.init === 'function') {
                    window.TrailersComponent.init();
                    console.log('Trailers', 'TrailersComponent.init called');
                }

                // Clear Lampa cache
                if (typeof Lampa.Storage?.clear === 'function') {
                    Lampa.Storage.clear();
                    console.log('Trailers', 'Lampa cache cleared');
                }

                // Delayed menu render
                setTimeout(function() {
                    console.log('Trailers', 'Executing delayed render');
                    if (typeof Lampa.Menu?.render === 'function') {
                        let renderResult = Lampa.Menu.render();
                        console.log('Trailers', 'Menu rendered via Lampa.Menu.render', 'Result:', renderResult);
                    }
                    if (typeof Lampa.Menu?.init === 'function') {
                        Lampa.Menu.init();
                        console.log('Trailers', 'Menu initialized via Lampa.Menu.init');
                    }
                    if (typeof Lampa.Menu?.refresh === 'function') {
                        Lampa.Menu.refresh();
                        console.log('Trailers', 'Menu refreshed via Lampa.Menu.refresh');
                    }
                    if (typeof Lampa.Menu?.reload === 'function') {
                        Lampa.Menu.reload();
                        console.log('Trailers', 'Menu reloaded via Lampa.Menu.reload');
                    }
                    if (typeof Lampa.Menu?.update === 'function') {
                        Lampa.Menu.update();
                        console.log('Trailers', 'Menu updated via Lampa.Menu.update');
                    }
                    if (typeof Lampa.Menu?.ready === 'function') {
                        Lampa.Menu.ready();
                        console.log('Trailers', 'Menu ready via Lampa.Menu.ready');
                    }
                    console.log('Trailers', 'Menu state after render:', Lampa.Menu);

                    // Replace menu items
                    Lampa.Menu.items = [{
                        title: 'Трейлери',
                        component: 'trailers',
                        name: 'trailers',
                        id: 'trailers',
                        enabled: true,
                        visible: true,
                        order: 10,
                        type: 'plugin'
                    }];
                    console.log('Trailers', 'Menu items replaced:', Lampa.Menu.items);
                    if (typeof Lampa.Menu?.render === 'function') {
                        let reRenderResult = Lampa.Menu.render();
                        console.log('Trailers', 'Menu re-rendered after replace', 'Result:', reRenderResult);
                    }

                    // Try activating component
                    try {
                        Lampa.Activity.push({
                            title: 'Трейлери',
                            component: 'trailers',
                            url: '',
                            page: 1
                        });
                        console.log('Trailers', 'Component activated via Lampa.Activity.push');
                    } catch (e) {
                        console.error('Trailers', 'Error activating component:', e.message);
                    }
                }, 5000);
            } catch (e) {
                console.error('Trailers', 'Error adding menu item:', e.message);
            }
        } catch (e) {
            console.error('Trailers', 'Error adding component:', e.message);
        }
    }

    console.log('Trailers', 'init.js loaded');
    startPlugin();
})();
