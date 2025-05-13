(function () {
    function component(object) {
        var comp = this;
        var scroll;
        var items = [];
        var active = 0;
        var light;

        this.create = function () {
            scroll = $('<div class="upcoming scroll--h"></div>');
            light = Lampa.Utils.isTouchDevice();
            this.activity.loader(true);
            this.build();
        };

        this.build = function () {
            var status = new Lampa.Status(5);
            var results = {};

            status.onComplite = function () {
                var hasItems = false;

                for (var i in results) {
                    if (results[i].results && results[i].results.length) {
                        comp.append(results[i]);
                        hasItems = true;
                    }
                }

                if (!hasItems) scroll.append('<div class="upcoming__empty">' + Lampa.Lang.translate('upcoming_empty') + '</div>');

                if (light) Lampa.Background.immediately('');

                comp.activity.loader(false);
                comp.activity.toggle();
            };

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

            var nextMonth = new Date(new Date().setMonth(today.getMonth() + 1));
            var dateString2 = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
            var endDateString = nextMonth.getFullYear() + '-' + (nextMonth.getMonth() + 1).toString().padStart(2, '0') + '-' + nextMonth.getDate().toString().padStart(2, '0');

            Lampa.TMDB.api('discover/movie?region=' + (Lampa.Storage.get('region') || 'US') + '&language=' + (Lampa.Storage.get('language') || 'en') + '&sort_by=popularity.desc&release_date.gte=' + dateString2 + '&release_date.lte=' + endDateString, function (json) {
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);

                    localStatus.onComplite = function () {
                        results['upcoming'] = {
                            title: Lampa.Lang.translate('upcoming_upcoming'),
                            results: json.results,
                            type: 'upcoming'
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

            Lampa.TMDB.api('discover/tv?region=' + (Lampa.Storage.get('region') || 'US') + '&language=' + (Lampa.Storage.get('language') || 'en') + '&sort_by=popularity.desc&first_air_date.gte=' + dateString, function (json) {
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);

                    localStatus.onComplite = function () {
                        results['series_new'] = {
                            title: Lampa.Lang.translate('upcoming_series_new'),
                            results: json.results,
                            type: 'series_new'
                        };
                        status.append({}, {});
                    };

                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, 'tv', function (release) {
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

            Lampa.TMDB.api('discover/tv?region=' + (Lampa.Storage.get('region') || 'US') + '&language=' + (Lampa.Storage.get('language') || 'en') + '&sort_by=popularity.desc&first_air_date.gte=' + dateString2 + '&first_air_date.lte=' + endDateString, function (json) {
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);

                    localStatus.onComplite = function () {
                        results['series_upcoming'] = {
                            title: Lampa.Lang.translate('upcoming_series_upcoming'),
                            results: json.results,
                            type: 'series_upcoming'
                        };
                        status.append({}, {});
                    };

                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, 'tv', function (release) {
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

            Lampa.TMDB.api('trending/all/week?language=' + (Lampa.Storage.get('language') || 'en'), function (json) {
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);

                    localStatus.onComplite = function () {
                        results['popular'] = {
                            title: Lampa.Lang.translate('upcoming_popular'),
                            results: json.results,
                            type: 'popular'
                        };
                        status.append({}, {});
                    };

                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, item.media_type, function (release) {
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
        };

        this.append = function (element) {
            var item = new window.plugin_upcoming.line(element);
            item.create();

            item.onDown = this.down;
            item.onUp = this.up;
            item.onBack = this.back;

            item.onToggle = function () {
                active = items.indexOf(item);
            };

            if (light) {
                item.wrap = $('<div></div>');
                scroll.append(item.wrap);
            } else {
                scroll.append(item.render());
            }

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
