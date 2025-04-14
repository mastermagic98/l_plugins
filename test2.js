(function() {
    'use strict';
    
    function colorizeRatings() {
        var rateElements = document.querySelectorAll('.full-start__rate > div, .info__rate > span');
        
        for (var i = 0; i < rateElements.length; i++) {
            var element = rateElements[i];
            var rating = parseFloat(element.textContent.trim());
            
            element.style.background = 'rgba(0, 0, 0, 0.8)';
            
            if (rating >= 0 && rating <= 3) {
                element.style.color = '#e74c3c';
            } else if (rating > 3 && rating <= 5) {
                element.style.color = '#e67e22';
            } else if (rating > 5 && rating <= 6.5) {
                element.style.color = '#f1c40f';
            } else if (rating > 6.5 && rating < 8) {
                element.style.color = '#3498db';
            } else if (rating >= 8 && rating <= 10) {
                element.style.color = '#2ecc71';
            }
        }
        
        var cardVoteElements = document.querySelectorAll('.card__vote');
        
        for (var j = 0; j < cardVoteElements.length; j++) {
            var cardElement = cardVoteElements[j];
            var cardRating = parseFloat(cardElement.textContent.trim());
            
            if (cardRating >= 0 && cardRating <= 3) {
                cardElement.style.color = '#e74c3c';
            } else if (cardRating > 3 && cardRating <= 5) {
                cardElement.style.color = '#e67e22';
            } else if (cardRating > 5 && cardRating <= 6.5) {
                cardElement.style.color = '#f1c40f';
            } else if (cardRating > 6.5 && cardRating < 8) {
                cardElement.style.color = '#3498db';
            } else if (cardRating >= 8 && cardRating <= 10) {
                cardElement.style.color = '#2ecc71';
            }
        }
    }
    
    function initPlugin() {
        colorizeRatings();
    }
    
    function setupMutationObserver() {
        var observer = new MutationObserver(function() {
            colorizeRatings();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPlugin();
            setupMutationObserver();
        });
    } else {
        initPlugin();
        setupMutationObserver();
    }
    
    if (window.appready) {
        initPlugin();
        setupMutationObserver();
    } else {
        Lampa.Listener.follow('appready', function(event) {
            if (event.type == 'ready') {
                initPlugin();
                setupMutationObserver();
            }
        });
    }
    
    Lampa.Listener.follow('app', function(event) {
        if (event.type == 'ready') {
            initPlugin();
            setupMutationObserver();
        }
    });
})();
