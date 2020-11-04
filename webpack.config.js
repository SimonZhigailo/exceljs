//модуль path для того что бы узнать абсролютный путь
const path = require('path')
//чистит папку dist при создании новых budle.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// при создании новых HTML будут базово заполнены
const HTMLWebpackPlugin = require('html-webpack-plugin')
//переносить favicon на каждую страницу
const CopyPlugin = require('copy-webpack-plugin')
//плагин для перевода css в minified css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    ]

    if (isDev) {
        loaders.push('eslint-loader')
    }
    return loaders
}

//если production пишем в имя хэш, что бы браузер никогда не поднимал из своего
//кэша старый файл при апдейте
const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`

module.exports = {
    //Webpack будет смотреть за всеми исходниками в src
    context: path.resolve(__dirname, 'src'),
    //WebPack в режимк разработки по умолчанию
    mode: 'development',
    //входная точка для приложения
    entry: ['@babel/polyfill', './index.js'],
    //задаёт имя файла и локацию, куда будут собираться все js файлы в приложении
    output: {
        //название файла, где будут находится все js
        // (hash что бы создавал всегда новый файл для браузера)
        filename: filename('js'),
        //куда необходимо их складывать
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js'],
        //позволяет делать import '../../../core/Component'
        alias: {
            //когда символ собаки, значит src
            '@': path.resolve(__dirname, 'src'),
            '@core': path.resolve(__dirname, 'src/core'),

        }
    },
    devtool: isDev ? 'source-map' : false,
    devServer: {
        port: 4200,
        hot: isDev
    },
    //плагины
    plugins:[
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: 'index.html',
            minify: {
                removeComments: isProd,
                collapseWhitespace: isProd
            }
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ],
    //sass пропускается через sass-loader, потом css-loader, потом минифается
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    },
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader'
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: jsLoaders(),

                //use: {
                //    loader: 'babel-loader',
                //    options: {
                //        presets: ['@babel/preset-env']
                //   }
                //}
            }
        ],
    },
}