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

            // Try Lampa.Component.register
            if (typeof Lampa.Component?.register === 'function') {
                Lampa.Component.register('trailers', window.TrailersComponent);
                console.log('Trailers', 'Component registered via Lampa.Component.register');
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
                    component: 'trailers'
                });
                console.log('Trailers', 'Menu item added via Lampa.Menu.items');
                console.log('Trailers', 'Menu item details:', Lampa.Menu.items[Lampa.Menu.items.length - 1]);

                // Delayed menu render
                setTimeout(function() {
                    if (typeof Lampa.Menu?.render === 'function') {
                        Lampa.Menu.render();
                        console.log('Trailers', 'Menu rendered via Lampa.Menu.render');
                    }
                    if (typeof Lampa.Menu?.refresh === 'function') {
                        Lampa.Menu.refresh();
                        console.log('Trailers', 'Menu refreshed via Lampa.Menu.refresh');
                    }
                    if (typeof Lampa.Menu?.reload === 'function') {
                        Lampa.Menu.reload();
                        console.log('Trailers', 'Menu reloaded via Lampa.Menu.reload');
                    }
                }, 1000);

                // Activate component
                if (typeof Lampa.Activity?.push === 'function') {
                    Lampa.Activity.push({
                        title: 'Трейлери',
                        component: 'trailers',
                        url: '',
                        page: 1
                    });
                    console.log('Trailers', 'Component activated via Lampa.Activity.push');
                }

                // Log menu and component state
                console.log('Trailers', 'Available components:', Object.keys(Lampa.Components || {}));
                console.log('Trailers', 'Menu items:', Lampa.Menu.items);
                console.log('Trailers', 'Lampa.Menu:', Lampa.Menu);
                if (typeof Lampa.Component?.get === 'function') {
                    console.log('Trailers', 'Component exists:', !!Lampa.Component.get('trailers'));
                }
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
