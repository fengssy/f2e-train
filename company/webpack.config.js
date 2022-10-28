const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    watch: true, // 启用 watch 模式
    entry: {
        index: './src/index/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                            esModule: false,
                        }
                    },
                ],
                //webpack5时,有点冲突,需要修改成这个类型,才可以按预期的解析
                type: 'javascript/auto'
            },
            {
                test: /.\html$/,
                //处理html中的img图片
                loader: 'html-loader',
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        // 创建HTML页面,webpack output主要负责提取压缩的js文件,需要用这个插件生成HTML文件
        new HtmlWebpackPlugin({
            filename: `index.html`, //生成的文件名
            template: `./src/index.html`, //文件模板不传会生成一个默认Body内容为空的HTML文件
            inject: true,
            chunks: ['index'], // chunks为该页面要包含的js文件
        }),
    ]
};