(function() {
    'use strict';

    // Set platform to TV mode
    Lampa.Platform.tv();

    (function() {
        'use strict';

        function main() {
            // Check platform access
            if (Lampa.Manifest.origin !== 'bylampa') {
                Lampa.Noty.show('Ошибка доступа');
                return;
            }

            // Load saved theme from localStorage
            var savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme) {
                var themeLink = $('<link rel="stylesheet" href="' + savedTheme + '">');
                $('head').append(themeLink);
            }

            // Add settings parameter for themes
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'my_themes',
                    type: 'static'
                },
                field: {
                    name: 'Мои темы',
                    description: 'Измени палитру элементов приложения'
                },
                onRender: function(item) {
                    setTimeout(function() {
                        $('.settings-param > div:contains("Мои темы")').parent().insertAfter($('<div class="my_themes category-full"></div>'));
                        
                        item.on('hover:enter', function() {
                            setTimeout(function() {
                                if ($('.settings-folder').length || $('#stantion_filtr').length) {
                                    window.history.back();
                                }
                            }, 50);
                            
                            setTimeout(function() {
                                var currentThemes = Lampa.Storage.get('themesCurrent');
                                var params;
                                
                                if (currentThemes !== '') {
                                    params = JSON.parse(JSON.stringify(currentThemes));
                                } else {
                                    params = {
                                        url: 'https://bylampa.github.io/themes/categories/color_gallery.json',
                                        title: 'Focus Pack',
                                        component: 'my_themes',
                                        page: 1
                                    };
                                }
                                
                                Lampa.Activity.push(params);
                                Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                            }, 100);
                        });
                    }, 0);
                }
            });

            // Theme component constructor function
            function ThemeComponent(params) {
                var network = new Lampa.Reguest();
                var scroll = new Lampa.Scroll({
                    mask: true,
                    over: true,
                    step: 250
                });
                var items = [];
                var html = $('<div></div>');
                var body = $('<div class="my_themes category-full"></div>');
                var info, last, active;
                
                var categories = [
                    {title: 'Focus Pack', url: 'https://bylampa.github.io/themes/categories/color_gallery.json'},
                    {title: 'Color Gallery', url: 'https://bylampa.github.io/themes/categories/stroke.json'},
                    {title: 'Gradient Style', url: 'https://bylampa.github.io/themes/categories/gradient_style.json'}
                ];

                this.create = function() {
                    var self = this;
                    
                    this.activity.loader(true);
                    
                    network.silent(params.url, this.build.bind(this), function() {
                        var empty = new Lampa.Empty();
                        html.append(empty.render());
                        self.start = empty.start;
                        self.activity.loader(false);
                        self.activity.toggle();
                    });
                    
                    return this.render();
                };

                this.append = function(data) {
                    var self = this;
                    
                    data.forEach(function(element) {
                        var item = Lampa.Template.get('card', {
                            title: element.title,
                            release_year: ''
                        });
                        
                        item.addClass('card--collection');
                        item.find('.card__img').css({
                            cursor: 'pointer',
                            'background-color': '#353535a6'
                        });
                        item.css({'text-align': 'center'});
                        
                        var img = item.find('.card__img')[0];
                        
                        img.onload = function() {
                            item.addClass('card--loaded');
                        };
                        
                        img.onerror = function(e) {
                            img.src = './img/img_broken.svg';
                        };
                        
                        img.src = element.link;
                        
                        $('.info__title').remove();

                        // Function to add "Установлена" (Installed) label
                        function addInstalledLabel() {
                            var label = document.createElement('div');
                            label.innerText = 'Установлена';
                            label.classList.add('card__quality');
                            item.find('.card__img').append(label);
                            
                            $(label).css({
                                position: 'absolute',
                                left: '-3%',
                                bottom: '70%',
                                padding: '0.4em 0.4em',
                                background: '#ffe216',
                                color: '#000',
                                fontSize: '0.8em',
                                WebkitBorderRadius: '0.3em',
                                MozBorderRadius: '0.3em',
                                borderRadius: '0.3em',
                                textTransform: 'uppercase'
                            });
                        }

                        // Check if this theme is currently selected
                        var currentTheme = localStorage.getItem('selectedTheme');
                        if (currentTheme && element.css === currentTheme) {
                            addInstalledLabel();
                        }

                        item.on('hover:focus', function() {
                            last = item[0];
                            scroll.update(item, true);
                            info.find('.info__title').text(element.title);
                        });

                        var themeCSS = element.css;
                        
                        item.on('hover:enter', function(e) {
                            var controller = Lampa.Controller.enabled().name;
                            var actions = [];
                            
                            actions.push({title: 'Установить'});
                            actions.push({title: 'Удалить'});
                            
                            Lampa.Select.show({
                                title: '',
                                items: actions,
                                onBack: function() {
                                    Lampa.Controller.toggle('content');
                                },
                                onSelect: function(action) {
                                    if (action.title === 'Установить') {
                                        // Remove existing theme links
                                        $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                        
                                        // Add new theme
                                        var newThemeLink = $('<link rel="stylesheet" href="' + themeCSS + '">');
                                        $('head').append(newThemeLink);
                                        
                                        localStorage.setItem('selectedTheme', themeCSS);
                                        console.log('Тема установлена:', themeCSS);
                                        
                                        // Remove existing quality labels
                                        if ($('.card__quality').length > 0) {
                                            $('.card__quality').remove();
                                        }
                                        
                                        addInstalledLabel();
                                        
                                        // Handle background settings
                                        if (Lampa.Storage.get('background') === true) {
                                            var bg = Lampa.Storage.get('background');
                                            Lampa.Storage.set('myBackground', bg);
                                            Lampa.Storage.set('background', 'false');
                                        }
                                        
                                        // Handle glass style settings
                                        if (Lampa.Storage.get('glass_style') === true) {
                                            var glass = Lampa.Storage.get('glass_style');
                                            Lampa.Storage.set('myGlassStyle', glass);
                                            Lampa.Storage.set('glass_style', 'false');
                                        }
                                        
                                        // Handle black style settings
                                        if (Lampa.Storage.get('black_style') === true) {
                                            var black = Lampa.Storage.get('black_style');
                                            Lampa.Storage.set('myBlackStyle', black);
                                            Lampa.Storage.set('black_style', 'false');
                                        }
                                        
                                        Lampa.Controller.toggle('content');
                                        
                                    } else if (action.title === 'Удалить') {
                                        // Remove theme
                                        $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                        localStorage.removeItem('selectedTheme');
                                        $('.card__quality').remove();
                                        
                                        // Restore original settings
                                        if (localStorage.getItem('myBackground')) {
                                            Lampa.Storage.set('background', Lampa.Storage.get('myBackground'));
                                        }
                                        localStorage.removeItem('myBackground');
                                        
                                        if (localStorage.getItem('myGlassStyle')) {
                                            Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                                        }
                                        localStorage.removeItem('myGlassStyle');
                                        
                                        if (localStorage.getItem('myBlackStyle')) {
                                            Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                                        }
                                        localStorage.removeItem('myBlackStyle');
                                        
                                        Lampa.Controller.toggle('content');
                                    }
                                }
                            });
                        });
                        
                        body.append(item);
                        items.push(item);
                    });
                };

                this.build = function(data) {
                    var self = this;
                    
                    Lampa.Background.change('');
                    
                    // Add button category template with responsive CSS
                    Lampa.Template.add('button_category', 
                        '<div id="button_category">' +
                        '<style>' +
                        '@media screen and (max-width: 2560px) {.themes .card--collection {width: 14.2%!important;}.scroll__content {padding:1.5em 0!important;}.info {height:9em!important;}.info__title-original {font-size:1.2em;}}' +
                        '@media screen and (max-width: 385px) {.info__right {display:contents!important;}.themes .card--collection {width: 33.3%!important;}}' +
                        '@media screen and (max-width: 580px) {.info__right {display:contents!important;}.themes .card--collection {width: 25%!important;}}' +
                        '</style>' +
                        '<div class="full-start__button selector view--category">' +
                        '<svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                        '<g id="info"/>' +
                        '<g id="icons">' +
                        '<g id="menu">' +
                        '<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>' +
                        '<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>' +
                        '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>' +
                        '</g>' +
                        '</g>' +
                        '</svg>' +
                        ' <span>Категории тем</span>' +
                        '</div>' +
                        '</div>'
                    );
                    
                    // Add info template
                    Lampa.Template.add('info_tvtv', 
                        '<div class="info layer--width">' +
                        '<div class="info__left">' +
                        '<div class="info__title"></div>' +
                        '<div class="info__title-original"></div>' +
                        '<div class="info__create"></div>' +
                        '</div>' +
                        '<div class="info__right">' +
                        '<div id="stantion_filtr"></div>' +
                        '</div>' +
                        '</div>'
                    );
                    
                    var categoryButton = Lampa.Template.get('button_category');
                    info = Lampa.Template.get('info_tvtv');
                    
                    info.find('logo').append(categoryButton);
                    info.find('.view--category').on('hover:enter hover:click', function() {
                        self.selectGroup();
                    });
                    
                    scroll.render().addClass('layer--wheight').find('mheight', info);
                    html.append(info.append());
                    html.append(scroll.render());
                    
                    this.append(data);
                    scroll.append(body);
                    
                    var spacer = '<div id="spacer" style="height: 25em;"></div>';
                    $('.my_themes').append(spacer);
                    
                    this.activity.loader(false);
                    this.activity.toggle();
                };

                this.selectGroup = function() {
                    Lampa.Select.show({
                        title: 'Категории тем',
                        items: categories,
                        onSelect: function(item) {
                            Lampa.Activity.push({
                                url: item.url,
                                title: item.title,
                                component: 'my_themes',
                                page: 1
                            });
                            Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                        },
                        onBack: function() {
                            Lampa.Controller.toggle('content');
                        }
                    });
                };

                this.start = function() {
                    var self = this;
                    
                    Lampa.Controller.add('content', {
                        toggle: function() {
                            Lampa.Controller.collectionSet(scroll.render());
                            Lampa.Controller.collectionFocus(last || false, scroll.render());
                        },
                        left: function() {
                            if (Navigator.canmove('left')) {
                                Navigator.move('left');
                            } else {
                                Lampa.Controller.toggle('menu');
                            }
                        },
                        right: function() {
                            if (Navigator.canmove('right')) {
                                Navigator.move('right');
                            } else {
                                self.selectGroup();
                            }
                        },
                        up: function() {
                            if (Navigator.canmove('up')) {
                                Navigator.move('up');
                            } else {
                                if (!info.find('.view--category').hasClass('focus')) {
                                    Lampa.Controller.collectionSet(info);
                                    Navigator.move('right');
                                } else {
                                    Lampa.Controller.toggle('head');
                                }
                            }
                        },
                        down: function() {
                            if (Navigator.canmove('down')) {
                                Navigator.move('down');
                            } else if (info.find('.view--category').hasClass('focus')) {
                                Lampa.Controller.toggle('content');
                            }
                        },
                        back: function() {
                            Lampa.Activity.backward();
                        }
                    });
                    
                    Lampa.Controller.toggle('content');
                };

                this.pause = function() {};
                this.stop = function() {};
                
                this.render = function() {
                    return html;
                };

                this.destroy = function() {
                    network.clear();
                    scroll.destroy();
                    
                    if (info) info.remove();
                    
                    html.remove();
                    body.remove();
                    
                    network = null;
                    items = null;
                    html = null;
                    body = null;
                    info = null;
                };
            }

            // Register the component
            Lampa.Component.add('my_themes', ThemeComponent);

            // Listen for activity changes
            Lampa.Storage.listener.follow('change', function(e) {
                if (e.name === 'activity') {
                    if (Lampa.Activity.active().component !== 'my_themes') {
                        setTimeout(function() {
                            $('#button_category').remove();
                        }, 0);
                    }
                }
            });
        }

        // Initialize when ready
        if (window.appready) {
            main();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    main();
                }
            });
        }
    })();
})();
