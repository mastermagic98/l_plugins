(function() {
    'use strict';
    
    // Встановлюємо режим TV платформи
    Lampa.Platform.tv();
    
    /**
     * Головна функція для колоризації рейтингів в інтерфейсі Lampa
     */
    function колоризаціяРейтингів() {
        // Перевіряємо чи ми на правильній платформі
        if (Lampa.Manifest.origin !== 'bylampa') {
            Lampa.Noty.show('Помилка доступу');
            return;
        }
        
        // Обробляємо елементи full-start rate та info rate
        const елементиРейтингу = document.querySelectorAll('.full-start__rate > div, .info__rate > span');
        
        for (let i = 0; i < елементиРейтингу.length; i++) {
            const елемент = елементиРейтингу[i];
            const рейтинг = parseFloat(елемент.textContent.trim());
            
            // Встановлюємо напівпрозорий фон
            елемент.style.background = 'rgba(0, 0, 0, 0.8)';
            
            // Застосовуємо колір в залежності від значення рейтингу
            if (рейтинг >= 0 && рейтинг <= 3) {
                елемент.style.color = '#e74c3c'; // Червоний
            } else if (рейтинг > 3 && рейтинг <= 5) {
                елемент.style.color = '#e67e22'; // Помаранчевий
            } else if (рейтинг > 5 && рейтинг <= 6.5) {
                елемент.style.color = '#f1c40f'; // Жовтий
            } else if (рейтинг > 6.5 && рейтинг < 8) {
                елемент.style.color = '#3498db'; // Синій
            } else if (рейтинг >= 8 && рейтинг <= 10) {
                елемент.style.color = '#2ecc71'; // Зелений
            }
        }
        
        // Обробляємо елементи card vote (окремий набір елементів рейтингу)
        const елементиКарткиГолосування = document.querySelectorAll('.card__vote');
        
        for (let i = 0; i < елементиКарткиГолосування.length; i++) {
            const елемент = елементиКарткиГолосування[i];
            const рейтинг = parseFloat(елемент.textContent.trim());
            
            // Застосовуємо колір в залежності від значення рейтингу
            if (рейтинг >= 0 && рейтинг <= 3) {
                елемент.style.color = '#e74c3c'; // Червоний
            } else if (рейтинг > 3 && рейтинг <= 5) {
                елемент.style.color = '#e67e22'; // Помаранчевий
            } else if (рейтинг > 5 && рейтинг <= 6.5) {
                елемент.style.color = '#f1c40f'; // Жовтий
            } else if (рейтинг > 6.5 && рейтинг < 8) {
                елемент.style.color = '#3498db'; // Синій
            } else if (рейтинг >= 8 && рейтинг <= 10) {
                елемент.style.color = '#2ecc71'; // Зелений
            }
        }
    }
    
    // Запускаємо при завантаженні документа з невеликою затримкою
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(колоризаціяРейтингів, 500);
    });
    
    // Налаштовуємо спостерігач мутацій для відстеження змін у DOM
    const спостерігач = new MutationObserver(колоризаціяРейтингів);
    спостерігач.observe(document.body, {
        'childList': true,
        'subtree': true
    });
    
    // Запускаємо, коли додаток готовий, якщо window.appready вже true
    // Інакше слухаємо подію appready
    if (window.appready) {
        колоризаціяРейтингів();
    } else {
        Lampa.Listener.follow('appready', function(event) {
            if (event.type == 'ready') {
                колоризаціяРейтингів();
            }
        });
    }
})();
