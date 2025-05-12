const path = require('path');

module.exports = {
    entry: './t2/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 't2.js'
    },
    mode: 'development', // Використовуємо режим development для уникнення оптимізацій
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        // Зберігаємо коментарі у вихідному коді
                        comments: true
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: false, // Вимикаємо мінфікацію
        usedExports: false // Вимикаємо tree-shaking, щоб зберегти весь код
    },
    // Зберігаємо читабельний формат вихідного коду
    devtool: false // Вимикаємо source maps, щоб не генерувати додаткові файли
};
