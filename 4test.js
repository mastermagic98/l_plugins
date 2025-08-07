// Реєстрація компонента в Lampa
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M256 48C141.6 48 48 141.6 48 256s93.6 208 208 208 208-93.6 208-208S370.4 48 256 48zm0 384c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176zm0-80c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-160c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64z" style="fill: currentColor;"></path></svg>'
});

// Функція для створення інтерфейсу вибору кольору
function createColorPicker() {
    // Створюємо контейнер для повзунків та поля введення
    var container = document.createElement('div');
    container.style.padding = '20px';
    container.style.background = '#333';
    container.style.borderRadius = '10px';
    container.style.maxWidth = '400px';
    container.style.margin = '0 auto';

    // Створюємо повзунки для RGB та Alpha
    var sliders = [
        { label: 'Червоний', id: 'red', max: 255 },
        { label: 'Зелений', id: 'green', max: 255 },
        { label: 'Синій', id: 'blue', max: 255 },
        { label: 'Прозорість', id: 'alpha', max: 100 }
    ];

    var values = { red: 255, green: 255, blue: 255, alpha: 100 };

    sliders.forEach(function(slider) {
        var label = document.createElement('label');
        label.textContent = slider.label + ': ';
        label.style.color = '#fff';
        label.style.display = 'block';
        label.style.margin = '10px 0 5px';

        var input = document.createElement('input');
        input.type = 'range';
        input.min = 0;
        input.max = slider.max;
        input.value = values[slider.id];
        input.id = slider.id;
        input.style.width = '100%';

        input.oninput = function() {
            values[slider.id] = parseInt(this.value);
            updateTheme();
        };

        container.appendChild(label);
        container.appendChild(input);
    });

    // Створюємо поле для введення HEX-коду
    var hexLabel = document.createElement('label');
    hexLabel.textContent = 'HEX-код: ';
    hexLabel.style.color = '#fff';
    hexLabel.style.display = 'block';
    hexLabel.style.margin = '10px 0 5px';

    var hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.placeholder = '#FFFFFF';
    hexInput.style.width = '100%';
    hexInput.style.padding = '5px';
    hexInput.style.borderRadius = '5px';

    hexInput.oninput = function() {
        var hex = this.value.replace('#', '');
        if (hex.length === 6) {
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                values.red = r;
                values.green = g;
                values.blue = b;
                document.getElementById('red').value = r;
                document.getElementById('green').value = g;
                document.getElementById('blue').value = b;
                updateTheme();
            }
        }
    };

    container.appendChild(hexLabel);
    container.appendChild(hexInput);

    // Функція для оновлення теми
    function updateTheme() {
        var rgba = 'rgba(' + values.red + ',' + values.green + ',' + values.blue + ',' + (values.alpha / 100) + ')';
        var hex = '#' + ((1 << 24) + (values.red << 16) + (values.green << 8) + values.blue).toString(16).slice(1);
        hexInput.value = hex;

        // Оновлюємо основний фон або елементи Lampa
        var style = document.createElement('style');
        style.id = 'custom-theme';
        style.textContent = '.lampa .background--fill, .lampa .selector { background-color: ' + rgba + ' !important; }';
        
        var oldStyle = document.getElementById('custom-theme');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);

        // Зберігаємо налаштування
        Lampa.Storage.set('custom_theme', {
            red: values.red,
            green: values.green,
            blue: values.blue,
            alpha: values.alpha
        });
    }

    // Завантажуємо збережені налаштування
    var savedTheme = Lampa.Storage.get('custom_theme', null);
    if (savedTheme) {
        values.red = savedTheme.red;
        values.green = savedTheme.green;
        values.blue = savedTheme.blue;
        values.alpha = savedTheme.alpha;
        document.getElementById('red').value = savedTheme.red;
        document.getElementById('green').value = savedTheme.green;
        document.getElementById('blue').value = savedTheme.blue;
        document.getElementById('alpha').value = savedTheme.alpha;
        updateTheme();
    }

    return container;
}

// Додаємо компонент до меню налаштувань
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    onRender: function(content) {
        content.innerHTML = '';
        content.appendChild(createColorPicker());
    }
});
