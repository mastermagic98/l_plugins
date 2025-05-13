(function () {
    function component(object) {
        var scroll;
        var items = [];
        var active = 0;
        var light;

        this.create = function () {
            console.log('component.create called');
            scroll = $('<div class="upcoming scroll--h"></div>');
            this.build();
        };

        this.build = function () {
            console.log('component.build called');
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
                    scroll.append('<div class="upcoming__empty">' + Lampa.Lang.translate('upcoming_empty') + '</div>');
                }
                if (light) Lampa.Background.immediately('');
                this.activity.loader(false);
                this.activity.toggle();
            }.bind(this);

            var today = new Date();
            var priorDate = new Date(new Date().setDate(today.getDate() - 30));
            var dateString = priorDate.getFullYear() + '-' + (priorDate.getMonth() + 1).toString().padStart(2, '0') + '-' + priorDate.getDate().toString().padStart(2, '0');
            Lampa.TMDB.api('discover/movie?region=' + (Lampa.Storage.get('region') || 'US') + '&language=' + (Lampa.Storage.get('language') || 'en') + '&sort_by=popularity.desc&release_date.gte=' + dateString + '&with_release_type=3|2', function (json) {
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);
                    localStatus.onComplite = function () {
                        results['in_theaters'] = {
                            title: Lampa.Lang.translate('upcoming_in_theaters'),
                            results: json.results,
                            type: 'in_theaters'
                        };
                        status.append({}, {});
                    };
                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, 'movie', function (release) {
                            json.results[i].release_details = release;
                            localStatus.append(item.id, {});
                        }, function () {
                            localStatus.append(item.id, {});
                        });
                    });
                } else {
                    status.append({}, {});
                }
            }, function () {
                status.append({}, {});
            });

            // Додаткові запити для upcoming, series_new, series_upcoming, popular...
        };

        this.append = function (element) {
            console.log('component.append called:', element);
            var item = new window.plugin_upcoming.line(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onToggle = function () {
                active = items.indexOf(item);
            };
            scroll.append(item.render());
            items.push(item);
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

        Lampa.Component.add('upcoming', this);
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.component = component;
})();
