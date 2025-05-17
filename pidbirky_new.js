!function() {
    "use strict";

    function addNetflix() {
        var item = $('<li class="menu__item selector" data-action="netflix"><div class="menu__ico"><svg height="30" viewBox="124.528 16 262.944 480" xmlns="http://www.w3.org/2000/svg"><path d="m216.398 16h-91.87v480c30.128-7.135 61.601-10.708 91.87-12.052z" fill="#E50914"/><path d="m387.472 496v-480h-91.87v468.904c53.636 3.416 91.87 11.096 91.87 11.096z" fill="#E50914"/><path d="m387.472 496-171.074-480h-91.87l167.03 468.655c55.75 3.276 95.914 11.345 95.914 11.345z" fill="#E50914"/></svg></div><div class="menu__text">Netflix</div></li>');
        item.on("hover:enter", function() {
            Lampa.Activity.push({
                url: "discover/tv?language=uk&with_networks=213",
                title: "Netflix",
                component: "category_full",
                source: "tmdb",
                sort: "now",
                card_type: "true",
                page: 1
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }

    function add4K() {
        var item = $('<li class="menu__item selector" data-action="hd"><div class="menu__ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#32CD32" height="30"><path d="M8 5v14l7-7m5-7v14h2V5m-9 0v14l7-7" stroke="currentColor" stroke-width="2"/></svg></div><div class="menu__text">4K</div></li>');
        item.on("hover:enter", function() {
            Lampa.Activity.push({
                url: "?cat=&sort=now&uhd=true",
                title: "4K",
                component: "category_full",
                source: "cub",
                sort: "now",
                card_type: "true",
                page: 1
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }

    function addDisneyPlus() {
        var item = $('<li class="menu__item selector" data-action="disney"><div class="menu__ico"><svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" id="disney-plus" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><path id="secondary" d="M19,3V7m2-2H17" style="fill:none;stroke:rgb(44,169,188);stroke-linecap:round;stroke-linejoin:round;stroke-width:2;"></path><line id="primary" x1="6.69" y1="9" x2="8.69" y2="21" style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;"></line><path id="primary-2" data-name="primary" d="M3,6s12.29-2,13.91,6.77c1.09,5.93-6.58,6.7-9.48,5.89S3,16.06,3,14.06C3,11,8.54,9.45,12,12" style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;"></path></svg></div><div class="menu__text">Disney+</div></li>');
        item.on("hover:enter", function() {
            Lampa.Activity.push({
                url: "discover/tv?language=uk&with_networks=2739",
                title: "Disney+",
                component: "category_full",
                source: "tmdb",
                sort: "now",
                card_type: "true",
                page: 1
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }

    function addPrimeVideo() {
        var item = $('<li class="menu__item selector" data-action="prime"><div class="menu__ico"><svg fill="#000000" width="35px" height="35px" viewBox="0 0 24 24" id="amazon" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><path id="secondary" d="M19.54,15A9.23,9.23,0,0,0,21,10.28,8.05,8.05,0,0,0,17,9" style="fill:none;stroke:rgb(44,169,188);stroke-linecap:round;stroke-linejoin:round;stroke-width:2;"></path><path id="primary" d="M17,12.51a15.19,15.19,0,0,1-7.37,1.43A14.62,14.62,0,0,1,3,11" style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;"></path></svg></div><div class="menu__text">Prime Video</div></li>');
        item.on("hover:enter", function() {
            Lampa.Activity.push({
                url: "discover/tv?language=uk&with_networks=1024",
                title: "PrimeVideo",
                component: "category_full",
                source: "tmdb",
                sort: "now",
                card_type: "true",
                page: 1
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }

    function addAppleTV() {
        var item = $('<li class="menu__item selector" data-action="apple"><div class="menu__ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="30"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div><div class="menu__text">Apple TV+</div></li>');
        item.on("hover:enter", function() {
            Lampa.Activity.push({
                url: "discover/tv?language=uk&with_networks=2552",
                title: "AppleTV+",
                component: "category_full",
                source: "tmdb",
                sort: "now",
                card_type: "true",
                page: 1
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }

    window.plugin_ready = window.plugin_ready || function() {
        if (!window.plugin_podbor_ready) {
            // Додаємо лише Netflix та 4K
            add4K();
            addNetflix();

            // Додаткові підбірки (можна вимкнути)
            addDisneyPlus();
            addPrimeVideo();
            addAppleTV();

            // Налаштування для Lampa Settings
            Lampa.SettingsApi.addComponent({
                component: "porborki",
                icon: '<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/><line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>',
                name: "Підбірки"
            });

            // Параметри для вмикання/вимикання підбірок
            Lampa.SettingsApi.addParam({
                component: "porborki",
                param: {
                    name: "porborki_netflix",
                    type: "select",
                    values: { 1: "Показати", 0: "Приховати" },
                    default: 1
                },
                field: { name: "Netflix" }
            });

            Lampa.SettingsApi.addParam({
                component: "porborki",
                param: {
                    name: "porborki_4k",
                    type: "select",
                    values: { 1: "Показати", 0: "Приховати" },
                    default: 1
                },
                field: { name: "4K" }
            });

            Lampa.SettingsApi.addParam({
                component: "porborki",
                param: {
                    name: "porborki_disney",
                    type: "select",
                    values: { 1: "Показати", 0: "Приховати" },
                    default: 1
                },
                field: { name: "Disney+" }
            });

            Lampa.SettingsApi.addParam({
                component: "porborki",
                param: {
                    name: "porborki_PrimeVideo",
                    type: "select",
                    values: { 1: "Показати", 0: "Приховати" },
                    default: 1
                },
                field: { name: "PrimeVideo" }
            });

            Lampa.SettingsApi.addParam({
                component: "porborki",
                param: {
                    name: "porborki_AppleTV",
                    type: "select",
                    values: { 1: "Показати", 0: "Приховати" },
                    default: 1
                },
                field: { name: "AppleTV" }
            });

            window.plugin_podbor_ready = true;
        }
    };

    // Запуск після завантаження Lampa
    if (window.appready) {
        window.plugin_ready();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type === "ready") window.plugin_ready();
        });
    }
}();