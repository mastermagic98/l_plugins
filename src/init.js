(function() {
    function startPlugin() {
        console.log('Trailers', 'startPlugin called');

        if (!window.TrailersComponent) {
            console.error('Trailers', 'Component not defined');
            return;
        }

        console.log('Trailers', 'Registering component');
        try {
            // Use Lampa.Components for compatibility
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;
            console.log('Trailers', 'Component added via Lampa.Components');

            // Add CSS
            Lampa.Template.add('trailers_css', '<style>.trailers-list{display:flex;flex-wrap:wrap;gap:20px}.trailers-card{width:150px;cursor:pointer}.trailers-card__img img{width:100%;border-radius:8px}.trailers-card__title{font-size:14px;margin-top:8px;color:#fff}.trailers-card__date{font-size:12px;color:#999;margin-top:4px}.trailers-category__title{font-size:18px;margin:20px 0 10px;color:#fff}.trailers-category__more{font-size:14px;color:#1e88e5;cursor:pointer;margin-top:10px}</style>');
            console.log('Trailers', 'CSS added');

            // Add to menu
            Lampa.Menu = Lampa.Menu || {};
            Lampa.Menu.add('trailers', {
                title: 'Трейлери',
                component: 'trailers'
            });
            console.log('Trailers', 'Menu item added');
        } catch (e) {
            console.error('Trailers', 'Error adding component:', e.message);
        }
    }

    console.log('Trailers', 'init.js loaded');
    startPlugin();
})();
