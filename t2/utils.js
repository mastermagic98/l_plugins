(function () {
    function getRegion() {
        return (Lampa && Lampa.Storage && Lampa.Storage.get('region')) || 'US';
    }

    function getInterfaceLanguage() {
        return (Lampa && Lampa.Storage && Lampa.Storage.get('language')) || 'en';
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.utils = {
        getRegion: getRegion,
        getInterfaceLanguage: getInterfaceLanguage
    };
})();
