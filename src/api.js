var Api = {
    clear: function () {
        console.log('Trailers', 'Clear cache');
    },

    videos: function (data, success, fail) {
        var type = data.type || (data.name ? 'tv' : 'movie');
        Lampa.TMDB.videos(type, data.id, success, fail);
    },

    category: function (params, oncomplite, onerror) {
        var lang = Lampa.Storage.get('language', 'ru');
        var page = params.page || 1;
        var url = params.url.replace('{page}', page).replace('{lang}', lang);

        Lampa.TMDB.get(url, function (data) {
            var results = data.results || [];
            console.log('Trailers', params.type + ' results:', results.length, 'Page:', page);
            oncomplite({
                title: params.title,
                results: results,
                page: data.page,
                total_pages: data.total_pages,
                type: params.type,
                url: params.url
            });
        }, onerror);
    },

    full: function (params, oncomplite, onerror) {
        this.category(params, oncomplite, onerror);
    },

    getLocalMoviesInTheaters: function (params, oncomplite, onerror) {
        var lang = Lampa.Storage.get('language', 'ru');
        var region = lang === 'ru' ? 'RU' : lang === 'uk' ? 'UA' : 'US';
        var page = params.page || 1;
        var url = 'movie/now_playing?language=' + lang + '&page=' + page + '&region=' + region;

        Lampa.TMDB.get(url, function (data) {
            var results = data.results || [];
            var total_pages = data.total_pages || 1;
            console.log('Trailers', 'In theaters results:', results.length, 'Page:', page);

            var filtered_results = [];
            var pending = results.length;
            var completed = 0;

            function checkComplete() {
                if (completed >= pending) {
                    console.log('Trailers', 'In theaters final results:', filtered_results.length, 'Page:', page);
                    oncomplite({
                        title: params.title,
                        results: filtered_results,
                        page: data.page,
                        total_pages: total_pages,
                        type: params.type,
                        url: params.url
                    });
                }
            }

            if (!results.length) {
                checkComplete();
                return;
            }

            results.forEach(function (movie) {
                var release_url = 'movie/' + movie.id + '/release_dates';
                Lampa.TMDB.get(release_url, function (release_data) {
                    movie.release_details = release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || movie.release_date;

                    Api.videos(movie, function (video_data) {
                        var trailers = video_data.results ? video_data.results.filter(function (v) {
                            return v.type === 'Trailer' && v.iso_639_1 === lang;
                        }) : [];
                        if (trailers.length) {
                            filtered_results.push(movie);
                        }
                        completed++;
                        checkComplete();
                    }, function () {
                        completed++;
                        checkComplete();
                    });
                }, function () {
                    movie.release_details = movie.release_date;
                    completed++;
                    checkComplete();
                });
            });
        }, onerror);
    }
};
