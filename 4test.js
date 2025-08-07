// Реєстрація компонента в меню налаштувань Lampa
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>'
});

// Функція для створення інтерфейсу вибору кольору
function createColorPicker(content) {
    console.log('[MyThemes] Починаємо створення інтерфейсу вибору кольору');

    // Очищаємо вміст
    content.innerHTML = '';

    // Створюємо контейнер
    var container = document.createElement('div');
    container.style.padding = '20px';
    container.style.background = '#333';
    container.style.borderRadius = '10px';
    container.style.maxWidth = '400px';
    container.style.margin = '0 auto';
    container.style.color = '#fff';
    container.style.display = 'block';
    container.style.zIndex = '1000'; // Для уникнення перекриття іншими стилями

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
        // Створюємо мітку
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
        input.id = 'color_' + slider.id;
        input.style.width = '100%';

        // Обробник для повзунка
        input.oninput = function() {
            values[slider.id] = parseInt(this.value);
            updateTheme();
        };

        container.appendChild(label);
        container.appendChild(input);
    });

    // Створюємо поле для HEX-коду
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

    // Обробник для HEX-коду
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
        console.log('[MyThemes] Оновлення теми з RGBA:', values);

        // Формуємо HEX-код без прозорості
        var hex = '#' + ((1 << 24) + (values.red << 16) + (values.green << 8) + values.blue).toString(16).slice(1);
        hexInput.value = hex;

        // Формуємо RGBA для прозорості
        var rgba = 'rgba(' + values.red + ',' + values.green + ',' + values.blue + ',' + (values.alpha / 100) + ')';

        // Оновлюємо змінну --accent-color у :root
        var style = document.createElement('style');
        style.id = 'custom-theme';
        style.textContent = ':root { --accent-color: ' + rgba + ' !important; }';

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
        console.log('[MyThemes] Завантажено збережені налаштування:', savedTheme);
        values.red = savedTheme.red;
        values.green = savedTheme.green;
        values.blue = savedTheme.blue;
        values.alpha = savedTheme.alpha;
        document.getElementById('color_red').value = savedTheme.red;
        document.getElementById('color_green').value = savedTheme.green;
        document.getElementById('color_blue').value = savedTheme.blue;
        document.getElementById('color_alpha').value = savedTheme.alpha;
        updateTheme();
    } else {
        console.log('[MyThemes] Немає збережених налаштувань, використовуємо стандартні');
        updateTheme();
    }

    // Додаємо контейнер до вмісту
    content.appendChild(container);
    console.log('[MyThemes] Інтерфейс вибору кольору додано до DOM');
}

// Додаємо обробник для рендерингу компонента
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>',
    onRender: function(content) {
        console.log('[MyThemes] Викликано onRender для my_themes');
        createColorPicker(content);
    }
});
