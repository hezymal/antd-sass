const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './example/index.jsx',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    module: {
        rules: [
            { 
                test: /\.jsx?$/, 
                exclude: /node_modules/, 
                loader: "babel-loader",
                options: {
                    "presets": [
                        "@babel/preset-env", 
                        "@babel/preset-react"
                    ]
                }
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './example/index.html' })
    ]
};
