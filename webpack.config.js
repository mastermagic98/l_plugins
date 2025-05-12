const path = require('path');

module.exports = {
    entry: './t2/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 't2.js'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        comments: true
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: false,
        usedExports: false
    },
    devtool: false
};
