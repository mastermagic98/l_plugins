(function () {
    function line(data) {
        this.create = function () {
            console.log('line.create called:', data);
            // Логіка створення лінії
            this.element = $('<div class="line"><div class="line__title">' + data.title + '</div><div class="line__cards scroll--h"></div></div>');
            data.results.forEach(function (item) {
                var card = new window.plugin_upcoming.trailer(item);
                card.create();
                this.element.find('.line__cards').append(card.render());
            }.bind(this));
        };

        this.render = function () {
            return this.element || $('<div></div>');
        };

        this.destroy = function () {
            if (this.element) this.element.remove();
        };

        this.toggle = function () {};
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.line = line;
})();
