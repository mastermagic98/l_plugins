// Реєстрація компонента в меню налаштувань Lampa
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<span style="font-size: 20px;">🖌️</span>' // Використовуємо емодзі як іконку
});

// Функція для створення інтерфейсу вибору кольору
function createColorPicker(content) {
    // Очищаємо вміст для уникнення дублювання
    content.innerHTML = '';

    // Створюємо контейнер для повзунків та поля введення
    var container = document.createElement('div');
    container.style.padding = '20px';
    container.style.background = '#333';
    container.style.borderRadius = '10px';
    container.style.maxWidth = '400px';
    container.style.margin = '0 auto';
    container.style.color = '#fff';

    // Ініціалізація значень кольору
    var values = { red: 255, green: 255, blue: 255, alpha: 100 };

    // Створюємо повзунки для RGB та Alpha
    var sliders = [
        { label: 'Червоний', id: 'red', max: 255 },
        { label: 'Зелений', id: 'green', max: 255 },
        { label: 'Синій', id: 'blue', max: 255 },
        { label: 'Прозорість', id: 'alpha', max: 100 }
    ];

    sliders.forEach(function(slider) {
        // Створюємо мітку для повзунка
        var label = document.createElement('label');
        label.textContent = slider.label + ': ';
        label.style.display = 'block';
        label.style.margin = '10px 0 5px';

        // Створюємо повзунок
        var input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = slider.max.toString();
        input.value = values[slider.id].toString();
        input.id = 'color_' + slider.id; // Унікальний ID
        input.style.width = '100%';

        // Обробник події для оновлення теми
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
    hexLabel.style.display = 'block';
    hexLabel.style.margin = '10px 0 5px';

    var hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.placeholder = '#FFFFFF';
    hexInput.style.width = '100%';
    hexInput.style.padding = '5px';
    hexInput.style.borderRadius = '5px';

    // Обробник для HEX-введення
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
                document.getElementById('color_red').value = r;
                document.getElementById('color_green').value = g;
                document.getElementById('color_blue').value = b;
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

        // Оновлюємо стилі Lampa
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
        document.getElementById('color_red').value = savedTheme.red;
        document.getElementById('color_green').value = savedTheme.green;
        document.getElementById('color_blue').value = savedTheme.blue;
        document.getElementById('color_alpha').value = savedTheme.alpha;
        updateTheme();
    }

    // Додаємо контейнер до вмісту
    content.appendChild(container);
}

// Додаємо обробник для рендерингу компонента
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<span style="font-size: 20px;">🖌️</span>',
    onRender: function(content) {
        createColorPicker(content);
    }
});
