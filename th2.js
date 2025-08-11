(function() {
    'use strict';

    Lampa.Platform.tv();
    
    function createThemePlugin() {
        function MyThemes(activity) {
            var self = this;
            var template = new Lampa.Template();
            var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
            var cards = [];
            var info = $('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"><div id="stantion_filtr"></div></div></div>');
            var content = $('<div class="my_themes category-full"></div>');
            var menu, active_card, button_category;
            
            var categories = [
                {title: 'Focus Pack', url: 'https://example.com/themes/categories/stroke.json'},
                {title: 'Color Gallery', url: 'https://example.com/themes/categories/color_gallery.json'}
            ];

            this.create = function() {
                this.activity.loader(true);
                template.load(activity.params.url, this.render.bind(this), function() {
                    var menu = new Lampa.Activity();
                    info.append(menu.render());
                    self.menu = menu.activity;
                    self.activity.loader(false);
                    self.activity.start();
                });
                return this.render();
            };

            this.append = function(items) {
                items.forEach(function(item) {
                    var card = Lampa.Card.get('empty', {title: item.title, release_year: ''});
                    card.addClass('card--collection');
                    card.css('card', {'cursor': 'pointer', 'background-color': '#353535a6'});
                    card.css({'text-align': 'center'});
                    
                    var img = card.find('.card__img')[0];
                    img.onload = function() {
                        card.addClass('card--loaded');
                    };
                    img.onerror = function(e) {
                        img.src = './img/img_broken.svg';
                    };
                    img.src = item.poster;
                    
                    function addQualityLabel() {
                        var quality = document.createElement('div');
                        quality.innerText = 'Установлена';
                        quality.classList.add('card__quality');
                        card.find('.card__head').append(quality);
                        $(quality).css({
                            'position': 'absolute',
                            'left': '70%',
                            'bottom': '-3%',
                            'padding': '0.4em 0.4em',
                            'background': '#000',
                            'color': '#ffe216',
                            'fontSize': '0.8em',
                            'borderRadius': '0.3em',
                            'textTransform': 'uppercase'
                        });
                    }

                    var selectedTheme = localStorage.getItem('selectedTheme');
                    if (selectedTheme && item.css === selectedTheme) addQualityLabel();

                    card.on('hover:focus', function() {
                        active_card = card[0];
                        scroll.focus(card, true);
                        menu.find('.info__title').text(item.title);
                    });

                    var theme_css = item.css;
                    card.on('hover:enter', function() {
                        var current = Lampa.Activity.current().activity;
                        var items = [];
                        items.push({title: 'Установить'});
                        items.push({title: 'Удалить'});
                        
                        Lampa.Menu.show({
                            title: '',
                            items: items,
                            onBack: function() {
                                Lampa.Activity.back('content');
                            },
                            onSelect: function(e) {
                                if (e.title == 'Установить') {
                                    $('.card__quality').remove();
                                    var style = $('<link rel="stylesheet" href="' + theme_css + '">');
                                    $('head').append(style);
                                    localStorage.setItem('selectedTheme', theme_css);
                                    console.log('Тема установлена:', theme_css);
                                    addQualityLabel();
                                    
                                    if (Lampa.Storage.get('myBackground') == true) {
                                        var bg = Lampa.Storage.get('background');
                                        Lampa.Storage.set('myBackground', bg);
                                        Lampa.Storage.set('background', 'false');
                                    }
                                    
                                    if (Lampa.Storage.get('glass_style') == true) {
                                        var glass = Lampa.Storage.get('glass_style');
                                        Lampa.Storage.set('myGlassStyle', glass);
                                        Lampa.Storage.set('glass_style', 'false');
                                    }
                                    
                                    if (Lampa.Storage.get('black_style') == true) {
                                        var black = Lampa.Storage.get('black_style');
                                        Lampa.Storage.set('myBlackStyle', black);
                                        Lampa.Storage.set('black_style', 'false');
                                    }
                                    
                                    Lampa.Activity.toggle('menu');
                                } 
                                else if (e.title == 'Удалить') {
                                    $('.card__quality').remove();
                                    localStorage.removeItem('selectedTheme');
                                    $('.card__quality').remove();
                                    
                                    if (localStorage.getItem('background')) {
                                        Lampa.Storage.set('myBackground', Lampa.Storage.get('background'));
                                    }
                                    localStorage.removeItem('background');
                                    
                                    if (localStorage.getItem('myGlassStyle')) {
                                        Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                                    }
                                    localStorage.removeItem('myGlassStyle');
                                    
                                    if (localStorage.getItem('myBlackStyle')) {
                                        Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                                    }
                                    localStorage.removeItem('myBlackStyle');
                                    
                                    Lampa.Activity.back('menu');
                                }
                            }
                        });
                    });
                    
                    content.append(card);
                    cards.push(card);
                });
            };

            this.render = function(items) {
                Lampa.Card.change('');
                Lampa.Card.add('empty', 'Empty');
                Lampa.Card.add('card', 'Template');
                
                var button_category = Lampa.Storage.get('button_category');
                menu = Lampa.Storage.get('info');
                menu.find('#stantion_filtr').append(button_category);
                menu.find('.view--category').on('hover:enter hover:click', function() {
                    self.selectGroup();
                });
                
                scroll.render().addClass('collectionFocus').css('mheight', menu);
                info.append(menu.append());
                info.append(scroll.render());
                this.append(items);
                scroll.append(content);
                this.activity.start(false);
                this.activity.start();
            };

            this.selectGroup = function() {
                Lampa.Menu.show({
                    title: 'Категории тем',
                    items: categories,
                    onSelect: function(e) {
                        Lampa.Activity.push({
                            url: e.url,
                            title: e.title,
                            component: 'my_themes',
                            page: 1
                        });
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.current()));
                    },
                    onBack: function() {
                        Lampa.Activity.back('menu');
                    }
                });
            };

            this.activity = function() {
                var self = this;
                Lampa.Controller.add('content', {
                    toggle: function() {
                        Lampa.Controller.collection(scroll.render());
                        Lampa.Controller.collectionSet(active_card || false, scroll.render());
                    },
                    left: function() {
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.back('left');
                    },
                    right: function() {
                        if (Navigator.canmove('right')) Navigator.move('right');
                        else self.selectGroup();
                    },
                    up: function() {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else {
                            if (!menu.find('.selector').hasClass('focus')) {
                                Lampa.Controller.collection(menu);
                                Navigator.move('right');
                            }
                            else Lampa.Controller.back('up');
                        }
                    },
                    down: function() {
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else if (menu.find('.selector').hasClass('focus')) {
                            Lampa.Controller.back('menu');
                        }
                    },
                    back: function() {
                        Lampa.Activity.back();
                    }
                });
                Lampa.Controller.back('content');
            };

            this.start = function() {};
            this.stop = function() {};
            this.render = function() { return info; };
            this.destroy = function() {
                template.destroy();
                scroll.destroy();
                if (menu) menu.remove();
                info.remove();
                content.remove();
                template = null;
                cards = null;
                info = null;
            };
        }

        Lampa.Component.add('my_themes', MyThemes);
        Lampa.Storage.listener.follow('change', function(e) {
            if (e.name == 'activity' && Lampa.Activity.current().activity.component !== 'my_themes') {
                $('#button_category').remove();
            }
        });
    }

    function initPlugin() {
        // Основний об'єкт плагіна
        var SafeStyle = {
            name: 'safe_style',
            version: '2.2.5',
            settings: {
                theme: 'custom_color',
                custom_color: '#c22222', // Початковий колір (Червоний)
                enabled: true, // Стан плагіна (увімкнено/вимкнено)
                button_styles_enabled: true // Стан управління стилями кнопок
            }
        };

        // Функція для застосування теми
        function applyTheme(theme, color) {
            // Видаляємо попередні стилі теми
            $('#interface_mod_theme').remove();

            // Якщо плагін відключений або вибрано "default", скидаємо стилі
            if (!SafeStyle.settings.enabled || theme === 'default') return;

            // Використовуємо переданий колір або збережений, якщо тема "custom_color"
            var selectedColor = (theme === 'custom_color') ? (color || SafeStyle.settings.custom_color || '#c22222') : '#c22222';

            // Функція для оновлення видимості параметра "Колір теми"
            function updateColorVisibility(theme) {
                var colorParam = $('div[data-name="safe_style_color"]');
                if (theme === 'custom_color') {
                    colorParam.addClass('visible');
                } else {
                    colorParam.removeClass('visible');
                }
            }

            // Додаємо параметри до компонента safe_style
            if (Lampa.SettingsApi) {
                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_theme',
                        type: 'select',
                        values: {
                            custom_color: 'Користувацька',
                            default: 'LAMPA'
                        },
                        default: 'custom_color'
                    },
                    field: {
                        name: 'Тема',
                        description: 'Виберіть тему для інтерфейсу'
                    },
                    onChange: function(value) {
                        SafeStyle.settings.theme = value;
                        Lampa.Storage.set('safe_style_theme', value);
                        Lampa.Settings.update();
                        applyTheme(value);
                        updateColorVisibility(value);
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_color',
                        type: 'select',
                        values: {
                            '#c22222': 'Червоний',
                            '#b0b0b0': 'Світло-сірий',
                            '#ffeb3b': 'Жовтий',
                            '#4d7cff': 'Синій',
                            '#a64dff': 'Пурпурний',
                            '#ff9f4d': 'Помаранчевий',
                            '#3da18d': 'М’ятний',
                            '#4caf50': 'Зелений',
                            '#ff69b4': 'Рожевий',
                            '#6a1b9a': 'Фіолетовий',
                            '#26a69a': 'Бірюзовий'
                        },
                        default: '#c22222'
                    },
                    field: {
                        name: 'Колір теми',
                        description: 'Виберіть колір для користувацької теми'
                    },
                    onChange: function(value) {
                        SafeStyle.settings.custom_color = value;
                        Lampa.Storage.set('safe_style_color', value);
                        Lampa.Settings.update();
                        if (SafeStyle.settings.theme === 'custom_color') {
                            applyTheme('custom_color', value);
                        }
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_button_styles_enabled',
                        type: 'toggle',
                        default: true
                    },
                    field: {
                        name: 'Увімкнути стилі кнопок',
                        description: 'Увімкнути або вимкнути управління стилями кнопок'
                    },
                    onChange: function(value) {
                        SafeStyle.settings.button_styles_enabled = value;
                        Lampa.Storage.set('safe_style_button_styles_enabled', value);
                        Lampa.Settings.update();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'safe_style',
                    param: {
                        name: 'safe_style_enabled',
                        type: 'toggle',
                        default: true
                    },
                    field: {
                        name: 'Увімкнути плагін',
                        description: 'Увімкнути або вимкнути плагін тем'
                    },
                    onChange: function(value) {
                        SafeStyle.settings.enabled = value;
                        Lampa.Storage.set('safe_style_enabled', value);
                        Lampa.Settings.update();
                        applyTheme(SafeStyle.settings.theme);
                    }
                });
            }

            // Ініціалізація видимості параметра "Колір теми" при відкритті налаштувань
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name === 'safe_style') {
                    updateColorVisibility(SafeStyle.settings.theme);
                }
            });
        }

        // Ініціалізація плагіна
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                // Завантажуємо збережені налаштування
                SafeStyle.settings.theme = Lampa.Storage.get('safe_style_theme', 'custom_color');
                SafeStyle.settings.custom_color = Lampa.Storage.get('safe_style_color', '#c22222');
                SafeStyle.settings.enabled = Lampa.Storage.get('safe_style_enabled', true);
                SafeStyle.settings.button_styles_enabled = Lampa.Storage.get('safe_style_button_styles_enabled', true);

                // Застосовуємо шаблони та стилі з затримкою
                setTimeout(function() {
                    if (Lampa.SettingsApi) {
                        createThemePlugin();
                        applyTheme(SafeStyle.settings.theme);
                    }
                }, 100);
            }
        });
    }

    window.appready ? initPlugin() : Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') initPlugin();
    });
})();
