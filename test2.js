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
    
    // Make sure the plugin re-initializes properly after page refresh
    function initPlugin() {
        // Run immediately
        colorizeRatings();
        
        // Set up mutation observer for continuous monitoring
        var observer = new MutationObserver(function(mutations) {
            colorizeRatings();
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Multiple initialization points to ensure the plugin runs
    // After DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 500);
        });
    } else {
        // DOM already loaded
        setTimeout(initPlugin, 500);
    }
    
    // When Lampa app is ready
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('appready', function(event) {
            if (event.type == 'ready') {
                initPlugin();
            }
        });
    }
    
    // Additional initialization point for extra reliability
    Lampa.Listener.follow('app', function(event) {
        if (event.type == 'ready') {
            initPlugin();
        }
    });
    
})();
