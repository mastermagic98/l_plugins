(function() {
    var lang_map = { 'uk': 'uk-UA', 'ru': 'ru-RU', 'en': 'en-US' };
    var api_key = 'YOUR_TMDB_API_KEY';

    function getReleaseDetails(id, type, lang) {
        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/release_dates?api_key=' + api_key;
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            var release = data.results.find(function(r) { return r.iso_3166_1 === lang_map[lang] || r.iso_3166_1 === 'US'; });
            return release ? { release_date: release.release_dates[0].release_date.split('T')[0] } : {};
        }).catch(function(error) {
            console.error('Trailers', 'Error fetching release details:', error);
            return {};
        });
    }

    function getTrailers(id, type, lang) {
        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/videos?api_key=' + api_key + '&language=' + lang_map[lang];
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            var trailers = data.results ? data.results.filter(function(v) {
                return v.type === 'Trailer' && v.site === 'YouTube';
            }) : [];
            return trailers;
        }).catch(function(error) {
            console.error('Trailers', 'Error fetching trailers:', error);
            return [];
        });
    }

    window.TrailersAPI = {
        get: function(category, params) {
            var lang = Lampa.Storage.get('language', 'uk');
            var page = params.page || 1;
            var url = '';
            var type = 'movie';

            if (category === 'in_theaters') {
                url = 'https://api.themoviedb.org/3/movie/now_playing?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'upcoming_movies') {
                url = 'https://api.themoviedb.org/3/movie/upcoming?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'popular_movies') {
                url = 'https://api.themoviedb.org/3/movie/popular?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'popular_series') {
                url = 'https://api.themoviedb.org/3/tv/popular?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
                type = 'tv';
            }

            return fetch(url).then(function(response) {
                return response.json();
            }).then(function(data) {
                var results = data.results || [];
                var promises = results.map(function(item) {
                    var id = item.id;
                    var p1 = category === 'in_theaters' ? getTrailers(id, type, lang) : Promise.resolve([]);
                    var p2 = (category === 'upcoming_movies' || category === 'popular_movies') ? getReleaseDetails(id, type, lang) : Promise.resolve({});
                    return Promise.all([p1, p2]).then(function([trailers, release]) {
                        if (category === 'in_theaters' && trailers.length === 0) return null;
                        item.release_details = release;
                        item.trailers = trailers;
                        return item;
                    });
                });

                return Promise.all(promises).then(function(items) {
                    return {
                        results: items.filter(function(item) { return item !== null; }),
                        page: data.page,
                        total_pages: data.total_pages,
                        has_next: data.page < data.total_pages
                    };
                });
            }).catch(function(error) {
                console.error('Trailers', 'Error fetching data:', error);
                return { results: [], page: 1, total_pages: 1, has_next: false };
            });
        }
    };
})();
