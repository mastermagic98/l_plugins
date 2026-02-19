/**
 * Плагин для приложения Lampa
 * 
 * НАЗНАЧЕНИЕ:
 * Плагин предназначен для настройки порядка отображения и видимости кнопок 
 * на главном экране (Full Start) приложения Lampa.
 * 
 * ОСНОВНЫЕ ВОЗМОЖНОСТИ:
 * 1. Изменение порядка кнопок путем перетаскивания (с помощью кнопок вверх/вниз)
 * 2. Скрытие/отображение отдельных кнопок
 * 3. Изменение режима отображения (стандартный, только иконки, всегда с текстом)
 * 4. Редактирование названий кнопок (пользовательские подписи)
 * 5. Сохранение настроек в локальном хранилище
 * 6. Сброс к заводским настройкам
 * 
 * ОСОБЕННОСТИ:
 * - Стабильное сохранение порядка после перезапуска приложения
 * - Корректная идентификация кнопок по уникальным ID
 * - Кнопка редактирования (иконка карандаша) появляется в правой части панели
 * - Все изменения сохраняются автоматически
 * - Поддержка мультиязычности (русский, украинский, английский)
 * - Плавная анимация появления кнопок
 * 
 * @version 2.1
 * @author Разработчик
 * @license MIT
 */

(function() {
    'use strict';

    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order'];

    function t(key) {
        var translated = Lampa.Lang.translate(key);
        return translated && translated !== key ? translated : key.replace('custom_interface_plugin_', '');
    }

    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'], label: t('custom_interface_plugin_online') },
        { name: 'torrent', patterns: ['torrent'], label: t('custom_interface_plugin_torrent') },
        { name: 'trailer', patterns: ['trailer', 'rutube'], label: t('custom_interface_plugin_trailer') },
        { name: 'favorite', patterns: ['favorite'], label: t('custom_interface_plugin_favorite') },
        { name: 'subscribe', patterns: ['subscribe'], label: t('custom_interface_plugin_subscribe') },
        { name: 'book', patterns: ['book'], label: t('custom_interface_plugin_book') },
        { name: 'reaction', patterns: ['reaction'], label: t('custom_interface_plugin_reaction') }
    ];

    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;
    var buttonCustomNames = {};
    var buttonIdMap = {}; // Карта для сопоставления старых и новых ID кнопок

    Lampa.Lang.add({
        custom_interface_plugin_button_order: {
            uk: 'Порядок кнопок',
            ru: 'Порядок кнопок',
            en: 'Buttons order'
        },
        custom_interface_plugin_button_view: {
            uk: 'Вигляд кнопок',
            ru: 'Вид кнопок',
            en: 'Buttons view'
        },
        custom_interface_plugin_standard: {
            uk: 'Стандартний',
            ru: 'Стандартный',
            en: 'Default'
        },
        custom_interface_plugin_icons_only: {
            uk: 'Тільки іконки',
            ru: 'Только иконки',
            en: 'Icons only'
        },
        custom_interface_plugin_with_text: {
            uk: 'Завжди з текстом',
            ru: 'Всегда с текстом',
            en: 'Always text'
        },
        custom_interface_plugin_reset_default: {
            uk: 'Скинути за замовчуванням',
            ru: 'Сбросить по умолчанию',
            en: 'Reset to default'
        },
        custom_interface_plugin_button_editor: {
            uk: 'Редактор кнопок',
            ru: 'Редактор кнопок',
            en: 'Buttons editor'
        },
        custom_interface_plugin_options: {
            uk: 'Опції',
            ru: 'Опции',
            en: 'Options'
        },
        custom_interface_plugin_online: {
            uk: 'Онлайн',
            ru: 'Онлайн',
            en: 'Online'
        },
        custom_interface_plugin_torrent: {
            uk: 'Торренти',
            ru: 'Торренты',
            en: 'Torrents'
        },
        custom_interface_plugin_trailer: {
            uk: 'Трейлери',
            ru: 'Трейлеры',
            en: 'Trailers'
        },
        custom_interface_plugin_favorite: {
            uk: 'Обране',
            ru: 'Избранное',
            en: 'Favorites'
        },
        custom_interface_plugin_subscribe: {
            uk: 'Підписка',
            ru: 'Подписка',
            en: 'Subscriptions'
        },
        custom_interface_plugin_book: {
            uk: 'Закладки',
            ru: 'Закладки',
            en: 'Bookmarks'
        },
        custom_interface_plugin_reaction: {
            uk: 'Реакції',
            ru: 'Реакции',
            en: 'Reactions'
        },
        custom_interface_plugin_button_unknown: {
            uk: 'Кнопка',
            ru: 'Кнопка',
            en: 'Button'
        },
        custom_interface_plugin_edit_name: {
            uk: 'Редагувати назву',
            ru: 'Редактировать название',
            en: 'Edit name'
        },
        custom_interface_plugin_enter_name: {
            uk: 'Введіть назву кнопки',
            ru: 'Введите название кнопки',
            en: 'Enter button name'
        },
        custom_interface_plugin_save: {
            uk: 'Зберегти',
            ru: 'Сохранить',
            en: 'Save'
        },
        custom_interface_plugin_cancel: {
            uk: 'Скасувати',
            ru: 'Отмена',
            en: 'Cancel'
        }
    });

    function generateStableButtonId(button) {
        if (!button || !button.attr) return 'unknown_' + Math.random().toString(36).substr(2, 9);
        
        var classes = button.attr('class') || '';
        var text = button.find('span').text().trim();
        var subtitle = button.attr('data-subtitle') || '';
        var href = button.attr('href') || '';
        var dataAction = button.attr('data-action') || '';
        
        // Специальная обработка для кнопки Options (три точки)
        if (classes.indexOf('button--options') !== -1) {
            return 'button--options';
        }
        
        // Создаем стабильный ID на основе классов, текста и других атрибутов
        var significantClasses = classes.split(' ').filter(function(c) {
            return c.indexOf('view--') === 0 || 
                   c.indexOf('button--') === 0 || 
                   c.indexOf('online') !== -1 ||
                   c.indexOf('torrent') !== -1 ||
                   c.indexOf('trailer') !== -1 ||
                   c.indexOf('favorite') !== -1 ||
                   c.indexOf('subscribe') !== -1 ||
                   c.indexOf('book') !== -1 ||
                   c.indexOf('reaction') !== -1;
        }).sort().join('_');
        
        var idParts = [];
        if (significantClasses) idParts.push(significantClasses);
        if (text) idParts.push(text.replace(/\s+/g, '_').substring(0, 30));
        if (subtitle) idParts.push('sub_' + subtitle.replace(/\s+/g, '_').substring(0, 20));
        if (href) idParts.push('href_' + href.replace(/[^a-z0-9]/gi, '_').substring(0, 20));
        if (dataAction) idParts.push('act_' + dataAction);
        
        var id = idParts.join('_');
        if (!id) id = 'button_' + Math.random().toString(36).substr(2, 9);
        
        return id;
    }

    function findButtonByStableId(buttons, stableId) {
        if (!buttons || !Array.isArray(buttons)) return null;
        
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            if (!btn) continue;
            
            var btnStableId = generateStableButtonId(btn);
            if (btnStableId === stableId) {
                return btn;
            }
        }
        return null;
    }

    function findButton(btnId) {
        // Сначала ищем в оригинальных кнопках
        var btn = allButtonsOriginal.find(function(b) { 
            return b && generateStableButtonId(b) === btnId; 
        });
        
        if (!btn) {
            // Затем в кэше
            btn = allButtonsCache.find(function(b) { 
                return b && generateStableButtonId(b) === btnId; 
            });
        }
        
        // Если не нашли, пробуем найти по карте ID
        if (!btn && buttonIdMap[btnId]) {
            btn = buttonIdMap[btnId];
        }
        
        return btn || null;
    }

    function getCustomOrder() {
        return Lampa.Storage.get('button_custom_order', []) || [];
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order || []);
    }

    function getHiddenButtons() {
        return Lampa.Storage.get('button_hidden', []) || [];
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set('button_hidden', hidden || []);
    }

    function getCustomNames() {
        return Lampa.Storage.get('button_custom_names', {}) || {};
    }

    function setCustomNames(names) {
        Lampa.Storage.set('button_custom_names', names || {});
    }

    function getButtonId(button) {
        return generateStableButtonId(button);
    }

    function getButtonType(button) {
        if (!button) return 'other';
        var classes = button.attr('class') || '';
        for (var i = 0; i < DEFAULT_GROUPS.length; i++) {
            var group = DEFAULT_GROUPS[i];
            for (var j = 0; j < group.patterns.length; j++) {
                if (classes.indexOf(group.patterns[j]) !== -1) {
                    return group.name;
                }
            }
        }
        return 'other';
    }

    function isExcluded(button) {
        if (!button) return true;
        var classes = button.attr('class') || '';
        for (var i = 0; i < EXCLUDED_CLASSES.length; i++) {
            if (classes.indexOf(EXCLUDED_CLASSES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function categorizeButtons(container) {
        if (!container || !container.find) return { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], other: [] };
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--play');
        var categories = { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], other: [] };
        
        buttonCustomNames = getCustomNames();
        buttonIdMap = {}; // Сбрасываем карту ID
        
        allButtons.each(function() {
            var $btn = $(this);
            if (isExcluded($btn)) return;
            
            var type = getButtonType($btn);
            var btnId = getButtonId($btn);
            
            // Сохраняем в карту ID
            buttonIdMap[btnId] = $btn;
            
            // Добавляем текст "Опции" к кнопке с тремя точками
            if ($btn.hasClass('button--options') && $btn.find('span').length === 0) {
                $btn.append('<span>' + t('custom_interface_plugin_options') + '</span>');
            }
            
            // Применяем пользовательское название, если оно существует
            if (buttonCustomNames[btnId]) {
                var span = $btn.find('span');
                if (span.length) {
                    span.text(buttonCustomNames[btnId]);
                }
            }
            
            if (categories[type]) {
                categories[type].push($btn);
            } else {
                categories.other.push($btn);
            }
        });
        
        return categories;
    }

    function sortByCustomOrder(buttons) {
        if (!buttons || !Array.isArray(buttons)) return [];
        var customOrder = getCustomOrder();
        
        if (!customOrder || !customOrder.length) {
            // Сортируем по группам по умолчанию
            buttons.sort(function(a, b) {
                var typeOrder = ['online', 'torrent', 'trailer', 'favorite', 'subscribe', 'book', 'reaction', 'other'];
                var typeA = getButtonType(a);
                var typeB = getButtonType(b);
                var indexA = typeOrder.indexOf(typeA);
                var indexB = typeOrder.indexOf(typeB);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
            return buttons;
        }
        
        var sorted = [];
        var remaining = buttons.slice();
        var processedIds = [];
        
        // Сначала добавляем кнопки в порядке из сохраненного списка
        customOrder.forEach(function(stableId) {
            var foundIndex = -1;
            for (var i = 0; i < remaining.length; i++) {
                var btn = remaining[i];
                if (!btn) continue;
                
                var btnId = getButtonId(btn);
                if (btnId === stableId || (buttonIdMap[stableId] && buttonIdMap[stableId] === btn)) {
                    foundIndex = i;
                    break;
                }
            }
            
            if (foundIndex !== -1) {
                sorted.push(remaining[foundIndex]);
                processedIds.push(stableId);
                remaining.splice(foundIndex, 1);
            }
        });
        
        // Добавляем оставшиеся кнопки, которых нет в сохраненном порядке
        return sorted.concat(remaining);
    }

    function applyHiddenButtons(buttons) {
        if (!buttons) return;
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            if (btn) {
                var id = getButtonId(btn);
                var isHidden = hidden.some(function(hiddenId) {
                    return hiddenId === id || (buttonIdMap[hiddenId] && buttonIdMap[hiddenId] === btn);
                });
                btn.toggleClass('hidden', isHidden);
            }
        });
    }

    function applyButtonAnimation(buttons) {
        if (!buttons) return;
        buttons.forEach(function(btn, index) {
            if (btn) {
                btn.css({
                    'opacity': '0',
                    'animation': 'button-fade-in 0.4s ease forwards',
                    'animation-delay': (index * 0.08) + 's'
                });
            }
        });
    }

    function createEditButton() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() {
            openEditDialog();
        });
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        }
        return btn;
    }

    function saveOrder() {
        var order = [];
        if (currentButtons) {
            currentButtons.forEach(function(btn) {
                if (btn) order.push(getButtonId(btn));
            });
        }
        setCustomOrder(order);
    }

    function applyChanges() {
        if (!currentContainer) return;
        var categories = categorizeButtons(currentContainer);
        var allButtons = []
            .concat(categories.online || [])
            .concat(categories.torrent || [])
            .concat(categories.trailer || [])
            .concat(categories.favorite || [])
            .concat(categories.subscribe || [])
            .concat(categories.book || [])
            .concat(categories.reaction || [])
            .concat(categories.other || []);
        
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        currentButtons = allButtons;
        
        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer || !targetContainer.length) return;
        
        targetContainer.find('.full-start__button').not('.button--edit-order').detach();
        
        var visibleButtons = [];
        currentButtons.forEach(function(btn) {
            if (btn) {
                targetContainer.append(btn);
                if (!btn.hasClass('hidden')) visibleButtons.push(btn);
            }
        });
        
        applyButtonAnimation(visibleButtons);
        
        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }
        
        applyHiddenButtons(currentButtons);
        
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        
        saveOrder();
        
        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
        }, 100);
    }

    function capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getButtonDisplayName(btn, allButtons) {
        if (!btn) return '';
        
        var btnId = getButtonId(btn);
        var customNames = getCustomNames();
        
        // Если есть пользовательское название, возвращаем его
        if (customNames[btnId]) {
            return customNames[btnId];
        }
        
        var text = btn.find('span').text().trim();
        var classes = btn.attr('class') || '';
        var subtitle = btn.attr('data-subtitle') || '';
        
        // Если это кнопка Options — возвращаем переведенный текст
        if (classes.indexOf('button--options') !== -1) {
            return t('custom_interface_plugin_options');
        }
        
        if (!text) {
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; });
            if (viewClass) {
                text = viewClass.replace('view--', '').replace('button--', '').replace(/_/g, ' ');
                text = capitalize(text);
            } else {
                text = t('custom_interface_plugin_button_unknown');
            }
            return text;
        }
        
        var sameTextCount = 0;
        if (allButtons) {
            allButtons.forEach(function(otherBtn) {
                if (otherBtn && otherBtn.find('span').text().trim() === text) {
                    sameTextCount++;
                }
            });
        }
        
        if (sameTextCount > 1) {
            if (subtitle) {
                return text + ' <span style="opacity:0.5">(' + subtitle.substring(0, 30) + ')</span>';
            }
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0; });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalize(identifier);
                return text + ' <span style="opacity:0.5">(' + identifier + ')</span>';
            }
        }
        return text;
    }

    function openEditNameDialog(btn, btnId, currentName, callback) {
        var content = $('<div style="padding: 20px;">' +
            '<input type="text" class="selector" value="' + currentName.replace(/"/g, '&quot;') + '" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 5px;">' +
            '<div style="display: flex; justify-content: space-between; margin-top: 20px;">' +
            '<div class="selector" style="padding: 10px 20px; background: rgba(255,255,255,0.2); border-radius: 5px;" data-action="save">' + t('custom_interface_plugin_save') + '</div>' +
            '<div class="selector" style="padding: 10px 20px; background: rgba(255,255,255,0.1); border-radius: 5px;" data-action="cancel">' + t('custom_interface_plugin_cancel') + '</div>' +
            '</div>' +
            '</div>');
        
        var input = content.find('input');
        
        content.find('[data-action="save"]').on('hover:enter', function() {
            var newName = input.val().trim();
            if (newName) {
                callback(newName);
            }
            Lampa.Modal.close();
        });
        
        content.find('[data-action="cancel"]').on('hover:enter', function() {
            Lampa.Modal.close();
        });
        
        Lampa.Modal.open({
            title: t('custom_interface_plugin_edit_name'),
            html: content,
            size: 'small'
        });
        
        setTimeout(function() {
            input.focus();
        }, 100);
    }

    function openEditDialog() {
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allButtons = []
                .concat(categories.online || [])
                .concat(categories.torrent || [])
                .concat(categories.trailer || [])
                .concat(categories.favorite || [])
                .concat(categories.subscribe || [])
                .concat(categories.book || [])
                .concat(categories.reaction || [])
                .concat(categories.other || []);
            allButtons = sortByCustomOrder(allButtons);
            allButtonsCache = allButtons;
            currentButtons = allButtons;
        }
        
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var customNames = getCustomNames();
        var modes = ['default', 'icons', 'always'];
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');

        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div style="text-align: center; padding: 1em;">' + t('custom_interface_plugin_button_view') + ': ' + 
            (currentMode === 'default' ? t('custom_interface_plugin_standard') :
             currentMode === 'icons' ? t('custom_interface_plugin_icons_only') :
             t('custom_interface_plugin_with_text')) + '</div>' +
            '</div>');
        modeBtn.on('hover:enter', function() {
            var idx = modes.indexOf(currentMode);
            idx = (idx + 1) % modes.length;
            currentMode = modes[idx];
            Lampa.Storage.set('buttons_viewmode', currentMode);
            $(this).find('div').text(t('custom_interface_plugin_button_view') + ': ' + 
                (currentMode === 'default' ? t('custom_interface_plugin_standard') :
                 currentMode === 'icons' ? t('custom_interface_plugin_icons_only') :
                 t('custom_interface_plugin_with_text')));
            if (currentContainer) {
                var target = currentContainer.find('.full-start-new__buttons');
                if (target.length) {
                    target.removeClass('icons-only always-text');
                    if (currentMode === 'icons') target.addClass('icons-only');
                    if (currentMode === 'always') target.addClass('always-text');
                }
            }
        });
        list.append(modeBtn);

        function createButtonItem(btn) {
            if (!btn) return $();
            var displayName = getButtonDisplayName(btn, currentButtons);
            var icon = btn.find('svg').clone();
            var btnId = getButtonId(btn);
            var isHidden = hidden.some(function(hiddenId) {
                return hiddenId === btnId || (buttonIdMap[hiddenId] && buttonIdMap[hiddenId] === btn);
            });
            
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__edit selector" style="margin-left: auto; padding: 0 10px;">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M17 3L21 7L7 21H3V17L17 3Z"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-up selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-down selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__toggle toggle selector">' +
                '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '</div>');
            
            item.toggleClass('menu-edit-list__item-hidden', isHidden);
            item.find('.menu-edit-list__icon').append(icon);
            item.data('button', btn);
            item.data('buttonId', btnId);
            
            // Кнопка редактирования названия
            item.find('.menu-edit-list__edit').on('hover:enter', function() {
                var currentName = customNames[btnId] || btn.find('span').text().trim() || t('custom_interface_plugin_button_unknown');
                openEditNameDialog(btn, btnId, currentName, function(newName) {
                    customNames = getCustomNames();
                    customNames[btnId] = newName;
                    setCustomNames(customNames);
                    
                    // Обновляем отображение названия в списке
                    item.find('.menu-edit-list__title').html(newName);
                    
                    // Обновляем текст кнопки
                    var span = btn.find('span');
                    if (span.length) {
                        span.text(newName);
                    }
                });
            });
            
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && prev.hasClass('viewmode-switch')) {
                    prev = prev.prev();
                }
                if (prev.length && !prev.hasClass('viewmode-switch')) {
                    item.insertBefore(prev);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex > 0) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex - 1, 0, btn);
                    }
                    saveOrder();
                }
            });
            
            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && next.hasClass('folder-reset-button')) {
                    next = next.next();
                }
                if (next.length && !next.hasClass('folder-reset-button')) {
                    item.insertAfter(next);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex < currentButtons.length - 1) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex + 1, 0, btn);
                    }
                    saveOrder();
                }
            });
            
            item.find('.toggle').on('hover:enter', function() {
                var isNowHidden = !item.hasClass('menu-edit-list__item-hidden');
                item.toggleClass('menu-edit-list__item-hidden', isNowHidden);
                btn.toggleClass('hidden', isNowHidden);
                item.find('.dot').attr('opacity', isNowHidden ? '0' : '1');
                
                var hiddenList = getHiddenButtons();
                var index = hiddenList.indexOf(btnId);
                if (isNowHidden && index === -1) {
                    hiddenList.push(btnId);
                } else if (!isNowHidden && index !== -1) {
                    hiddenList.splice(index, 1);
                }
                setHiddenButtons(hiddenList);
            });
            
            return item;
        }

        if (currentButtons) {
            currentButtons.forEach(function(btn) {
                list.append(createButtonItem(btn));
            });
        }

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">' + t('custom_interface_plugin_reset_default') + '</div>' +
            '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('buttons_viewmode', 'default');
            Lampa.Storage.set('button_custom_names', {});
            Lampa.Modal.close();
            setTimeout(function() {
                if (currentContainer) {
                    reorderButtons(currentContainer);
                    refreshController();
                }
            }, 100);
        });
        list.append(resetBtn);

        Lampa.Modal.open({
            title: t('custom_interface_plugin_button_order'),
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                applyChanges();
                if (Lampa.Controller) Lampa.Controller.toggle('full_start');
            }
        });
    }

    function reorderButtons(container) {
        if (!container) return false;
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;
        
        currentContainer = container;
        container.find('.button--play, .button--edit-order').remove();
        
        var categories = categorizeButtons(container);
        var allButtons = []
            .concat(categories.online || [])
            .concat(categories.torrent || [])
            .concat(categories.trailer || [])
            .concat(categories.favorite || [])
            .concat(categories.subscribe || [])
            .concat(categories.book || [])
            .concat(categories.reaction || [])
            .concat(categories.other || []);
        
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                if (btn) allButtonsOriginal.push(btn.clone(true, true));
            });
        }
        
        currentButtons = allButtons;
        targetContainer.children().detach();
        
        var visibleButtons = [];
        currentButtons.forEach(function(btn) {
            if (btn) {
                targetContainer.append(btn);
                if (!btn.hasClass('hidden')) visibleButtons.push(btn);
            }
        });
        
        var editButton = createEditButton();
        targetContainer.append(editButton);
        visibleButtons.push(editButton);
        
        applyHiddenButtons(currentButtons);
        
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        
        applyButtonAnimation(visibleButtons);
        
        // Сохраняем порядок после применения
        saveOrder();
        
        setTimeout(function() {
            setupButtonNavigation(container);
        }, 100);
        
        return true;
    }

    function setupButtonNavigation(container) {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try {
                Lampa.Controller.toggle('full_start');
            } catch (e) {}
        }
    }

    function refreshController() {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            setTimeout(function() {
                try {
                    Lampa.Controller.toggle('full_start');
                    if (currentContainer) {
                        setTimeout(function() {
                            setupButtonNavigation(currentContainer);
                        }, 100);
                    }
                } catch (e) {}
            }, 50);
        }
    }

    function init() {
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.full-start-new__buttons { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 0.5em !important; }' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.folder-reset-button { background: rgba(255, 255, 255, 0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-reset-button.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__toggle.focus, .menu-edit-list__edit.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { background: rgba(255, 255, 255, 0.3); margin: 0.5em 0 1em 0; border-radius: 0.3em; }' +
            '.viewmode-switch.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.5; }' +
            '.menu-edit-list__edit { padding: 0 10px; cursor: pointer; display: flex; align-items: center; }' +
            '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            var container = e.object && e.object.activity ? e.object.activity.render() : null;
            if (!container) return;
            
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }
            
            setTimeout(function() {
                try {
                    if (!container.data('buttons-processed')) {
                        container.data('buttons-processed', true);
                        if (reorderButtons(container)) {
                            if (targetContainer.length) {
                                targetContainer.removeClass('buttons-loading');
                            }
                            refreshController();
                        }
                    }
                } catch (err) {
                    console.error('Buttons editor plugin error:', err);
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, 400);
        });
    }

    if (Lampa.SettingsApi) {
        try {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'buttons_editor_enabled', type: 'trigger', default: true },
                field: { name: t('custom_interface_plugin_button_editor') },
                onChange: function(value) {
                    setTimeout(function() {
                        var currentValue = Lampa.Storage.get('buttons_editor_enabled', true);
                        if (currentValue) {
                            $('.button--edit-order').show();
                        } else {
                            $('.button--edit-order').hide();
                        }
                    }, 100);
                },
                onRender: function(element) {
                    setTimeout(function() {
                        var sizeEl = $('div[data-name="interface_size"]');
                        if (sizeEl.length) sizeEl.after(element);
                    }, 0);
                }
            });
        } catch (e) {
            console.error('SettingsApi error:', e);
        }
    }

    try {
        init();
    } catch (e) {
        console.error('Plugin init error:', e);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();