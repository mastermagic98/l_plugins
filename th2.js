(function() {
    'use strict';

    Lampa.Platform.tv();

    function initPlugin() {
        // Перевіряємо чи вже завантажена тема
        var selectedTheme = localStorage.getItem('selectedTheme');
        if(selectedTheme){
            var themeElement = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeElement);
        }

        // Створюємо групу параметрів для налаштувань
        Lampa.SettingsApi.addParam({
            'component': 'interface',
            'group': 'my_themes',
            'param': {
                'name': 'my_themes_button',
                'type': 'button'
            },
            'field': {
                'name': 'Мої теми',
                'description': 'Змінити кольорову схему інтерфейсу'
            },
            'onRender': function(element){
                // Переміщуємо наш елемент після розділу "Інтерфейс"
                setTimeout(function(){
                    $('.settings-param > div:contains("Мої теми")').parent().insertAfter($('div[data-name="interface_size"]'));
                    
                    // Обробка кліків
                    element.on('hover:enter hover:click', function(){
                        setTimeout(function(){
                            // Закриваємо якщо вже відкрито
                            if($('#button_category').length || $('.my_themes').length) {
                                window.history.back();
                                return;
                            }
                            
                            // Завантажуємо теми
                            var themesCurrent = Lampa.Storage.get('themesCurrent');
                            var data = themesCurrent !== '' 
                                ? JSON.parse(themesCurrent)
                                : {
                                    'url': 'https://bylampa.github.io/themes/categories/stroke.json',
                                    'title': 'Focus Pack',
                                    'component': 'ThemesComponent',
                                    'page': 1
                                };
                            
                            Lampa.Collection.show(data);
                            Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Collection.get()));
                        }, 100);
                    });
                }, 300); // Затримка для гарантованого відображення
            }
        });

        // Основний компонент для відображення тем
        function ThemesComponent(params) {
            var scroll = new Lampa.Scroll(),
                navigator = new Lampa.Navigator({
                    mask: true,
                    over: true,
                    step: 250
                }),
                cards = [],
                container = $('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"><div id="stantion_filtr"></div></div></div>'),
                content = $('<div class="my_themes category-full"></div>'),
                info_title,
                button_category,
                categories = [
                    {
                        'title': 'Focus Pack',
                        'url': 'https://bylampa.github.io/themes/categories/stroke.json'
                    },
                    {
                        'title': 'Color Gallery',
                        'url': 'https://bylampa.github.io/themes/categories/color_gallery.json'
                    }
                ];

            // Ініціалізація компоненту
            this.create = function() {
                this.activity.show(true);
                scroll.render(params.target, this.render.bind(this), function() {
                    var activity = new Lampa.Activity();
                    container.append(activity.render());
                    this.activity = activity.activity;
                    this.activity.loader(false);
                    this.activity.show();
                }.bind(this));
                return this.render();
            };

            // Додавання карток тем
            this.append = function(items) {
                var self = this;
                items.forEach(function(item) {
                    var card = Lampa.Template.get('card', {
                        title: item.title,
                        release_year: ''
                    });
                    
                    card.addClass('card--collection');
                    card.find('.card__img').css({
                        cursor: 'pointer',
                        'background-color': '#353535a6'
                    });
                    card.css({'text-align': 'center'});
                    
                    var img = card.find('.card__img')[0];
                    img.onload = function() {
                        card.addClass('card--loaded');
                    };
                    img.onerror = function() {
                        img.src = './img/img_broken.svg';
                    };
                    img.src = item.poster;
                    
                    // Додаємо мітку "Встановлено" для поточної теми
                    function addQuality() {
                        var quality = document.createElement('div');
                        quality.innerText = 'Встановлено';
                        quality.classList.add('card__quality');
                        card.find('.card__img').append(quality);
                        $(quality).css({
                            position: 'absolute',
                            left: '70%',
                            bottom: '-3%',
                            padding: '0.4em 0.4em',
                            background: '#ffe216',
                            color: '#000',
                            fontSize: '0.8em',
                            borderRadius: '0.3em',
                            textTransform: 'uppercase'
                        });
                    }
                    
                    // Перевіряємо чи це поточна тема
                    var currentTheme = localStorage.getItem('selectedTheme');
                    if(currentTheme && item.css === currentTheme) {
                        addQuality();
                    }
                    
                    // Обробка фокусу
                    card.on('hover:focus', function() {
                        button_category = card[0];
                        navigator.focus(card, true);
                        info_title.find('.info__title').text(item.title);
                    });
                    
                    // Обробка вибору теми
                    card.on('hover:enter hover:click', function() {
                        var menuItems = [
                            {'title': 'Встановити'},
                            {'title': 'Видалити'}
                        ];
                        
                        Lampa.Menu.show({
                            title: '',
                            items: menuItems,
                            onBack: function() {
                                Lampa.Controller.show('content');
                            },
                            onSelect: function(select) {
                                if(select.title == 'Встановити') {
                                    // Встановлюємо нову тему
                                    $('.card__quality').remove();
                                    var theme = $('<link rel="stylesheet" href="' + item.css + '">');
                                    $('head').append(theme);
                                    localStorage.setItem('selectedTheme', item.css);
                                    
                                    addQuality();
                                    
                                    // Скидаємо інші стилі
                                    ['background', 'glass_style', 'black_style'].forEach(function(style) {
                                        if(Lampa.Storage.get(style) == true) {
                                            var value = Lampa.Storage.get('my' + style.charAt(0).toUpperCase() + style.slice(1));
                                            Lampa.Storage.set(style, value);
                                            Lampa.Storage.set(style, 'false');
                                        }
                                    });
                                    
                                    Lampa.Controller.toggle('menu');
                                }
                                else if(select.title == 'Видалити') {
                                    // Видаляємо тему
                                    $('.card__quality').remove();
                                    localStorage.removeItem('selectedTheme');
                                    
                                    // Відновлюємо стандартні стилі
                                    ['Background', 'GlassStyle', 'BlackStyle'].forEach(function(style) {
                                        var key = 'my' + style;
                                        if(localStorage.getItem(key)) {
                                            Lampa.Storage.set(style.toLowerCase(), Lampa.Storage.get(key));
                                            localStorage.removeItem(key);
                                        }
                                    });
                                    
                                    Lampa.Controller.show('content');
                                }
                            }
                        });
                    });
                    
                    content.append(card);
                    cards.push(card);
                });
            };

            // Відображення компоненту
            this.render = function(data) {
                var self = this;
                
                // Ініціалізація шаблонів
                Lampa.Template.change('', 'ThemesComponent');
                Lampa.Template.add('button_category', 
                    '<div id="button_category">' +
                    '<div class="full-start__button selector view--category">' +
                    '<svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>' +
                    '<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>' +
                    '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>' +
                    '</svg> <span>Категорії тем</span></div></div>'
                );
                Lampa.Template.add('info_tvtv', '<div></div>');
                
                // Створюємо кнопку категорій
                button_category = Lampa.Template.get('button_category');
                info_title = Lampa.Template.get('info_tvtv');
                info_title.find('#stantion_filtr').append(button_category);
                
                // Обробка кліку на кнопку категорій
                info_title.find('.view--category').on('hover:enter hover:click', function() {
                    self.selectGroup();
                });
                
                // Додаємо елементи на сторінку
                navigator.render().addClass('collectionFocus').insertAfter('layer--wheight', info_title);
                container.append(info_title.append());
                container.append(navigator.render());
                
                // Завантажуємо теми
                this.append(data);
                navigator.append(content);
                
                this.activity.show(false);
                this.activity.show();
            };

            // Вибір категорії тем
            this.selectGroup = function() {
                Lampa.Menu.show({
                    title: 'Категорії тем',
                    items: categories,
                    onSelect: function(select) {
                        Lampa.Collection.show({
                            url: select.url,
                            title: select.title,
                            component: 'ThemesComponent',
                            page: 1
                        });
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Collection.get()));
                    },
                    onBack: function() {
                        Lampa.Controller.show('menu');
                    }
                });
            };

            // Управління активністю
            this.activity = function() {
                var self = this;
                
                Lampa.Controller.add('content', {
                    toggle: function() {
                        Lampa.Controller.collection(navigator.render());
                        Lampa.Controller.toggle(button_category || false, navigator.render());
                    },
                    left: function() {
                        if(Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.show('menu');
                    },
                    right: function() {
                        if(Navigator.canmove('right')) Navigator.move('right');
                        else self.selectGroup();
                    },
                    up: function() {
                        if(Navigator.canmove('up')) {
                            Navigator.move('up');
                        }
                        else {
                            if(!info_title.find('.view--category').hasClass('active')) {
                                Lampa.Controller.collection(info_title);
                                Navigator.move('right');
                            }
                            else {
                                Lampa.Controller.show('head');
                            }
                        }
                    },
                    down: function() {
                        if(Navigator.canmove('down')) {
                            Navigator.move('down');
                        }
                        else if(info_title.find('.view--category').hasClass('active')) {
                            Lampa.Controller.show('menu');
                        }
                    },
                    back: function() {
                        Lampa.Collection.back();
                    }
                });
                
                Lampa.Controller.show('content');
            };

            this.start = function() {};
            this.stop = function() {};
            this.render = function() { return container; };
            
            // Очищення компоненту
            this.destroy = function() {
                scroll.destroy();
                navigator.destroy();
                if(info_title) info_title.remove();
                container.remove();
                content.remove();
                scroll = null;
                cards = null;
                container = null;
                content = null;
                info_title = null;
            };
        }

        // Реєстрація компоненту
        Lampa.Component.add('ThemesComponent', ThemesComponent);
        
        // Слідкуємо за змінами активності
        Lampa.Storage.listener.add('activity', function(data) {
            if(data.name == 'activity' && Lampa.Activity.get().component !== 'ThemesComponent') {
                $('#button_category').remove();
            }
        });
    }

    // Запускаємо плагін після завантаження додатка
    if(window.appready) {
        initPlugin();
    }
    else {
        Lampa.Listener.add('app', function(data) {
            if(data.type == 'ready') {
                initPlugin();
            }
        });
    }
})();
