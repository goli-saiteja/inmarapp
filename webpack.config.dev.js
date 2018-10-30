const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', //HMR Hot module replacement to load only the component without refreshing the entire page
        path.join(__dirname, '/client/index.js')
    ], //Take initial code from here
    output: {
        filename: 'bundle.js', //Bundle all the javascript from the main.js and store in index.js which is being used in index.html
		path: '/',
		publicPath: '/'
    },
    mode: 'development',
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin()
	],
    module: {
        rules: [
            { //This rule specifies that check all the files with .js/.jsx except in node_modules and convert the JSX and ES6 code the the ES5 code as it understood by lot of old browsers
                test: /\.jsx?$/,
                exclude:/(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                  presets:[ 'es2015', 'react', 'stage-2' ]
                }
            },
            {//This rule converts all .scss files to the .css. This convertion is required because browers can only understand css so all the scss code must be converted to the browser understandble css code.
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            },
            {//This rule converts all .scss files to the .css. This convertion is required because browers can only understand css so all the scss code must be converted to the browser understandble css code.
                test: /\.css$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }]
            },
            { //This rule is used to import images and fonts in the .scss files
                test: /\.(woff|woff2|eot|ttf|svg|gif|jpe?g|png)$/, loader: 'url-loader?limit=100000'
            }
        ]
    }

};
