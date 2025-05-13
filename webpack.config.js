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
                                modules: false,
                                loose: true,
                                bugfixes: true,
                            }],
                        ],
                        sourceMaps: true, // Додано для дебагінгу
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: false,
        concatenateModules: true,
    },
    mode: 'development',
    devtool: 'source-map', // Додано для читабельного дебагінгу
};
