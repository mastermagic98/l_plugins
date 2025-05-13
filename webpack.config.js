const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './t2/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 't2.js',
        clean: true
    },
    mode: 'production',
    optimization: {
        minimize: false // Вимикаємо мініфікацію, щоб зберегти коментарі та форматування
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: "(function () {\n    'use strict';",
            raw: true,
            entryOnly: true
        }),
        new webpack.BannerPlugin({
            banner: '})();',
            raw: true,
            entryOnly: true,
            stage: webpack.BannerPlugin.AFTER
        })
    ]
};
