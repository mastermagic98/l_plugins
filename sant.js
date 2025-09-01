(function(){
    // Список слов для фильтрации в названии торрента.
    // Теперь сюда добавлен и трекер Toloka.
    var BLACK_LIST = ['TS', 'CAMRip'];

    function startPlugin() {
        // Проверка, чтобы плагин не запускался дважды
        if (window.torrent_sanitizer) return;
        window.torrent_sanitizer = true;

        // Подписываемся на событие получения источников торрентов
        Lampa.Listener.follow('torrent_sources', function (event) {
            // event.data.sources - это массив с торрентами
            var sources = event.data.sources;

            // Проверяем, что это действительно массив и он не пустой
            if (!Array.isArray(sources) || sources.length === 0) return;

            // Используем метод filter для создания нового массива,
            // в который войдут только "хорошие" торренты
            var filtered_sources = sources.filter(function(torrent) {
                var title = (torrent.title || '').toLowerCase(); // Приводим название к нижнему регистру

                // Проверяем, содержит ли название хоть одно слово из черного списка
                var is_blacklisted = BLACK_LIST.some(function(black_word) {
                    return title.includes(black_word.toLowerCase());
                });

                // filter оставит только те элементы, для которых функция вернет true.
                // Нам нужно оставить те, что НЕ в черном списке, поэтому возвращаем !is_blacklisted
                return !is_blacklisted;
            });

            // Заменяем оригинальный массив отфильтрованным
            event.data.sources = filtered_sources;
        });
    }

    // Стандартный запуск плагина Lampa после полной загрузки приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
})();