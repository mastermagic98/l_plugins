(function() {
    'use strict';

    Lampa.Platform.tv();

    function ThemeManager() {
        function applyTheme() {
            var themeUrl = localStorage.getItem("selectedTheme");
            if (themeUrl) {
                $('head').append('<link rel="stylesheet" href="' + themeUrl + '">');
            }
        }

        function addToSettings() {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: 'my_themes',
                    type: 'static'
                },
                field: {
                    name: "Мої теми",
                    description: "Змінити оформлення додатка"
                },
                onRender: function(element) {
                    setTimeout(function() {
                        $(".settings-param > div:contains('Мої теми')").parent()
                            .insertAfter($("div[data-name='interface_size']"));

                        element.on("hover:enter", function() {
                            openGallery();
                        });
                    }, 50);
                }
            });
        }

        function openGallery() {
            var themeData = {
                url: "https://bylampa.github.io/themes/categories/stroke.json",
                title: "Focus Pack",
                component: "my_themes"
            };
            Lampa.Storage.set("themesCurrent", JSON.stringify(themeData));
            Lampa.Activity.push(themeData);
        }

        function ThemesComponent(data) {
            this.activity = data;
            this.request = new Lampa.Reguest();
            this.scroll = new Lampa.Scroll({mask: true, over: true, step: 200});
            this.cards = [];
            this.container = $('<div></div>');
            this.content = $('<div class="my_themes"></div>');
            this.info = null;
            this.focused = null;

            this.categories = [
                {title: "Focus Pack", url: "https://bylampa.github.io/themes/categories/stroke.json"},
                {title: "Color Gallery", url: "https://bylampa.github.io/themes/categories/color_gallery.json"},
                {title: "Gradient Style", url: "https://bylampa.github.io/themes/categories/gradient_style.json"}
            ];

            this.create = function() {
                var self = this;
                this.activity.loader(true);
                
                if (!this.activity.url) {
                    this.activity.url = this.categories[0].url;
                }
                
                this.request.silent(this.activity.url, function(response) {
                    try {
                        if (!response || !Array.isArray(response)) {
                            throw new Error('Invalid themes data');
                        }
                        self.build(response);
                    } catch (e) {
                        console.error('Error parsing themes:', e);
                        self.error();
                    }
                }, function(error) {
                    console.error('Error loading themes:', error);
                    self.error();
                });
                
                return this.render();
            };

            this.build = function(themes) {
                Lampa.Background.change('');
                this.createUI();
                this.addCards(themes);
                this.setupControls();
                this.activity.loader(false);
                this.activity.toggle();
            };

            this.createUI = function() {
                // Додаємо стилі для коректного відображення
                var styles = [
                    '<style>',
                    '.my_themes { padding: 0 2.5em; }',
                    '.my_themes .card--collection { width: 14.28% !important; margin-bottom: 1.5em; }',
                    '.my_themes .card__img { height: 10em !important; }',
                    '.view--category { padding: 0.5em 1em !important; font-size: 1em !important; }',
                    '@media (max-width: 800px) {',
                    '  .my_themes .card--collection { width: 20% !important; }',
                    '}',
                    '@media (max-width: 600px) {',
                    '  .my_themes .card--collection { width: 25% !important; }',
                    '}',
                    '@media (max-width: 400px) {',
                    '  .my_themes .card--collection { width: 33.33% !important; }',
                    '}',
                    '</style>'
                ].join('');

                Lampa.Template.add('theme_button', [
                    '<div id="theme_button">',
                    styles,
                    '<div class="selector view--category" style="margin: 0 1em;">',
                    '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M20 10H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM4 8h12c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2zm12 8H4c-1.1 0-2 .9-2 2s.9 2 2 2h12c1.1 0 2-.9 2-2s-.9-2-2-2z"></path></svg>',
                    '<span>Категорії</span>',
                    '</div>',
                    '</div>'
                ].join(''));

                Lampa.Template.add('theme_info', [
                    '<div class="info">',
                    '<div class="info__left">',
                    '<div class="info__title"></div>',
                    '</div>',
                    '<div class="info__right">',
                    '<div id="theme_filter"></div>',
                    '</div>',
                    '</div>'
                ].join(''));

                var button = Lampa.Template.get('theme_button');
                this.info = Lampa.Template.get('theme_info');
                this.info.find('#theme_filter').append(button);

                var self = this;
                button.find('.view--category').on('hover:enter', function() {
                    self.showCategories();
                });

                this.scroll.render().addClass('layer--wheight');
                this.container.append(this.info);
                this.container.append(this.scroll.render());
            };

            this.addCards = function(themes) {
                var self = this;
                
                themes.slice(0, 30).forEach(function(theme) {
                    if (!theme || !theme.css || !theme.logo) return;

                    var card = Lampa.Template.get('card', {
                        title: theme.title || 'Без назви',
                        release_year: ''
                    });

                    card.addClass('card--collection')
                        .find('.card__img').css({
                            cursor: 'pointer',
                            'background-color': '#353535a6',
                            'background-size': 'contain'
                        }).end()
                        .css({'text-align': 'center'});

                    var img = card.find('.card__img')[0];
                    img.onload = function() { card.addClass('card--loaded'); };
                    img.onerror = function() { img.src = './img/img_broken.svg'; };
                    img.src = theme.logo;

                    if (localStorage.getItem('selectedTheme') === theme.css) {
                        self.markAsInstalled(card);
                    }

                    card.on('hover:focus', function() {
                        self.focused = card[0];
                        self.scroll.update(card, true);
                        self.info.find('.info__title').text(theme.title || 'Без назви');
                    });

                    card.on('hover:enter', function() {
                        self.showOptions(theme, card);
                    });

                    self.content.append(card);
                    self.cards.push(card);
                });

                this.scroll.append(this.content);
                this.content.append('<div style="height: 10em;"></div>');
            };

            this.markAsInstalled = function(card) {
                card.find('.card__view').append(
                    $('<div class="card__quality">Установлена</div>').css({
                        position: 'absolute',
                        left: '5%',
                        bottom: '85%',
                        padding: '0.3em 0.6em',
                        background: '#ffe216',
                        color: '#000',
                        'font-size': '0.8em',
                        'border-radius': '0.3em',
                        'text-transform': 'uppercase',
                        'font-weight': 'bold'
                    })
                );
            };

            this.showOptions = function(theme, card) {
                var self = this;
                Lampa.Select.show({
                    title: theme.title || 'Тема',
                    items: [
                        {title: 'Установити'},
                        {title: 'Видалити'}
                    ],
                    onSelect: function(item) {
                        if (item.title === 'Установити') {
                            self.installTheme(theme, card);
                        } else {
                            self.removeTheme();
                        }
                    },
                    onBack: function() {
                        Lampa.Controller.toggle('content');
                    }
                });
            };

            this.installTheme = function(theme, card) {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                $('head').append('<link rel="stylesheet" href="' + theme.css + '">');

                localStorage.setItem('selectedTheme', theme.css);
                $('.card__quality').remove();
                this.markAsInstalled(card);

                Lampa.Controller.toggle('content');
            };

            this.removeTheme = function() {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                localStorage.removeItem('selectedTheme');
                $('.card__quality').remove();

                Lampa.Controller.toggle('content');
            };

            this.showCategories = function() {
                var self = this;
                Lampa.Select.show({
                    title: 'Категорії тем',
                    items: this.categories,
                    onSelect: function(category) {
                        Lampa.Activity.push({
                            url: category.url,
                            title: category.title,
                            component: 'my_themes'
                        });
                    },
                    onBack: function() {
                        Lampa.Controller.toggle('content');
                    }
                });
            };

            this.setupControls = function() {
                var self = this;
                Lampa.Controller.add('content', {
                    toggle: function() {
                        Lampa.Controller.collectionSet(self.scroll.render());
                        Lampa.Controller.collectionFocus(self.focused, self.scroll.render());
                    },
                    left: function() {
                        return Navigator.canmove('left') ? Navigator.move('left') : Lampa.Controller.toggle('menu');
                    },
                    right: function() {
                        return Navigator.canmove('right') ? Navigator.move('right') : self.showCategories();
                    },
                    up: function() {
                        if (Navigator.canmove('up')) {
                            Navigator.move('up');
                        } else if (!self.info.find('.view--category').hasClass('focus')) {
                            Lampa.Controller.collectionSet(self.info);
                            Navigator.move('right');
                        } else {
                            Lampa.Controller.toggle('head');
                        }
                    },
                    down: function() {
                        if (Navigator.canmove('down')) {
                            Navigator.move('down');
                        } else if (self.info.find('.view--category').hasClass('focus')) {
                            Lampa.Controller.toggle('content');
                        }
                    },
                    back: function() {
                        Lampa.Activity.backward();
                    }
                });
            };

            this.error = function() {
                var empty = new Lampa.Empty();
                this.container.append(empty.render());
                this.start = empty.start;
                this.activity.loader(false);
                this.activity.toggle();
            };

            this.start = function() {
                Lampa.Controller.toggle('content');
            };

            this.render = function() {
                return this.container;
            };

            this.pause = function() {};
            this.stop = function() {};
            this.destroy = function() {
                this.request.clear();
                this.scroll.destroy();
                this.container.remove();
                this.content.remove();
            };
        }

        function init() {
            applyTheme();
            addToSettings();
            Lampa.Component.add('my_themes', ThemesComponent);
            
            Lampa.Storage.listener.follow('change', function(e) {
                if (e.name === 'activity' && Lampa.Activity.active().component !== 'my_themes') {
                    $('#theme_button').remove();
                }
            });
        }

        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') init();
            });
        }
    }

    new ThemeManager();
})();
