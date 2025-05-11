// l_plugins/t2/templates.js
export function initTemplates() {
    Lampa.Template.add('trailer', [
        '<div class="card card--trailer selector">',
        '    <div class="card__view">',
        '        <img class="card__img" />',
        '    </div>',
        '    <div class="card__info">',
        '        <div class="card__title"></div>',
        '        <div class="card__details"></div>',
        '    </div>',
        '</div>'
    ].join(''));

    Lampa.Template.add('items_line', [
        '<div class="items-line">',
        '    <div class="items-line__header">',
        '        <div class="items-line__title"></div>',
        '    </div>',
        '    <div class="items-line__body"></div>',
        '</div>'
    ].join(''));

    Lampa.Template.add('more', [
        '<div class="card card--more selector">',
        '    <div class="card__view">',
        '        <div class="card__more">',
        '            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">',
        '                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.92 5 11v5l-2 2v1h18v-1l-2-2z"/>',
        '            </svg>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join(''));
}
