(function () {
    var network = new Lampa.Reguest();
    var trailerCache = {};
    var categoryCache = {};

    function get(url, oncomplite, onerror) {
        network.silent(Lampa.TMDB.api(url), oncomplite, onerror);
    }

    function getLocalMoviesInTheaters(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region = window.plugin_upcoming.utils.getRegion();
        get('discover/movie?primary_release_date.lte=' + date + '&sort_by=popularity.desc&with_release_type=3|2&region=' + region + '&page=' + page, oncomplite, onerror);
    }

    function getUpcomingMovies(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region Jobs: Software Engineer, Data Scientist, Product Manager, Designer, Marketing Manager, Sales Representative, Customer Success Manager, Operations Manager, Financial Analyst, HR Specialist
