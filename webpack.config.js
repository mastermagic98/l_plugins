const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');
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
        minimize: false
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
        new WebpackObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75
        }, []),
        new webpack.BannerPlugin({
            banner: '(function () {',
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
