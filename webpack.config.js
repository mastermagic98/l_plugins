const path = require('path');

module.exports = {
    entry: {
        t2: './t2/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            type: 'commonjs', // Змінено на commonjs для стабільності
        },
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
                                loose: true,
                                bugfixes: true,
                            }],
                        ],
                        sourceMaps: true,
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
    devtool: 'source-map',
};
