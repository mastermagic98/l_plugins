const path = require('path');

module.exports = {
    entry: {
        t2: './t2/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            type: 'module',
        },
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: 'defaults',
                                modules: false, // Збереження ES-модулів
                                loose: true, // Менш агресивна транспіляція
                                bugfixes: true,
                            }],
                        ],
                        plugins: [
                            '@babel/plugin-transform-modules-commonjs', // Конвертація ES-модулів у CommonJS для простоти
                        ],
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: false, // Без мінімізації
        concatenateModules: true, // Об’єднання модулів у читабельний спосіб
    },
    mode: 'development', // Читабельний код
};
