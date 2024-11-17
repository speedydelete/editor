
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        publicPath: './dist/',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json'],
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /(\.js|\.ts|\.jsx|\.tsx|\.css)$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devServer: {
        static: {
          directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
};
