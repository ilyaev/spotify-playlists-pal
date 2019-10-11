const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = [
    {
        mode: 'development',
        entry: './src/app.tsx',
        target: 'electron-renderer',
        devtool: 'source-map',
        // watch: true,
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: /src/,
                    use: [{ loader: 'ts-loader' }]
                },
                {
                    test: /\.less$/,
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'less-loader' }]
                }
            ]
        },
        output: {
            path: __dirname + '/dist',
            filename: 'bundle.js'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html'
            })
        ]
    },
    {
        mode: 'development',
        entry: './src/main.ts',
        target: 'electron-main',
        devtool: 'source-map',
        resolve: {
            extensions: ['.ts', '.js']
        },
        externals: [nodeExternals()],
        devServer: {
            contentBase: 'dist/'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    include: /src/,
                    use: [{ loader: 'ts-loader' }]
                }
            ]
        },
        plugins: [new CopyWebpackPlugin([{ from: 'static/', to: 'static' }])],
        output: {
            path: __dirname + '/dist',
            filename: 'electron.js'
        }
    }
]
