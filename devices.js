        (function () {
    "use strict";


var MAX_DEVICES = 5;


var userInfo = {
    ip: null,
    userAgent: null,
    country: null,
    userId: null,
    userIds: [],
    userExpires: null,
    suid: ''
};


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
        console.log('Received response:', response); // Вывод всей информации в консоль

        userInfo.ip = response.ip || null;
        userInfo.userAgent = response.userAgent || null;
        userInfo.country = response.country || null;

        var user = response.user || {};
        userInfo.userId = user.id || null;
        userInfo.userIds = user.ids || [];
        userInfo.userExpires = user.expires || null;
        userInfo.suid = response.user_uid || '';

        console.log('Processed userInfo:', userInfo); // Вывод обработанной информации

        if (typeof callback === 'function') callback();
    });
}

    function devices() {
        var REGISTRATION_COOLDOWN_PERIOD = 10 * 24 * 60 * 60 * 1000; // 10 дней в миллисекундах

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }

function extractDeviceInfo(userAgent) {
    if (!userAgent) return 'Unknown Device';

    // Используем RegExp для извлечения текста в скобках
    var deviceMatch = userAgent.match(/\((.*?)\)/);
    var deviceDetails = deviceMatch ? deviceMatch[1] : 'Unknown Details';

    // Проверяем, если устройство это TV
    if (Lampa.Platform.screen('tv')) {
        if (userAgent.match(/Android/)) {
            return 'Android TV - (' + deviceDetails + ')';
        } else if (userAgent.match(/Apple/)) {
            // Если user agent iPad, но это Apple TV
            if (userAgent.match(/iPad/) && !Lampa.Platform.screen('mobile')) {
                return 'Apple TV - (' + deviceDetails + ')';
            }
        } else if (userAgent.match(/WebOS|LG|Samsung|Tizen|Smart-TV/)) {
            return 'Smart TV - (' + deviceDetails + ')';
        }

    }

    // Проверка для других типов устройств
    if (userAgent.match(/Android/)) {
        return 'Android Device - (' + deviceDetails + ')';
    } else if (userAgent.match(/iPhone/)) {
        return 'iPhone - (' + deviceDetails + ')';
    } else if (userAgent.match(/Macintosh/)) {
        // Условие для iPad
        if (Lampa.Platform.screen('mobile')) {
            return 'iPad - (' + deviceDetails + ')';
        } else {
            return 'Mac Device - (' + deviceDetails + ')';
        }
    } else if (userAgent.match(/iPod/)) {
        return 'iPod - (' + deviceDetails + ')';
    } else if (userAgent.match(/Windows/)) {
        return 'Windows PC - (' + deviceDetails + ')';
    }

    return 'Unknown Device - (' + deviceDetails + ')';
}
        function getDeviceId() {
            var userAgent = navigator.userAgent || '';
            var deviceInfo = extractDeviceInfo(userAgent);
            var uuid = Lampa.Storage.get('device_uuid') || generateUUID();

            Lampa.Storage.set('device_uuid', uuid);

            return {
                uuid: uuid,
                info: deviceInfo,
                userAgent: userAgent
            };
        }

function registerDevice() {
    var device = getDeviceId();
    var userDevices = Lampa.Storage.get('user_devices') || [];
    var lastActivity = Lampa.Storage.get('last_activity');

    var isDeviceRegistered = userDevices.some(function (d) {
        return d.uuid === device.uuid;
    });

    if (isDeviceRegistered) {
        Lampa.Storage.set('last_activity', new Date().getTime());
        return;
    }

    if (lastActivity && new Date().getTime() - lastActivity < REGISTRATION_COOLDOWN_PERIOD) {
        var remainingTime = REGISTRATION_COOLDOWN_PERIOD - (new Date().getTime() - lastActivity);
        var cooldownDate = new Date(new Date().getTime() + remainingTime);

        var html = $('<div class="modal-content"></div>');

        // Вставляем стиль CSS
html.append('<style>' +
    '.modal-content { padding: 20px; font-family: "Roboto", sans-serif; border-radius: 8px; color: #555; }' +  
    '.modal-content div { font-size: 14px; line-height: 1.5; color: #aaa; margin-top: 10px; }' +  
    '.modal-content b { font-weight: bold; color: #777; }' + 
    '.modal-content .highlight { color: #fff; }' +  
    '</style>');

        // Добавляем текст с пояснением
        html.append('<div class="">' +
            'Авиатор, это устройство уже было зарегистрировано. Для того чтобы зарегистрировать его снова, ' +
            'необходимо подождать до <b class="highlight">' + cooldownDate.toLocaleDateString() + ' ' + cooldownDate.toLocaleTimeString() + '</b>.<br><br>' +
            'Установлен период охлаждения 10 дней, что бы устройства не перебирали по кругу с целью обойти ограничения. Мы ценим твое терпение и стараемся ' +
            'обеспечить стабильную работу сервиса. Если возникли вопросы, не стесняйся обращаться в поддержку.</div>');

        // Открытие модального окна, удаляем кнопки"

         
        Lampa.Modal.open({
            title: 'Регистрация устройства',
            html: html,
            size: 'medium',
            onBack: handleBackForCooldown.bind(null, html)
        });
        return;
    }

if (userDevices.length >= MAX_DEVICES) {
    function removeElementsOnComplete() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Удаление всех элементов с указанными классами
                $('.view--torrent, .view--online, .view--trailer').each(function() {
                    $(this).remove();
                });

            }
        });
    }

    // Запускаем функцию удаления
    removeElementsOnComplete();

    // Добавляем стиль
    $('head').append('<style>' +
        '.modal-content { padding: 20px; font-family: "Roboto", sans-serif; border-radius: 8px; color: #333; }' +
        '.modal-content div { font-size: 14px; line-height: 1.5; color: #888; margin-top: 10px; }' +
        '.modal-content b { font-weight: bold; color: #777; }' +
        '.modal-content .highlight { color: #fff; font-style: italic; }' +
        '</style>');

    // Создаем HTML-контейнер для модального окна
    var htmlLimit = $('<div class="modal-content"></div>');

    // Добавляем текст и стили
    htmlLimit.append('<div style="font-size: 1.3em;">' +
        'Авиатор, ты превысил лимит зарегистрированных устройств. <br>' +
        'Перейди в <span class="highlight">"Настройки"</span> - <span class="highlight">"Профиль и устройства"</span> и удали одно из ненужных устройств, чтобы зарегистрировать это. Функционал ограничен.</div>');

    // Открываем модальное окно
    Lampa.Modal.open({
        title: 'Превышен лимит устройств',
        html: htmlLimit,
        size: 'medium',  // Устанавливаем средний размер окна
        onBack: function() {
            Lampa.Modal.close();
            Lampa.Controller.toggle('content');
        }
    });

    return;
}
    userDevices.push(device);
    Lampa.Storage.set('user_devices', userDevices);
    Lampa.Storage.set('last_activity', new Date().getTime());
}

// Функция для обработки нажатия на "Назад" для периода охлаждения
function handleBackForCooldown(html) {
    Lampa.Modal.open({
        title: 'Регистрация устройства',
        html: html,
        size: 'medium',
        onBack: handleBackForCooldown.bind(null, html) // Повторно открываем окно при нажатии "Назад"
    });
}

        registerDevice();
    }

function deleteDevice(uuid) {
    Lampa.Select.show({
        title: 
               Lampa.Lang.translate('Повторная регистрация удаленного устройства возможна только через 10 дней.'),
               
        nomark: true,
        items: [
            {
                title: Lampa.Lang.translate('Удалить'),
                "import": true,
                selected: true
            },
            {
                title: Lampa.Lang.translate('Отмена'),
                "cancel": true
            }
        ],
        onSelect: function (item) {
            if (item["import"]) {
                var devices = Lampa.Storage.get('user_devices') || [];
                devices = devices.filter(function (device) {
                    return device.uuid !== uuid;
                });
                Lampa.Storage.set('user_devices', devices);

                Lampa.Noty.show(Lampa.Lang.translate('Устройство удалено'));
                location.reload();
            } else if (item["cancel"]) {
                Lampa.Controller.toggle('settings_component');
                Lampa.Noty.show(Lampa.Lang.translate('Удаление отменено'));
            }
        },
        onBack: function () {
            Lampa.Controller.toggle('settings_component');
        }
    });
}

    function renderDeviceList() {
        var devices = Lampa.Storage.get('user_devices') || [];

        // Добавляем информационное сообщение
        Lampa.SettingsApi.addParam({
            component: 'account_menu',
            param: {
                type: 'title'
            },
            field: {
                name: '',
                description: 'Зарегистрированные устройства'
            }

        });
        


        devices.forEach(function (device) {
            Lampa.SettingsApi.addParam({
                component: 'account_menu',
                param: {
                    type: 'button'
                },
                field: {
                    name: device.info || 'Неизвестное устройство',
                    description: 'Нажмите что бы удалить'
                },
                onChange: function () {
                    deleteDevice(device.uuid);
                }
            });
        });
        

        if (devices.length === 0) {
            Lampa.SettingsApi.addParam({
                component: 'account_menu',
                param: {
                    type: 'title'
                },
                field: {
                    name: 'Нет зарегистрированных устройств',
                    description: 'Зарегистрируйте устройство для отображения в списке.'
                }
            });
        }
    }
    


    function renderUserInfo() {
        Lampa.SettingsApi.addParam({
            component: 'account_menu',
            param: {
                name: 'UserInfoParam',
                type: 'title'
            },
            field: {
                name: 'Информация пользователя',
                description: 
                    '<p><strong>User ID:</strong> ' + (userInfo.userId || 'Неизвестно') + '</p>' +
                    '<p><strong>Запас кофе до:</strong> ' + (userInfo.userExpires || 'Неизвестно') + '</p>' +
                    '<p><strong>Максимальное количество устройств:</strong> ' + MAX_DEVICES  +
                    '</div>'
            }
        });
    }

reqUserInfo(function () {
    Lampa.SettingsApi.addComponent({
        component: 'account_menu',
        name: 'Профиль и устройства',
        icon: '<svg width="253px" height="253px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.86002 19L11.54 17.58C11.79 17.37 12.21 17.37 12.47 17.58L14.14 19C14.53 19.2 15.01 19 15.15 18.58L15.47 17.62C15.55 17.39 15.47 17.05 15.3 16.88L13.66 15.23C13.54 15.11 13.45 14.88 13.45 14.72V12.87C13.45 12.45 13.76 12.25 14.15 12.41L17.5 13.85C18.05 14.09 18.51 13.79 18.51 13.19V12.26C18.51 11.78 18.15 11.22 17.7 11.03L13.76 9.32999C13.59 9.25999 13.46 9.04999 13.46 8.86999V6.79999C13.46 6.11999 12.96 5.31999 12.36 5.00999C12.14 4.89999 11.89 4.89999 11.67 5.00999C11.06 5.30999 10.57 6.11999 10.57 6.79999V8.86999C10.57 9.04999 10.43 9.25999 10.27 9.32999L6.33002 11.03C5.89002 11.22 5.52002 11.78 5.52002 12.26V13.19C5.52002 13.79 5.97002 14.09 6.53002 13.85L9.88002 12.41C10.26 12.24 10.58 12.45 10.58 12.87V14.72C10.58 14.89 10.48 15.12 10.37 15.23L8.70002 16.87C8.53002 17.04 8.45002 17.38 8.53002 17.61L8.85002 18.57C8.99002 19 9.46002 19.2 9.86002 19Z" stroke="#ffffff" stroke-width="1.584" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#ffffff" stroke-width="1.584" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
    });
 
        renderUserInfo();
        setTimeout(function() {
  renderDeviceList();
}, 1000); 
    });
    
    
    // Главная функция для синхронизации user_devices
function syncUserDevices() {


  var suid = '';
  var hubConnection;
  
  // Функция для построения URL с необходимыми параметрами
  function account(url) {
    url = url + '';
    if (url.indexOf('account_email=') == -1) {
      var email = Lampa.Storage.get('account_email');
      if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
    }
    if (url.indexOf('uid=') == -1) {
      var uid = Lampa.Storage.get('lampac_unic_id', '');
      if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
    }
    return url;
  }

  var network = new Lampa.Reguest();

  // Получение uid пользователя
  network.silent(account('{localhost}/reqinfo'), function(j) {
    if (j.user_uid) {
      suid = j.user_uid;
    }
  });

  // Функция для экспорта данных
  function goExport(path) {
    var value = {};

    // Экспортируем только ключ user_devices
    if (path == 'sync_user_devices') {
      value.user_devices = localStorage.getItem('user_devices') || '';
    }

    $.ajax({
      url: account('{localhost}/storage/set?path=' + path),
      type: 'POST',
      data: JSON.stringify(value),
      async: true,
      cache: false,
      contentType: false,
      processData: false,
      success: function(j) {
        if (j.success && j.fileInfo) {
          localStorage.setItem('lampac_' + path, j.fileInfo.changeTime);

          if (hubConnection)
            hubConnection.invoke("events", suid, 'sync', path);
        }
      },
      error: function() {
        console.log('Lampac Storage', 'export', 'error');
      }
    });
  }

  // Функция для импорта данных
function goImport(path) {
  network.silent(account('{localhost}/storage/get?path=' + path), function(j) {
    if (j.success && j.fileInfo && j.data) {
      if (j.fileInfo.changeTime != Lampa.Storage.get('lampac_' + path, '0')) {
        var data = JSON.parse(j.data);
        
    
        for (var i in data) {
          Lampa.Storage.set(i, data[i], true);
        }
        localStorage.setItem('lampac_' + path, j.fileInfo.changeTime);
        
                //console.log("Updated Data:", data);


     
      }
    } else if (j.msg && j.msg == 'outFile') {
      goExport(path);
    }
  });
}

  // Синхронизация ключа user_devices
  goImport('sync_user_devices');

  Lampa.Storage.listener.follow('change', function(e) {
    if (e.name == 'user_devices') {
      goExport('sync_user_devices');
    }
  });

  // Подключение к сигналам
  function waitEvent() {
    hubConnection = new signalR.HubConnectionBuilder().withUrl('{localhost}/web-event').build();

    function tryConnect() {
      hubConnection.start().then(function() {
        hubConnection.invoke("Registry", suid);
        hubConnection.on("event", function(uid, name, data) {
          if (name === 'sync') {
            goImport(data);
          }
        });
        hubConnection.onclose(function() {
          waitEvent();
        });
      }).catch(function(err) {
        setTimeout(tryConnect, 5000);
      });
    }

    tryConnect();
  }

  if (typeof signalR == 'undefined') {
    Lampa.Utils.putScript(["{localhost}/signalr-6.0.25_es5.js"], function() {}, false, function() {
      waitEvent();
    }, true);
  } else waitEvent();
}



// Функция для отображения уведомления об оставшихся днях
function getDayWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) {
        return 'день';
    } else if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) {
        return 'дня';
    } else {
        return 'дней';
    }
}

function showSubscriptionDays() {
    // Проверяем, указана ли дата окончания подписки
    if (userInfo.userExpires) {
        // Преобразуем дату окончания подписки в объект Date
        var expirationDate = new Date(userInfo.userExpires);
        var currentDate = new Date();

        // Вычисляем разницу в миллисекундах и преобразуем в дни
        var timeDifference = expirationDate - currentDate;
        var remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Перевод миллисекунд в дни

        // Проверяем, остались ли дни
        if (remainingDays > 0) {
            // Определяем правильную форму слова "день"
            var dayWord = getDayWord(remainingDays);
            // Выводим уведомление
Lampa.Noty.show('Авиатор, твой запас кофе на ' + remainingDays + ' ' + dayWord + '.');
        } else {
            // Уведомление о завершении подписки
            Lampa.Noty.show('Кофе закончился! Пора пополнить запасы.');
        }
    } else {
        // Если дата подписки не указана
        Lampa.Noty.show('Дата окончания запаса кофе не указана. Проверьте настройки.');
    }
}



// Вызываем функцию при загрузке
                                            setTimeout(function() {
					  $('div[data-component=interface]').before($('div[data-component=account_menu]'))
					}, 130)
    setTimeout(devices, 5000);
    setTimeout(showSubscriptionDays, 9000);
        setTimeout(showSubscriptionDays, 10000);
    syncUserDevices();

})();
