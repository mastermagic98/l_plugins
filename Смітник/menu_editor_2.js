/**
 * Multifunctional Lampa Plugin (mlp)
 *
 * ОСНОВНОЕ НАЗНАЧЕНИЕ:
 * Гибкая настройка пользовательского интерфейса медиацентра Lampa:
 * - Скрытие и восстановление пунктов главного меню и разделов настроек
 * - Управление элементами шапки (поиск, настройки, профиль и др.)
 * - Добавление дополнительных кнопок в шапку: Перезагрузка, Консоль, Выход
 * - Настройка карточки фильма: отображение всех кнопок и скрытие текста кнопок
 * - Поддержка долгого нажатия для быстрого скрытия пунктов меню
 * - Полная локализация (русский, украинский, английский, белорусский)
 *
 * ОСОБЕННОСТИ:
 * - Все настройки сохраняются локально
 * - Совместим с Lampa 2.0
 *
 * АВТОР: people
 * ВЕРСИЯ: 1.5.2
 * FIX: Android TV 8.0 focus loss on movie card
 */
(function () {
    'use strict';

    function init() {
        function restoreFocus(container) {
            setTimeout(() => {
                try {
                    const first = container.find('.selector').eq(0);
                    if (first.length) {
                        const el = first.get(0);
                        Lampa.Controller.focus(el);
                        Navigator.focus(el);
                        el.scrollIntoView({ block: 'center', inline: 'center' });
                    }
                } catch (e) {}
            }, 50);
        }

        // === 1. ЛОКАЛИЗАЦИЯ (переводы на 4 языка) ===
        var translations = {
            hide_it: { ru: "Скрыть", uk: "Приховати", en: "Hide", be: "Схаваць" },
            drop_up: { ru: "Поднять", uk: "Підняти", en: "Raise higher", be: "Падняць" },
            drop_down: { ru: "Спустить", uk: "Спустити", en: "Lower down", be: "Спусціць" },
            show_hidden: { ru: "Показать скрытые", uk: "Показати приховані", en: "Show hidden", be: "Паказаць схаваныя" },
            hide_main_items: { ru: "Отметить для скрытия", uk: "Позначити для приховування", en: "Mark to hide",  be: "Адзначыць для схавання" },
            hide_main_settings: { ru: "Отметить для скрытия", uk: "Позначити для приховування", en: "Mark to hide", be: "Адзначыць для схавання" },
            extra_settings: { ru: "Дополнительные настройки", uk: "Додаткові налаштування", en: "Additional settings", be: "Дадатковыя налады" },
            main_menu: { ru: "Главное меню", uk: "Головне меню", en: "Main Menu", be: "Галоўнае меню" },
            settings_menu: { ru: "Меню настроек", uk: "Меню налаштувань", en: "Settings Menu", be: "Меню налад" },
            press_select_items: { ru: "Нажмите для выбора пунктов", uk: "Натисніть, щоб вибрати пункти", en: "Click to select items", be: "Націсніце для выбару пунктаў" },
            header_menu: { ru: "Верхнее меню", uk: "Верхнє меню", en: "Header Menu", be: "Верхняе меню" },
            card_menu: { ru: "Карточка фильма", uk: "Картка фільму", en: "Movie Card", be: "Картка фільма" },
            name_menu: { ru: "Отображать в шапке", en: "Display in header" },
            search: { ru: "Поиск", uk: "Пошук", en: "Search", be: "Пошук"},
            settings: { ru: "Настройки", uk: "Налаштування", en: "Settings", be: "Налады" },
            profile: { ru: "Профиль", uk: "Профіль", en: "Profile", be: "Профіль" },
            notice: { ru: "Уведомления", uk: "Сповіщення", en: "Notifications", be: "Апавяшчэнні" },
            time: { ru: "Время", uk: "Час", en: "Time", be: "Час" },
            head_filter_title: { ru: "Настройка шапки", en: "Header settings" },
            add_buttons_title: { ru: "Добавить кнопки", en: "Add buttons", uk: "Додати кнопки", be: "Дадаць кнопкі" },
            reload_btn: { ru: "Перезагрузка", en: "Reload", uk: "Перезавантаження", be: "Перазагрузка" },
            console_btn: { ru: "Консоль", en: "Console", uk: "Консоль", be: "Кансоль" },
            exit_btn: { ru: "Выход", en: "Exit", uk: "Вихід", be: "Выхад" },
            card_config_title: { ru: "Настройка карточки фильма", en: "Movie card settings", uk: "Налаштування картки фільму", be: "Налады карткі фільма" },
            all_buttons_card: { ru: "Все кнопки в карточке", en: "All buttons in card", uk: "Усі кнопки в картці", be: "Усе кнопкі ў картцы" },
            disable_trailers: { ru: "Отключить трейлеры", uk: "Вимкнути трейлери", en: "Disable trailers", be: "Адключыць трэйлеры" },
            hide_button_text: { ru: "Скрыть текст кнопок", en: "Hide button text", uk: "Приховати текст кнопок", be: "Схаваць тэкст кнопкі" }
        };
        Lampa.Lang.add(translations);

        // === 2. БАЗОВЫЕ ФУНКЦИИ УПРАВЛЕНИЯ МЕНЮ ===
        function jQueryToNative(el) {
            if (typeof el === "string") return document.querySelector(el);
            else if (el instanceof jQuery) return el.get(0);
            else return el;
        }
        function isElementHiddenInMenu(itemName) {
            const hiddenItems = JSON.parse(localStorage.getItem("menu_hide") || "[]");
            return hiddenItems.includes(itemName);
        }
        function filterMainMenu(showItem, hideItem) {
            if (showItem) {
                document.querySelectorAll(".menu__text").forEach(el => {
                    if (el.textContent === showItem) {
                        el.closest(".menu__item").classList.remove("hidden");
                    }
                });
            }
            if (hideItem) {
                document.querySelectorAll(".menu__text").forEach(el => {
                    if (el.textContent === hideItem) {
                        el.closest(".menu__item").classList.add("hidden");
                    }
                });
            }
            let hiddenItems = JSON.parse(localStorage.getItem("menu_hide") || "[]");
            if (showItem && hiddenItems.includes(showItem)) {
                hiddenItems = hiddenItems.filter(item => item !== showItem);
            }
            if (hideItem && !hiddenItems.includes(hideItem)) {
                hiddenItems.push(hideItem);
            }
            localStorage.setItem("menu_hide", JSON.stringify(hiddenItems));
        }
        function getItemsMainMenu() {
            const controllerName = Lampa.Controller.enabled().name;
            const menuItems = document.querySelectorAll(".menu__text");
            const hiddenItems = JSON.parse(localStorage.getItem("menu_hide") || "[]");
            const selectItems = [];
            menuItems.forEach(el => {
                selectItems.push({
                    title: el.textContent,
                    checkbox: true,
                    checked: isElementHiddenInMenu(el.textContent)
                });
            });
            Lampa.Select.show({
                title: Lampa.Lang.translate("hide_main_items"),
                items: selectItems,
                onBack: () => Lampa.Controller.toggle(controllerName),
                onCheck: (item) => {
                    selectItems.forEach(entry => {
                        const idx = hiddenItems.indexOf(entry.title);
                        if (entry.checked && idx === -1) {
                            hiddenItems.push(entry.title);
                            filterMainMenu(null, entry.title);
                        } else if (!entry.checked && idx !== -1) {
                            hiddenItems.splice(idx, 1);
                            filterMainMenu(entry.title);
                        }
                    });
                    localStorage.setItem("menu_hide", JSON.stringify(hiddenItems));
                }
            });
        }
        function filterSettings(itemToShow = null) {
            if (itemToShow) {
                document.querySelectorAll(".settings-folder__name").forEach(el => {
                    if (el.textContent === itemToShow) {
                        el.closest(".settings-folder").classList.remove("hide");
                    }
                });
                return;
            }
            const hiddenFolders = JSON.parse(localStorage.getItem("settingsDimention") || "[]");
            if (hiddenFolders.length > 0) {
                setTimeout(() => {
                    $(".settings-folder__name").each(function () {
                        const name = $(this).text();
                        if (hiddenFolders.includes(name)) {
                            $(this).parent().addClass("hide");
                        } else {
                            $(this).parent().removeClass("hide");
                        }
                    });
                }, 10);
            } else {
                $(".settings-folder__name").parent().removeClass("hide");
            }
        }
        function isSettingsFolderHidden(name) {
            const hidden = JSON.parse(localStorage.getItem("settingsDimention") || "[]");
            return hidden.includes(name);
        }
        function getSettingsItems() {
            const folders = document.querySelectorAll(".settings-folder__name");
            const list = [];
            folders.forEach(el => {
                list.push({
                    title: el.textContent,
                    checkbox: true,
                    checked: isSettingsFolderHidden(el.textContent)
                });
            });
            localStorage.setItem("SettingsItems", JSON.stringify(list));
        }
        function getItems(itemsList) {
            const controllerName = Lampa.Controller.enabled().name;
            const selectedHidden = [];
            Lampa.Select.show({
                title: Lampa.Lang.translate("hide_main_settings"),
                items: itemsList,
                onBack: () => {
                    Lampa.Controller.toggle(controllerName);
                    if ($(".editable").length) Lampa.Controller.move("right");
                },
                onCheck: (item) => {
                    itemsList.forEach(entry => {
                        if (entry.checked && !selectedHidden.includes(entry.title)) {
                            selectedHidden.push(entry.title);
                        }
                        if (!entry.checked) {
                            const idx = selectedHidden.indexOf(entry.title);
                            if (idx !== -1) selectedHidden.splice(idx, 1);
                            filterSettings(entry.title);
                        }
                    });
                    localStorage.setItem("settingsDimention", JSON.stringify(selectedHidden));
                }
            });
        }

        // === 3. ЛОГИКА ДОЛГОГО НАЖАТИЯ НА ПУНКТЫ МЕНЮ ===
        function moveElementInDOM($element, direction, maxDepth = 3) {
            let attempt = 0;
            const originalPos = $element.position();
            if (direction === 'up' && $element.prev().length > 0) {
                $element.insertBefore($element.prev());
                const newPos = $element.position();
                if (newPos.top < originalPos.top) return true;
            } else if (direction === 'down' && $element.next().length > 0) {
                $element.insertAfter($element.next());
                const newPos = $element.position();
                if (newPos.top > originalPos.top) return true;
            }
            attempt++;
            if (attempt < maxDepth) {
                return moveElementInDOM($element, direction, maxDepth);
            }
            return false;
        }
        function moveMenuItem(itemTitle, direction) {
            let order = JSON.parse(localStorage.getItem('menu_sort') || "[]");
            const idx = order.indexOf(itemTitle);
            if (direction === 'up' && idx > 0) {
                [order[idx], order[idx - 1]] = [order[idx - 1], order[idx]];
            } else if (direction === 'down' && idx !== -1 && idx < order.length - 1) {
                [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
            }
            localStorage.setItem('menu_sort', JSON.stringify(order));
        }
        function menuDo($menuItem, itemTitle) {
            const actions = [
                { title: Lampa.Lang.translate("hide_it"), todo: "hide_it" },
                { title: Lampa.Lang.translate("drop_up"), todo: "drop_up" },
                { title: Lampa.Lang.translate("drop_down"), todo: "drop_down" },
                { title: Lampa.Lang.translate("show_hidden"), todo: "show_hidden" }
            ];
            Lampa.Select.show({
                title: Lampa.Lang.translate("title_action") || "Действие",
                items: actions,
                onBack: () => {
                    Lampa.Controller.toggle("menu");
                    if ($('.editable').length) Lampa.Controller.move("right");
                },
                onSelect: (action) => {
                    if (action.todo === "hide_it") {
                        $menuItem.addClass("hidden");
                        let hidden = JSON.parse(localStorage.getItem("menu_hide") || "[]");
                        if (!hidden.includes(itemTitle)) hidden.push(itemTitle);
                        localStorage.setItem("menu_hide", JSON.stringify(hidden));
                        if (
                            $("[data-action='console']").hasClass("hidden") &&
                            $("[data-action='about']").hasClass("hidden") &&
                            $("[data-action='settings']").hasClass("hidden")
                        ) {
                            $(".menu__split").addClass("hide");
                        }
                        Lampa.Controller.toggle("menu");
                        Lampa.Controller.focus(jQueryToNative($("[data-action='main']")));
                        Navigator.focus(jQueryToNative($("[data-action='main']")));
                        if ($('.editable').length) Lampa.Controller.move("right");
                    } else if (action.todo === "drop_up") {
                        moveElementInDOM($menuItem, 'up');
                        moveMenuItem(itemTitle, 'up');
                        Lampa.Controller.toggle("menu");
                        const el = jQueryToNative($menuItem);
                        Lampa.Controller.focus(el);
                        if ($('.editable').length) Lampa.Controller.move("right");
                    } else if (action.todo === "drop_down") {
                        moveElementInDOM($menuItem, 'down');
                        moveMenuItem(itemTitle, 'down');
                        Lampa.Controller.toggle("menu");
                        const el = jQueryToNative($menuItem);
                        Lampa.Controller.focus(el);
                        Navigator.focus(el);
                        if ($('.editable').length) Lampa.Controller.move("right");
                    } else if (action.todo === "show_hidden") {
                        localStorage.setItem("menu_hide", "[]");
                        $(".menu__item").removeClass("hidden");
                        $(".menu__split").removeClass("hide");
                        Lampa.Controller.toggle("menu");
                        const el = jQueryToNative($menuItem);
                        Lampa.Controller.focus(el);
                        Navigator.focus(el);
                        if ($('.editable').length) Lampa.Controller.move("right");
                    }
                }
            });
        }
        $(".menu__item").on("hover:long", function () {
            const title = $(this).find(".menu__text").text();
            menuDo($(this), title);
        });
        function settingsSubMenu(folderName) {
            const actions = [
                { title: Lampa.Lang.translate("hide_it"), todo: "hide_it" },
                { title: Lampa.Lang.translate("show_hidden"), todo: "show_hidden" }
            ];
            Lampa.Select.show({
                title: Lampa.Lang.translate("title_action") || "Действие",
                items: actions,
                onBack: () => Lampa.Controller.toggle("settings"),
                onSelect: (action) => {
                    if (action.todo === "hide_it") {
                        let hidden = JSON.parse(localStorage.getItem("settingsDimention") || "[]");
                        if (!hidden.includes(folderName)) {
                            hidden.push(folderName);
                        }
                        localStorage.setItem("settingsDimention", JSON.stringify(hidden));
                        setTimeout(() => {
                            const folders = document.querySelectorAll(".settings-folder");
                            for (const folder of folders) {
                                if (!folder.classList.contains("hide")) {
                                    Lampa.Controller.focus(folder);
                                    Navigator.focus(folder);
                                    break;
                                }
                            }
                        }, 50);
                    } else if (action.todo === "show_hidden") {
                        localStorage.setItem("settingsDimention", "[]");
                    }
                    Lampa.Controller.toggle("settings");
                    setTimeout(() => Lampa.Controller.toggle("settings"), 50);
                }
            });
        }
        function bindSettings() {
            $(".settings-folder")
                .off('hover:long')
                .on("hover:long", function () {
                    const name = $(this).find(".settings-folder__name").text();
                    settingsSubMenu(name);
                });
        }

        // === 4. ИНТЕГРАЦИЯ В НАСТРОЙКИ LAMPA ===
        Lampa.Settings.listener.follow("open", function (event) {
            if (event.name === "main") {
                const placeholder = { component: "add_menu_sort", name: "menu_manager" };
                Lampa.SettingsApi.addComponent(placeholder);
                setTimeout(() => {
                    $("div[data-component=\"add_menu_sort\"]").remove();
                }, 0);
            }
        });
        const menuEditTitle = Lampa.Lang.translate("extra_settings");
        const menuEditIcon = menuEditTitle;
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: "add_menu_sort", type: "static", default: true },
            field: { name: menuEditIcon },
            onRender: function ($element) {
                setTimeout(() => {
                    $("div.settings__body > div > div > div").prepend($element);
                    const el = jQueryToNative($element);
                    Lampa.Controller.focus(el);
                    Navigator.focus(el);
                }, 10);
                $element.on("hover:enter", () => {
                    Lampa.Settings.create("add_menu_sort");
                    Lampa.Controller.enabled().controller.back = () => {
                        Lampa.Settings.create("interface");
                    };
                });
            }
        });

        // === 5. КНОПКИ РЕДАКТИРОВАНИЯ МЕНЮ ===
        Lampa.SettingsApi.addParam({
            component: "add_menu_sort",
            param: { name: "list_hidden_items", type: 'button' },
            field: {
                name: Lampa.Lang.translate("main_menu"),
                description: Lampa.Lang.translate("press_select_items")
            },
            onRender: function ($btn) {
                $btn.on("hover:enter", () => {
                    setTimeout(getItemsMainMenu, 0);
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: "add_menu_sort",
            param: { name: "list_setings_items", type: "button" },
            field: {
                name: Lampa.Lang.translate("settings_menu"),
                description: Lampa.Lang.translate("press_select_items")
            },
            onRender: function ($btn) {
                $btn.on("hover:enter", () => {
                    setTimeout(() => {
                        const saved = JSON.parse(localStorage.getItem("SettingsItems") || "[]");
                        getItems(saved);
                    }, 0);
                });
            }
        });

        // === 6. УПРАВЛЕНИЕ ЭЛЕМЕНТАМИ ШАПКИ ===
        const head = {
            head_filter_show_search: { name: Lampa.Lang.translate('search'), element: '.open--search' },
            head_filter_show_settings: { name: Lampa.Lang.translate('settings'), element: '.open--settings' },
            head_filter_show_profile: { name: Lampa.Lang.translate('profile'), element: '.open--profile' },
            head_filter_show_fullscreen: { name: Lampa.Lang.translate('fullscreen'), element: '.full--screen' },
            head_filter_show_notice: { name: Lampa.Lang.translate('notice'), element: '.notice--icon' },
            head_filter_show_time: { name: Lampa.Lang.translate('time'), element: '.head__time' },
            head_button_reload: { name: Lampa.Lang.translate('reload_btn'), element: '#mlp_reload' },
            head_button_console: { name: Lampa.Lang.translate('console_btn'), element: '#mlp_console' },
            head_button_exit: { name: Lampa.Lang.translate('exit_btn'), element: '#mlp_exit' }
        };
        function showHideElement(selector, show) {
            const headElement = Lampa.Head.render();
            if (!headElement || !headElement.length) return;
            const el = headElement.find(selector);
            if (el.length) {
                if (show) {
                    el.removeClass('hide').css('display', '');
                } else {
                    el.addClass('hide').css('display', 'none');
                }
            }
        }
        function handleDynamicElement(selector, show) {
            let attempts = 0;
            const maxAttempts = 100;
            const checkInterval = setInterval(function() {
                const headElement = Lampa.Head.render();
                if (headElement && headElement.length) {
                    const element = headElement.find(selector);
                    if (element.length) {
                        if (show) {
                            element.removeClass('hide').css('display', '');
                        } else {
                            element.addClass('hide').css('display', 'none');
                        }
                        clearInterval(checkInterval);
                        return;
                    }
                }
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                }
            }, 100);
        }
        function applyHeadSettings() {
            Object.keys(head).forEach((key) => {
                const show = Lampa.Storage.get(key, true);
                const selector = head[key].element;
                if (key === 'head_filter_show_notice' || key === 'head_filter_show_profile') {
                    handleDynamicElement(selector, show);
                } else {
                    showHideElement(selector, show);
                }
            });
            updateMLPHeaderButtons();
        }
        Lampa.Storage.listener.follow('change', (event) => {
            if (event.name === 'activity') {
                setTimeout(applyHeadSettings, 500);
            } else if (event.name in head || event.name.startsWith('head_button_')) {
                applyHeadSettings();
            }
        });

        // === MLP: ДОПОЛНИТЕЛЬНЫЕ КНОПКИ В ШАПКЕ ===
        function initMLPHeaderButtons() {
            const container = $('#app > div.head > div > div.head__actions');
            if (!container.length) return;
            const btns = {
                reload: '<div id="mlp_reload" class="head__action selector"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"/></svg></div>',
                console: '<div id="mlp_console" class="head__action selector"><svg width="24px" height="24px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path d="M877.685565 727.913127l-0.584863-0.365539a32.898541 32.898541 0 0 1-8.041866-46.423497 411.816631 411.816631 0 1 0-141.829267 145.777092c14.621574-8.992268 33.62962-5.117551 43.645398 8.772944l0.146216 0.073108a30.412874 30.412874 0 0 1-7.968758 43.206751l-6.141061 4.020933a475.201154 475.201154 0 1 1 163.615412-164.419599 29.974227 29.974227 0 0 1-42.841211 9.357807z m-537.342843-398.584106c7.164571-7.091463 24.71046-9.650239 33.26408 0 10.600641 11.185504 7.164571 29.462472 0 37.138798l-110.612207 107.468569L370.901811 576.14119c7.164571 7.091463 8.114974 27.342343 0 35.384209-9.796455 9.723347-29.828011 8.188081-36.480827 1.535265L208.309909 487.388236a18.423183 18.423183 0 0 1 0-25.953294l132.032813-132.032813z m343.314556 0l132.032813 132.032813a18.423183 18.423183 0 0 1 0 25.953294L689.652124 613.133772c-6.652816 6.579708-25.587754 10.746857-36.553935 0-10.30821-10.235102-7.091463-31.290168 0-38.381632l108.345863-100.669537-111.855041-108.638294c-7.164571-7.676326-9.504023-26.611265 0-36.04218 9.284699-9.138484 26.903696-7.091463 34.068267 0z m-135.54199-26.318833c3.582286-9.504023 21.347498-15.498868 32.679217-11.258612 10.819965 4.020933 17.180349 19.008046 14.256035 28.512069l-119.896906 329.716493c-3.509178 9.504023-20.616419 13.305632-30.193551 9.723347-10.161994-3.509178-21.201282-17.545889-17.545888-26.976804l120.627985-329.716493z" fill="currentColor"/></svg></div>',
                exit: '<div id="mlp_exit" class="head__action selector"><svg fill="#ffffff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" fill="currentColor"/></svg></div>'
            };
            $('#mlp_reload, #mlp_console, #mlp_exit').remove();
            container.append(btns.reload).append(btns.console).append(btns.exit);
            $('#mlp_reload').off().on('hover:enter', () => location.reload());
            $('#mlp_console').off().on('hover:enter', () => { try { Lampa.Controller.toggle('console'); } catch (e) {} });
            $('#mlp_exit').off().on('hover:enter', () => {
                try {
                    Lampa.Activity.out();
                    if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
                    if (Lampa.Platform.is('webos')) window.close();
                    if (Lampa.Platform.is('android')) Lampa.Android.exit();
                    if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
                } catch (e) {}
            });
        }
        function updateMLPHeaderButtons() {
            const reload = Lampa.Storage.get('head_button_reload', false);
            const console = Lampa.Storage.get('head_button_console', false);
            const exit = Lampa.Storage.get('head_button_exit', false);
            $('#mlp_reload').toggleClass('hide', !reload);
            $('#mlp_console').toggleClass('hide', !console);
            $('#mlp_exit').toggleClass('hide', !exit);
        }

        /* ======================================================
           НАСТРОЙКА КАРТОЧКИ ФИЛЬМА
        ====================================================== */
        function applyCardSettings() {
            if (!Lampa.Storage.get('mlp_showbutton', false)) return;

            Lampa.Listener.follow('full', function (e) {
    if (e.type !== 'complite') return;
    if (!Lampa.Storage.get('mlp_disable_trailers', false)) return;

    try {
        e.object.activity
            .render()
            .find('.view--trailer')
            .remove();
    } catch (err) {
        console.error('MLP trailers remove error', err);
    }
});


            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;

                setTimeout(() => {
                    try {
                        const activity = e.object.activity;
                        const full = activity.render();
                        const target = full.find('.full-start-new__buttons');

                        if (!target.length) return;

                        // Сохраняем текущий фокус
                        const focused = document.activeElement;

                        // Пересборка кнопок
                        full.find('.button--play').remove();

                        const all = full
                            .find('.buttons--container .full-start__button')
                            .add(target.find('.full-start__button'));

                        const cats = {
                            online: [],
                            torrent: [],
                            trailer: [],
                            other: []
                        };

                        all.each(function () {
                            const $b = $(this);
                            const cls = $b.attr('class') || '';

                            if (cls.includes('online')) cats.online.push($b);
                            else if (cls.includes('torrent')) cats.torrent.push($b);
                            else if (cls.includes('trailer')) cats.trailer.push($b);
                            else cats.other.push($b.clone(true));
                        });

                        const order = Lampa.Storage.get(
                            'mlp_buttonsort',
                            ['online', 'torrent', 'trailer', 'other']
                        );

                        target.empty();

                        order.forEach(cat => {
                            (cats[cat] || []).forEach($b => target.append($b));
                        });

                        if (Lampa.Storage.get('mlp_showbuttonwn', false)) {
                            target.find('span').remove();
                        }

                        target.css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        });

                        // 🔥 КРИТИЧНО: возврат фокуса
                        restoreFocus(target);

                    } catch (err) {
                        console.error('MLP card error', err);
                    }
                }, 120);
            });
        }

        // === 7. МЕНЮ "ВЕРХНЕЕ МЕНЮ" ===
        function getHeadItems() {
            const controllerName = Lampa.Controller.enabled().name;
            const headItems = [
                { key: 'head_filter_show_search', name: Lampa.Lang.translate('search') },
                { key: 'head_filter_show_settings', name: Lampa.Lang.translate('settings') },
                { key: 'head_filter_show_profile', name: Lampa.Lang.translate('profile') },
                { key: 'head_filter_show_fullscreen', name: Lampa.Lang.translate('fullscreen') },
                { key: 'head_filter_show_notice', name: Lampa.Lang.translate('notice') },
                { key: 'head_filter_show_time', name: Lampa.Lang.translate('time') },
                { key: 'head_button_reload', name: Lampa.Lang.translate('reload_btn') },
                { key: 'head_button_console', name: Lampa.Lang.translate('console_btn') },
                { key: 'head_button_exit', name: Lampa.Lang.translate('exit_btn') }
            ];

            const selectItems = headItems.map(item => ({
                title: item.name,
                checkbox: true,
                checked: Lampa.Storage.get(item.key, true)
            }));

            Lampa.Select.show({
                title: Lampa.Lang.translate("header_menu"),
                items: selectItems,
                onBack: () => Lampa.Controller.toggle(controllerName),
                onCheck: (item) => {
                    selectItems.forEach((entry, index) => {
                        const itemKey = headItems[index].key;
                        const currentValue = Lampa.Storage.get(itemKey, true);
                        const newValue = entry.checked;

                        if (currentValue !== newValue) {
                            Lampa.Storage.set(itemKey, newValue);
                        }
                    });
                    applyHeadSettings();
                }
            });
        }

        // Обновляем закладку "Верхнее меню" для использования новой функции
        Lampa.SettingsApi.addParam({
            component: "add_menu_sort",
            param: { name: "head_filter_button", type: "button" },
            field: {
                name: Lampa.Lang.translate("header_menu"),
                description: Lampa.Lang.translate("press_select_items")
            },
            onRender: function ($btn) {
                $btn.on("hover:enter", () => {
                    setTimeout(getHeadItems, 0);
                });
            }
        });

        // === 8. ПОДМЕНЮ "НАСТРОЙКА КАРТОЧКИ ФИЛЬМА" ===
        Lampa.SettingsApi.addParam({
            component: "add_menu_sort",
            param: { name: "card_config_button", type: "button" },
            field: {
                name: Lampa.Lang.translate("card_menu"),
                description: Lampa.Lang.translate("press_select_items")
            },
            onRender: function ($btn) {
                $btn.on("hover:enter", () => {
                    Lampa.Settings.create("card_config_submenu", {
                        onBack: () => Lampa.Settings.create("add_menu_sort")
                    });
                });
            }
        });
        Lampa.Template.add('settings_card_config_submenu', `<div></div>`);
        Lampa.SettingsApi.addParam({
            component: "card_config_submenu",
            param: { name: "mlp_showbutton", type: "trigger", default: false },
            field: { name: Lampa.Lang.translate("all_buttons_card") }
        });
        Lampa.SettingsApi.addParam({
            component: "card_config_submenu",
            param: { name: "mlp_showbuttonwn", type: "trigger", default: false },
            field: { name: Lampa.Lang.translate("hide_button_text") }
        });
        Lampa.SettingsApi.addParam({
            component: "card_config_submenu",
            param: {
            name: "mlp_disable_trailers",
            type: "trigger", default: false },
            field: { name: Lampa.Lang.translate("disable_trailers") }
        });


        // === 9. ФИНАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ===
        Lampa.Settings.listener.follow("open", function (event) {
            if (event.name === "main") {
                setTimeout(() => {
                    bindSettings();
                    filterSettings();
                    getSettingsItems();
                    applyHeadSettings();
                }, 10);
            }
        });
        // Инициализация MLP-функций
        initMLPHeaderButtons();
        if (Lampa.Storage.get('mlp_showbutton', false)) applyCardSettings();
    }

    // === ЗАПУСК ПЛАГИНА ===
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                init();
            }
        });
    }
})();
