const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        t2: './src/t2/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            type: 'module', // Експериментальна підтримка ES-модулів
        },
    },
    experiments: {
        outputModule: true, // Увімкнення вихідного формату ES-модулів
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
                                targets: 'defaults', // Сумісність із сучасними браузерами
                                modules: false, // Збереження ES-модулів
                            }],
                        ],
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_fnames: true, // Збереження імен функцій
                    keep_classnames: true, // Збереження імен класів і конструкторів
                },
            }),
        ],
    },
    mode: 'production',
};
