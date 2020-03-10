const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Auto page generator
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      inject: false,
    })
  })
};

const htmlPlugins = generateHtmlPlugins('./src/html/views');

module.exports = {
  // Connected files
  entry: [
    './src/js/index.js'
  ],
  output: {
    filename: './js/bundle.js'
  },
  devtool: "source-map",

  // Modules
  module: {
    rules: [

      // // Babel
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env']
      //     }
      //   }
      // },

      // Styles
      {
        test: /\.(sass|scss)$/,
        include: path.resolve(__dirname, 'src/styles'),
        use: [MiniCssExtractPlugin.loader, 'sass-loader'],
      },

      // Html
      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src/html/includes'),
        use: ['html-loader']
      },
    ]
  },

  // Plugins
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/img',
        to: './img'
      }
    ]),
    new MiniCssExtractPlugin()
  ].concat(htmlPlugins)
};