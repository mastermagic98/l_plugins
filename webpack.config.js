const path = require('path');

module.exports = {
    entry: './l_plugins/t2/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 't2.js'
    },
    mode: 'production',
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
    }
};
