const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

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
                                modules: false,
                            }],
                        ],
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: false, // Вимкнено мінімізацію
    },
    mode: 'development', // Змінено на development для читабельного коду
};
