(function() {
    'use strict';

        
        // Handle full-start rate elements and info rate elements
        const rateElements = document.querySelectorAll('.full-start__rate > div, .info__rate > span');
        
        for (let i = 0; i < rateElements.length; i++) {
            const element = rateElements[i];
            const rating = parseFloat(element.textContent.trim());
            
            // Set semi-transparent background
            element.style.background = 'rgba(0, 0, 0, 0.8)';
            
            // Apply color based on rating value
            if (rating >= 0 && rating <= 3) {
                element.style.color = '#e74c3c'; // Red
            } else if (rating > 3 && rating <= 5) {
                element.style.color = '#e67e22'; // Orange
            } else if (rating > 5 && rating <= 6.5) {
                element.style.color = '#f1c40f'; // Yellow
            } else if (rating > 6.5 && rating < 8) {
                element.style.color = '#3498db'; // Blue
            } else if (rating >= 8 && rating <= 10) {
                element.style.color = '#2ecc71'; // Green
            }
        }
        
        // Handle card vote elements (separate set of rating elements)
        const cardVoteElements = document.querySelectorAll('.card__vote');
        
        for (let i = 0; i < cardVoteElements.length; i++) {
            const element = cardVoteElements[i];
            const rating = parseFloat(element.textContent.trim());
            
            // Apply color based on rating value
            if (rating >= 0 && rating <= 3) {
                element.style.color = '#e74c3c'; // Red
            } else if (rating > 3 && rating <= 5) {
                element.style.color = '#e67e22'; // Orange
            } else if (rating > 5 && rating <= 6.5) {
                element.style.color = '#f1c40f'; // Yellow
            } else if (rating > 6.5 && rating < 8) {
                element.style.color = '#3498db'; // Blue
            } else if (rating >= 8 && rating <= 10) {
                element.style.color = '#2ecc71'; // Green
            }
        }
    }
    
    // Run on document ready with slight delay
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(colorizeRatings, 500);
    });
    
    // Set up mutation observer to watch for DOM changes
    const observer = new MutationObserver(colorizeRatings);
    observer.observe(document.body, {
        'childList': true,
        'subtree': true
    });
    
    // Run when app is ready if window.appready is already true
    // Otherwise listen for the appready event
    if (window.appready) {
        colorizeRatings();
    } else {
        Lampa.Listener.follow('appready', function(event) {
            if (event.type == 'ready') {
                colorizeRatings();
            }
        });
    }
})();
