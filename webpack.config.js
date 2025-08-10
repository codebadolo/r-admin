const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // point d'entrée
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // transpile JS et JSX
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/, // charger CSS
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // extensions reconnues
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // template HTML
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  mode: 'development', // ou 'production'
};
