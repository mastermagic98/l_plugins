(function() {
    function startPlugin() {
        console.log('Trailers', 'startPlugin called');

        if (!window.TrailersComponent) {
            console.error('Trailers', 'Component not defined');
            return;
        }

        console.log('Trailers', 'Registering component');
        try {
            Lampa.Component.add('trailers', window.TrailersComponent);
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;
            Lampa.Template.add('trailers_css', '<style>.trailers-list{display:flex;flex-wrap:wrap;gap:20px}.trailers-card{width:150px;cursor:pointer}.trailers-card__img img{width:100%;border-radius:8px}.trailers-card__title{font-size:14px;margin-top:8px;color:#fff}.trailers-card__date{font-size:12px;color:#999;margin-top:4px}.trailers-category__title{font-size:18px;margin:20px 0 10px;color:#fff}.trailers-category__more{font-size:14px;color:#1e88e5;cursor:pointer;margin-top:10px}</style>');
            console.log('Trailers', 'Component and CSS added');
        } catch (e) {
            console.error('Trailers', 'Error adding component:', e.message);
        }

        Lampa.Listener.follow('app', {
            ready: function () {
                console.log('Trailers', 'App ready, ensuring component is added');
                try {
                    Lampa.Component.add('trailers', window.TrailersComponent);
                    Lampa.Components['trailers'] = window.TrailersComponent;
                    console.log('Trailers', 'Component added in app.ready');
                } catch (e) {
                    console.error('Trailers', 'Error in app.ready:', e.message);
                }
            }
        });
    }

    console.log('Trailers', 'init.js loaded');
    startPlugin();
})();
