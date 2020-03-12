const path = require('path');
const webpack = require('webpack');
require('dotenv').config()
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// remove readme file
let removeReadme = item => item.replace(/\..+$/, '').toLowerCase() != 'readme';

// auto page generator
function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const filteredTemplateFiles = templateFiles.filter(removeReadme);

  return filteredTemplateFiles.map(item => {
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
  entry: [  // webpack entry point.
    './src/index.js',
    './src/styles/index.sass',
    // './src/styles/loader.sass'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),  // folder to store generated bundle
    filename: './bundle.script.js'  // name of generated bundle after build
  },

  devtool: "source-map",  // source Maps

  module: {  // where we defined file patterns and their loaders
    rules: [

      // babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      // styles sass/scss
      {
        test: /\.(sa|sc|c)ss$/,
        use: [  
          {
            loader: 'file-loader',
            options: {
              name: './styles/[name].css',
              context: './',
              publicPath: './dist/styles'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },

      // html template
      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src/html/includes'),
        use: ['html-loader']
      },
    ]
  },

  plugins: [  // array of plugins to apply to build chunk
    new webpack.DefinePlugin({  // plugin to define global constants

      // Change the path to the includes folder in the .env file
      INCLUDES_PATH: JSON.stringify(process.env.INCLUDES_PATH)
    }),
    
    new CleanWebpackPlugin(),  // Clear the dist folder

    new CopyWebpackPlugin([  
      {  // copy static files
        from: './src/static',
        to: './'
      }
    ])
  ].concat(htmlPlugins), // auto page generator

  devServer: {  // configuration for webpack-dev-server
    liveReload: true,
    hot: false,
    watchContentBase: true,
    host: "localhost", // host to run dev-server
    port: 80, // port to run dev-server
    open: false  // open page at server startup
  } 
};