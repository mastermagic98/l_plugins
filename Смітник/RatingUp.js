/**
 * @file RatingUp.js
 * @description Плагін для Lampa, який дозволяє переміщувати рейтинг на картках у верхній правий кут та/або розфарбовувати його залежно від значення.
 * @version 2.0
 */

(function() {
    'use strict';

    /**
     * Головна функція для ініціалізації плагіна.
     * Запускається після повної готовності додатку Lampa.
     */
    function startPlugin() {
        
        // --- Блок налаштувань ---
        // Тут ми отримуємо збережені користувачем налаштування.
        // Якщо налаштування ще не збережені, використовуються значення за замовчуванням (true).
        // Lampa.Storage.get('ключ', значення_за_замовчуванням)
        const settings = {
            // true - переміщувати блок рейтингу (.card__vote) у кут.
            repositionRatings: Lampa.Storage.get('uprate_reposition_enabled', true),
            // true - розфарбовувати рейтинг відповідно до його значення.
            useColoredRatings: Lampa.Storage.get('uprate_colored_enabled', true)
        };

        // Якщо обидві опції вимкнені, немає сенсу продовжувати роботу плагіна.
        if (!settings.repositionRatings && !settings.useColoredRatings) {
            console.log('UpRate plugin: обидві функції вимкнені в налаштуваннях.');
            return; 
        }

        console.log('UpRate plugin started:', `reposition is ${settings.repositionRatings ? 'ON' : 'OFF'}`, `coloring is ${settings.useColoredRatings ? 'ON' : 'OFF'}`);

        // --- Блок впровадження CSS ---
        // Цей блок додає CSS-правила на сторінку, якщо увімкнена опція переміщення.
        // Це ефективний спосіб миттєво застосувати стилі до всіх елементів.
        if (settings.repositionRatings) {
            let style = document.createElement('style');
            style.innerHTML = `
                /* Стилі застосовуються тільки до карток, які не в повноекранному режимі */
                .card:not(.fullscreen) .card__vote {
                    top: 0.3em !important;
                    bottom: auto !important;
                    right: 0.3em !important;
                    left: auto !important;
                }
            `;
            // Додаємо стилі в <head> документа
            document.head.appendChild(style);
        }

        /**
         * Застосовує колір до елемента на основі його числового текстового вмісту.
         * @param {HTMLElement} element - DOM-елемент, що містить текст рейтингу (напр. <div>7.5</div>).
         */
        function applyColorByRating(element) {
            // Перевіряємо, чи існує елемент
            if (!element) return;
            
            // Отримуємо текстовий вміст елемента і видаляємо зайві пробіли
            const voteText = element.textContent.trim();
            
            // Використовуємо регулярний вираз для пошуку першого числа (цілого або десяткового)
            const match = voteText.match(/(\d+(\.\d+)?)/);

            // Якщо число не знайдено, виходимо з функції
            if (!match) return;

            // Конвертуємо знайдене текстове число у формат float
            const vote = parseFloat(match[0]);
            
            // Застосовуємо колір залежно від діапазону оцінки
            if (vote >= 8 && vote <= 10) {
                element.style.color = 'lawngreen'; // Високий рейтинг (зелений)
            } else if (vote >= 6 && vote < 8) {
                element.style.color = 'cornflowerblue'; // Хороший рейтинг (синій)
            } else if (vote > 3 && vote < 6) {
                element.style.color = 'orange'; // Середній/посередній рейтинг (помаранчевий)
            } else if (vote >= 0 && vote <= 3) {
                element.style.color = 'red'; // Низький рейтинг (червоний)
            }
        }

        /**
         * Основна функція оновлення, яка застосовує зміни до елементів з рейтингами.
         * Викликається при початковому завантаженні та при змінах у структурі сторінки (DOM).
         */
        function updateRatings() {
            
            // --- Блок оновлення позиції ---
            if (settings.repositionRatings) {
                const votesToPosition = document.querySelectorAll(".card__vote");
                votesToPosition.forEach(voteElement => {
                    // Перевіряємо, що батьківський елемент .card не в повноекранному режимі
                    if (!voteElement.closest('.fullscreen')) {
                        // Застосовуємо стилі позиціонування через JS для динамічно доданих елементів.
                        // Це дублює CSS, але гарантує роботу для елементів, що з'являються пізніше.
                        voteElement.style.position = "absolute";
                        voteElement.style.top = "0.3em";
                        voteElement.style.bottom = "auto";
                        voteElement.style.right = "0.3em";
                        voteElement.style.left = "auto";
                    }
                });
            }

            // --- Блок оновлення кольору ---
            if (settings.useColoredRatings) {
                // Вибираємо всі відомі елементи, де може відображатись рейтинг
                const allRatingElements = document.querySelectorAll(
                    ".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate"
                );
                // Застосовуємо функцію розфарбовування до кожного знайденого елемента
                allRatingElements.forEach(applyColorByRating);
            }
        }

        // --- Блок ініціалізації та спостереження ---

        // Запускаємо оновлення кілька разів з невеликими затримками.
        // Це потрібно для сторінок, де контент може завантажуватися частинами.
        setTimeout(updateRatings, 500);
        setTimeout(updateRatings, 1500);
        
        // Створюємо MutationObserver для відстеження змін у DOM (напр. підвантаження нових карток при прокрутці).
        // Це дозволяє автоматично застосовувати стилі до нових елементів.
        const observer = new MutationObserver(updateRatings);
        observer.observe(document.body, { 
            childList: true, // стежити за додаванням/видаленням дочірніх елементів
            subtree: true    // стежити за змінами у всіх вкладених елементах
        });

        // Додаємо спеціальний слухач подій Lampa для надійного оновлення при відкритті сторінки з детальною інформацією.
        if (typeof Lampa !== 'undefined') {
            Lampa.Listener.follow('full', function (data) {
                // Подія 'complite' означає, що сторінка повністю завантажена
                if (data.type === 'complite') {
                    // Невелика затримка, щоб гарантувати, що всі елементи сторінки відмалювалися
                    setTimeout(updateRatings, 150); 
                }
            });
        }
    }

    // --- Блок запуску плагіна ---
    // Цей код перевіряє, чи завантажена Lampa, і запускає плагін у відповідний момент.
    if (typeof Lampa !== 'undefined') {
        // Якщо Lampa вже готова, запускаємо одразу
        if (window.appready) {
            startPlugin();
        } else {
            // Інакше, чекаємо на подію 'app' з типом 'ready'
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') startPlugin();
            });
        }
    } else {
        // Якщо Lampa не знайдена, спробуємо запустити плагін після повного завантаження сторінки
        // (корисно для розробки або нестандартних середовищ).
        window.addEventListener('load', startPlugin);
    }
})();
