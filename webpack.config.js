const path = require('path');

console.log(path.resolve(__dirname, 'dist/front-end/'));

module.exports = {
  entry: './src/front-end/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/front-end/'),
	publicPath: '/public/'
  },
  devServer: {
		 contentBase: "./dist/front-end/",
         inline: true, // autorefresh
         port: 8080 // development port server
      },
  module: {
         loaders: [
            {
               test: /\.jsx?$/, // search for js files 
               exclude: /node_modules/,
               loader: 'babel-loader',
  query: {
               presets: ['es2015', 'react'] // use es2015 and react
            }
         }
      ]
   }
};
