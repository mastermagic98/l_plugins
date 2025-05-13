const path = require('path');

module.exports = {
    entry: './t2/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 't2.js',
        library: {
            name: 'plugin_upcoming',
            type: 'var'
        }
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
                                targets: '> 0.25%, not dead',
                                useBuiltIns: false,
                                modules: false
                            }]
                        ]
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: false
    },
    mode: 'development',
    devtool: false
};
