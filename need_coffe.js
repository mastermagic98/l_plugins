(function () {
    function showSubscriptionDays() {
        // Проверяем, указана ли дата окончания подписки
        if (userInfo.userExpires) {
            // Преобразуем дату окончания подписки в объект Date
            var expirationDate = new Date(userInfo.userExpires);
            var currentDate = new Date();

            // Вычисляем разницу в миллисекундах и преобразуем в дни
            var timeDifference = expirationDate - currentDate;
            var remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Перевод миллисекунд в дни

            // Устанавливаем цвет круга в зависимости от оставшихся дней
            var color;
            if (remainingDays < 5) {
                color = 'red';
            } else if (remainingDays < 10) {
                color = 'yellow';
            } else {
                color = 'white';
            }

            // Создаем SVG иконку
            subscriptionIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            `;

            // Обновляем глобальную переменную с остатком дней
            globalSubscriptionDays = remainingDays;

            // Возвращаем значение остатка дней
            return remainingDays;
        } else {
            // Если дата подписки не указана
            subscriptionIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            `;
            globalSubscriptionDays = 'Неизвестно';
            return null;
        }
    }

    function coffeeButtonAdd() {
        var _ = $('<li class="menu__item selector" data-action="coffee"><div class="menu__ico">' + subscriptionIcon + '</div><div class="menu__text">Запас кофе</div></li>');

        // Добавляем элемент в меню
        $(".menu .menu__list").eq(0).append(_);

        // Логика по нажатию
        _.on("hover:enter", function () {
            needCoffeeModal(); // Вызываем функцию needCoffeeModal при клике на кнопку
        });

        // Перемещаем элемент в нужное место
        setTimeout(function () {
            //$("[data-action=coffee]").insertBefore($("[data-action=movie]"));
        }, 1000);
    }

function needCoffeeModal() {
    // Function to display the modal
    var displayModal = function () {
        // Create the modal container without background
        var html = $('<div class="modal__body" style="padding: 20px; position: relative; border-radius: 10px;"></div>');

        // Add modal title with halloMessage
        var modalTitle = $(
            '<div style="font-size: 1.4em; font-weight: bold; color: white; margin-bottom: 20px; text-align: center; display: flex; align-items: flex-end;">' +
                '<span style="width: 30px; height: 30px; display: inline-block; vertical-align: bottom; margin-right: 20px;">' +
                    airplaneIconSVG +  // SVG Icon
                '</span>' +
                '<div style="font-size: 1.7em; font-weight: 400; color: lightgray; display: inline-block;">Привет, Авиатор!</div>' +
            '</div>'
        );

        // Add user instructions
        var instructions = $(
            '<div style="font-size: 1.2em; line-height: 1.4; color: white; text-align: center; margin-bottom: 0px;">' +
                'Похоже запасы иссякают. Чтобы угостить меня кофе, нажми на кнопку ниже.' +
            '</div>'
        );

        // Footer for the modal
        var foot = $(
            '<div class="modal__footer" style="display: flex; flex-direction: column; align-items: center; margin-top: 0px;"></div>'
        );

        var userInfoMessage = $(
            '<div style="font-size: 1.1em; line-height: 1.4; color: white; padding: 0 20px; text-align: center;">' +
                '<p><strong style="color: lightgray;">User ID:</strong> ' + (userInfo.userId || 'Неизвестно') + '</p>' +
                '<p><strong style="color: lightgray;">Запас кофе до:</strong> ' + (userInfo.userExpires || 'Неизвестно') + '</p>' +
                '<p><strong style="color: lightgray;">Остаток дней:</strong> ' + globalSubscriptionDays + '</p>' +
            '</div>'
        );

        foot.append(userInfoMessage);

        // Common button style
        var buttonStyle = {
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'height': '50px',
            'width': '100%',
            'max-width': '400px',
            'background': '#333333', // Dark background for modern look
            'color': 'white',
            'border-radius': '8px',
            'cursor': 'pointer',
            'text-transform': 'uppercase',
            'font-weight': 'bold',
            'outline': 'none',
            'transition': '0.3s ease',
            'margin': '10px 0',
        };

        // Focus button style
        var buttonFocusStyle = {
            'background': '#555555',
            'box-shadow': '0 0 10px 2px rgba(255, 255, 255, 0.8)',
        };

        // Load QR code library dynamically
        function loadQrLibrary(callback) {
            if (!window.QRCode) {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js';
                script.onload = callback;
                document.body.appendChild(script);
            } else {
                callback();
            }
        }

        // Generate QR code
        function generateQrCode(container, text, options) {
            $(container).empty();
            var qrOptions = $.extend({
                text: text,
                margin: 0,
                width: 205,
                height: 205,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            }, options || {});
            new QRCode(container, qrOptions);
        }

        // Create QR code container above the button
        function createQrContainer() {
            var qrContainer = $('<div class="qr-code-container" style="margin-bottom: 10px;"></div>');
            foot.prepend(qrContainer); // Prepend to make it appear above the button
            return qrContainer;
        }

        // Reset button styles
        function resetButtonStyles() {
            $('.simple-button.selector').css(buttonStyle);
        }

        // Add remote control events for buttons
        function addRemoteControl(button, action) {
            button.on('hover:focus', function() {
                resetButtonStyles();
                button.css(buttonFocusStyle);
            });

            button.on('hover:leave', function() {
                button.css(buttonStyle);
            });

            button.on('hover:enter', action);
        }

        // Get UID for QR code
        var uidForQR = Lampa.Storage.get('account_email') || Lampa.Storage.get('lampac_unic_id', '');

        // Telegram message text
        var messageText = 'Привет, мой логин на Aviamovie - ' + uidForQR + '. Как я могу угостить тебя кофе?';

        // Telegram link
        var telegramLink = 'https://t.me/pilot_valliko?&text=' + encodeURIComponent(messageText);

        // Telegram button
        var buttonTelegram = $('<div class="simple-button selector">Угостить кофе</div>').css(buttonStyle);
        addRemoteControl(buttonTelegram, function() {
            if (Lampa.Platform.screen('tv')) {
                loadQrLibrary(function() {
                    var qrContainer = createQrContainer();
                    generateQrCode(qrContainer[0], telegramLink);
                    setTimeout(function() {
                        Lampa.Controller.move('up');
                    }, 50);

                    setTimeout(function() {
                        Lampa.Controller.move('down');
                    }, 100); 
                });
            } else {
                window.open(telegramLink, '_blank');
            }
        });

        // Add elements to footer
        foot.append(buttonTelegram);

        // Append title, instructions, and footer to modal body
        html.append(modalTitle);
        html.append(instructions);  // Add instructions to the modal
        html.append(foot);

        // Open the modal
        Lampa.Modal.open({
            title: '',
            html: html,
            size: 'middle',
            position: 'center',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    };

    displayModal();
}

    function reqUserInfo(callback) {
        function account(url) {
            url = url + '';
            if (url.indexOf('account_email=') === -1) {
                var email = Lampa.Storage.get('account_email');
                if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
            }
            if (url.indexOf('uid=') === -1) {
                var uid = Lampa.Storage.get('lampac_unic_id', '');
                if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
            }
            return url;
        }

        var network = new Lampa.Reguest();

        network.silent(account('{localhost}/reqinfo'), function (response) {
            userInfo.ip = response.ip || null;
            userInfo.userAgent = response.userAgent || null;
            userInfo.country = response.country || null;

            var user = response.user || {};
            userInfo.userId = user.id || null;
            userInfo.userIds = user.ids || [];
            userInfo.userExpires = user.expires || null;
            userInfo.suid = response.user_uid || '';

            if (typeof callback === 'function') callback();
        });
    }

    // Глобальные переменные
		var airplaneIconSVG = 
        '<svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" id="control_x5F_tower" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="4.096"><polygon points="300.426,322.195 300.426,350.703 300.426,354.326 403.615,354.326 403.615,354.326 403.615,350.703 403.615,350.703 403.615,322.195 "></polygon><rect height="92.095" width="103.189" x="300.426" y="375.652"></rect><path d="M456.053,163.394h-32.32v-29.408c0-4.168-3.379-7.547-7.547-7.547h-48.484V66.771h28.394 c10.575,0,19.147-8.572,19.147-19.147v-3.371H289.894v3.371c0,10.575,8.572,19.147,19.147,19.147h28.393v59.668H288.95 c-4.169,0-7.548,3.379-7.548,7.547v29.408h-32.32c-5.34,0-9.115,5.228-7.434,10.296l21.834,65.861 c2.424,7.314,9.262,12.251,16.967,12.251h19.977v49.067h103.189v-49.067h21.07c7.705,0,14.543-4.937,16.968-12.251l21.834-65.861 C465.168,168.621,461.394,163.394,456.053,163.394z M290.503,226.649c-2.289,0-4.32-1.467-5.04-3.64l-9.111-27.481 c-1.139-3.438,1.42-6.982,5.041-6.982h52.42c2.933,0,5.311,2.377,5.311,5.311v27.481c0,2.933-2.378,5.311-5.311,5.311H290.503z M428.783,195.529l-9.11,27.481c-0.72,2.173-2.752,3.64-5.04,3.64h-43.311c-2.933,0-5.311-2.378-5.311-5.311v-27.481 c0-2.933,2.378-5.311,5.311-5.311h52.42C427.363,188.547,429.923,192.091,428.783,195.529z"></path><path d="M122.26,382.49c0.609,3.614,2.453,6.905,5.218,9.312l9.5,8.269c2.561,2.229,6.558,0.428,6.585-2.967l0.631-78.455 l53.203,38.438c12.142,8.773,28.434,9.158,40.978,0.971l20.493-13.379c2.328-1.52,2.76-4.754,0.91-6.83l-2.256-2.533 c-4.142-4.651-10.423-6.783-16.54-5.617l-23.43,4.472l-108.58-92.235c-10.58-8.987-23.986-14.256-37.867-14.059 c-4.415,0.063-9.039,0.647-13.629,2.047c-8.266,2.52-11.889,11.911-7.464,19.333c0.065,0.11,0.132,0.22,0.2,0.331 c0.871,1.417,2.046,2.639,3.395,3.614l53.364,38.554L122.26,382.49z"></path><path d="M153.423,264.238L171.118,280c3.266,2.908,7.541,4.422,11.909,4.217l56.938-2.676c2.762-0.621,3.525-4.195,1.257-5.89 l-8.412-6.284c-2.448-1.83-5.456-2.752-8.508-2.611l-68.65-7.529C152.865,258.921,151.33,262.374,153.423,264.238z"></path></g></svg>';
				
    var userInfo = {
        ip: null,
        userAgent: null,
        country: null,
        userId: null,
        userIds: [],
        userExpires: null,
        suid: ''
    };

    var subscriptionIcon = '';

    var globalSubscriptionDays = 0;
    
function handleAppReady() {
    // Загружаем информацию о пользователе
    reqUserInfo(function () {
        // Обновляем глобальную переменную subscriptionIcon только после загрузки данных
        var remainingDays = showSubscriptionDays();

        // Вызываем coffeeButtonAdd только если остаток дней менее 14
        if (remainingDays && remainingDays < 14) {
            setTimeout(function () {
                coffeeButtonAdd();
            }, 500);
        }
    });
}

if (window.appready) {
    handleAppReady();
} else {
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            handleAppReady();
        }
    });
}

})();
