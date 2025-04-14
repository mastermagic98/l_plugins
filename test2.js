(function() {
    'use strict';
    
    /**
     * Головна функція для колоризації рейтингів в інтерфейсі Lampa
     */
    function colorizeRatings() {
        // Обробляємо елементи full-start rate та info rate
        var rateElements = document.querySelectorAll('.full-start__rate > div, .info__rate > span');
        
        for (var i = 0; i < rateElements.length; i++) {
            var element = rateElements[i];
            var rating = parseFloat(element.textContent.trim());
            
            // Встановлюємо напівпрозорий фон
            element.style.background = 'rgba(0, 0, 0, 0.8)';
            
            // Застосовуємо колір в залежності від значення рейтингу
            if (rating >= 0 && rating <= 3) {
                element.style.color = '#e74c3c'; // Червоний
            } else if (rating > 3 && rating <= 5) {
                element.style.color = '#e67e22'; // Помаранчевий
            } else if (rating > 5 && rating <= 6.5) {
                element.style.color = '#f1c40f'; // Жовтий
            } else if (rating > 6.5 && rating < 8) {
                element.style.color = '#3498db'; // Синій
            } else if (rating >= 8 && rating <= 10) {
                element.style.color = '#2ecc71'; // Зелений
            }
        }
        
        // Обробляємо елементи card vote (окремий набір елементів рейтингу)
        var cardVoteElements = document.querySelectorAll('.card__vote');
        
        for (var j = 0; j < cardVoteElements.length; j++) {
            var cardElement = cardVoteElements[j];
            var cardRating = parseFloat(cardElement.textContent.trim());
            
            // Застосовуємо колір в залежності від значення рейтингу
            if (cardRating >= 0 && cardRating <= 3) {
                cardElement.style.color = '#e74c3c'; // Червоний
            } else if (cardRating > 3 && cardRating <= 5) {
                cardElement.style.color = '#e67e22'; // Помаранчевий
            } else if (cardRating > 5 && cardRating <= 6.5) {
                cardElement.style.color = '#f1c40f'; // Жовтий
            } else if (cardRating > 6.5 && cardRating < 8) {
                cardElement.style.color = '#3498db'; // Синій
            } else if (cardRating >= 8 && cardRating <= 10) {
                cardElement.style.color = '#2ecc71'; // Зелений
            }
        }
    }
    
    // Функція ініціалізації плагіну, щоб забезпечити правильне завантаження після оновлення сторінки
    function initPlugin() {
        // Запуск одразу
        colorizeRatings();
        
        // Налаштування спостерігача мутацій для постійного моніторингу
        var observer = new MutationObserver(function(mutations) {
            colorizeRatings();
        });
        
        // Початок спостереження за документом з налаштованими параметрами
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Кілька точок ініціалізації для забезпечення запуску плагіну
    // Після готовності DOM
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 500);
        });
    } else {
        // DOM вже завантажено
        setTimeout(initPlugin, 500);
    }
    
    // Коли додаток Lampa готовий
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('appready', function(event) {
            if (event.type == 'ready') {
                initPlugin();
            }
        });
    }
    
    // Додаткова точка ініціалізації для більшої надійності
    Lampa.Listener.follow('app', function(event) {
        if (event.type == 'ready') {
            initPlugin();
        }
    });
    
})();
