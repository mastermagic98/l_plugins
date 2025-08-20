if (selectedElement.classList.contains('color_input')) {
    var inputField = modalHtml.find('.color_input')[0];
    var inputOptions = {
        value: inputField.value || '#',
        name: 'color_hex'
    };
    Lampa.Input.edit(inputOptions, function (value) {
        if (value === '#' || !isValidHex(value)) {
            Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
            Lampa.Controller.toggle('settings_component');
            return;
        }
        try {
            ColorPlugin.settings[paramName] = value;
            Lampa.Storage.set('color_plugin_' + paramName, value);
            applyStyles();
            var descr = $('.settings-param[data-name="color_plugin_' + paramName + '"] .settings-param__descr div');
            if (descr.length) {
                descr.css('background-color', value);
            }
        } finally {
            Lampa.Modal.close();
            Lampa.Controller.toggle('settings_component');
            Lampa.Controller.enable('menu');
            Lampa.Settings.render();
        }
    });
    return; // Чекаємо введення через Lampa.Input.edit
}
