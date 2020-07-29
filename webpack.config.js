/* eslint-disable no-unused-vars */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

const alias = {
    src: path.resolve(__dirname, 'src/'),
    utils: path.resolve(__dirname, 'src/utils/'),
}

module.exports = (env, args) => [
    {
        mode: env === 'prod' ? 'production' : 'development',
        entry: './src/app.tsx',
        target: 'electron-renderer',
        devtool: env === 'prod' ? undefined : 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias,
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: /src/,
                    use: [{ loader: 'ts-loader' }],
                },
                {
                    test: /\.less$/,
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'less-loader' }],
                },
                {
                    test: /\.glsl$/,
                    use: [{ loader: 'webpack-glsl-loader' }],
                },
            ],
        },
        output: {
            path: __dirname + '/app',
            filename: 'bundle.js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
            }),
        ],
    },
    {
        mode: env === 'prod' ? 'production' : 'development',
        entry: './src/main.ts',
        target: 'electron-main',
        devtool: env === 'prod' ? undefined : 'source-map',
        resolve: {
            extensions: ['.ts', '.js'],
            alias,
        },
        externals: [nodeExternals()],
        devServer: {
            contentBase: 'app/',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    include: /src/,
                    use: [{ loader: 'ts-loader' }],
                },
            ],
        },
        plugins: [new CopyWebpackPlugin([{ from: 'static/', to: 'static' }])],
        output: {
            path: __dirname + '/app',
            filename: 'main.js',
        },
    },
]
