const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const ExtractPlugin = require('extract-text-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const config = {
    target: 'web',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[hash:8].js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            loader: 'style-loader',
            loader: 'css-loader'
        },
        {
            test: /\.vue$/,
            loader: 'vue-loader'
        },
        {
            test: /\.jsx$/,
            loader: 'babel-loader'
        }, {
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name]-wc.[ext]'
                    }
                }
            ]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HtmlWebpackPlugin(),
        new VueLoaderPlugin()
    ]
};

if (isDev) {
    // 开发坏境的配置
    config.module.rules.push({
        test: /\.scss/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true
                }
            },
            'sass-loader'
        ]
    });
    config.devtool = '#cheap-module-eval-source-map';
    //代码的映射 定位错误位置
    config.devServer = {
        port: '8000',
        host: 'localhost',
        overlay: {  // webpack编译出现错误，则显示到网页上
            errors: true,
        },
        open: true,

        // 不刷新热加载数据
        // hot: true
    };
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue']
    }
    config.devtool = 'null';//注意，这能大大压缩我们的打包代码
    config.output.filename = '[name]-[chunkhash:8].js';
    config.module.rules.push({
        test: /\.scss/,
        use: ExtractPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                },
                'sass-loader'
            ]
        })
    });
    config.plugins.push(
        new ExtractPlugin('scss-[hash:8].css'),
        // 将类库文件单独打包出来
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        // webpack相关的代码单独打包
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        })
    )
}

module.exports = config;