(function () {
    console.log('Test plugin: Starting');
    function add() {
        console.log('Test plugin: Adding button');
        var button = $('<li class="menu__item selector"><div class="menu__text">Test Plugin</div></li>');
        $('.menu .menu__list').eq(0).append(button);
    }
    if (window.appready) {
        console.log('Test plugin: appready true');
        add();
    } else {
        console.log('Test plugin: waiting for app ready');
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log('Test plugin: app ready event');
                add();
            }
        });
    }
})();
