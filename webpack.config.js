const path = require('path');

module.exports = {
    entry: './t2/index.js', // Змінено шлях
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
