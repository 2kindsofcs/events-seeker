import webpack from 'webpack';
import path from 'path';
import htmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';

export default function(): webpack.Configuration {
    return {
        mode: 'development',
        devtool: '#source-map',
        target: 'web',
        entry: path.join(__dirname, 'src/index.tsx'),
        output: { path: path.join(__dirname, '../out/client') },
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: [
                    'ts-loader'
                ]
            }, {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }]
        },
        plugins: [new htmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html')
        }), 
        new FaviconsWebpackPlugin(`${path.join(__dirname, 'src/mailbox-310x310.png')}`)],
        resolve: {
            extensions: [
                '.ts',
                '.tsx',
                '.js'
            ]
        },
    }
}