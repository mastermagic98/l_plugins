(function () {
    function Component(object) {
        var scroll;
        var items = [];
        var active = 0;
        var light;

        this.create = function () {
            console.log('Component.create called');
            try {
                scroll = $('<div class="trailers scroll--h"></div>');
                var menu = [];
                if (!Lampa.Platform.is('tizen')) {
                    menu.push({
                        title: Lampa.Lang.translate('settings_reset'),
                        subtitle: Lampa.Lang.translate('trailers_clear_cache'),
                        clear: true
                    });
                }
                Lampa.Component.add('trailers', this);
                this.build();
            } catch (e) {
                console.error('Error in Component.create:', e);
                scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
            }
        };

        this.build = function () {
            console.log('Component.build called');
            try {
                if (!Lampa || !Lampa.Status || !window.LampaPlugin.main) {
                    console.error('Lampa.Status or main is undefined:', {
                        Status: Lampa.Status,
                        main: window.LampaPlugin.main
                    });
                    scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
                    return;
                }
                var status = new Lampa.Status(5);
                var results = {};
                status.onComplite = function () {
                    console.log('Status completed:', results);
                    var hasItems = false;
                    for (var i in results) {
                        if (results[i].results && results[i].results.length) {
                            this.append(results[i]);
                            hasItems = true;
                        }
                    }
                    if (!hasItems) {
                        console.log('No items to display');
                        scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
                    }
                    if (light) Lampa.Background.immediately('');
                    this.activity.loader(false);
                    this.activity.toggle();
                }.bind(this);
                window.LampaPlugin.main(status, results);
            } catch (e) {
                console.error('Error in Component.build:', e);
                scroll.append('<div class="trailers__empty">' + Lampa.Lang.translate('trailers_empty') + '</div>');
            }
        };

        this.append = function (element) {
            console.log('Component.append called:', element);
            try {
                var item = new window.LampaPlugin.Line(element);
                item.create();
                item.onDown = this.down.bind(this);
                item.onUp = this.up.bind(this);
                item.onBack = this.back.bind(this);
                item.onToggle = function () {
                    active = items.indexOf(item);
                };
                item.wrap = $('<div></div>');
                if (light) {
                    scroll.append(item.wrap);
                } else {
                    scroll.append(item.render());
                }
                items.push(item);
            } catch (e) {
                console.error('Error in Component.append:', e);
            }
        };

        this.down = function () {
            active++;
            if (active >= items.length) active = 0;
            items[active].toggle();
        };

        this.up = function () {
            active--;
            if (active < 0) active = items.length - 1;
            items[active].toggle();
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.start = function () {
            if (items.length) items[active].toggle();
        };

        this.activity = object.activity;

        this.destroy = function () {
            items.forEach(function (item) {
                item.destroy();
            });
            items = [];
            if (scroll) scroll.remove();
        };
    }

    window.LampaPlugin = window.LampaPlugin || {};
    window.LampaPlugin.Component = Component;
})();
