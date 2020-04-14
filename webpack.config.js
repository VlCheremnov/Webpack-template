const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const fs = require('fs');

// Html files only
let htmlOnly = item => /(\.njk)$/.test(item);

// auto page generator
function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const filteredTemplateFiles = templateFiles.filter(htmlOnly);

  return filteredTemplateFiles.map(item => {
    const extension = 'njk';
    const name = item.replace(/(\.njk)$/, '');

    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      inject: false,
      showErrors: null
    })
  }).concat([new HtmlBeautifyPlugin(
    {
      config: {
        html: {
          end_with_newline: true,
          indent_size: 2,
          indent_with_tabs: true,
          indent_inner_html: true,
          preserve_newlines: false
        }
      }
    })
  ]);
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

  mode: "production",

  module: {  // where we defined file patterns and their loaders
    
    rules: [

      // babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'eslint-loader'
          }
        ]
      },

      // styles sass/scss
      {
        test: /\.(sa|sc|c)ss$/,
        use: [  
          {
            loader: 'file-loader',
            options: {
              name: './styles/[name].css',
              context: './'
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
              sourceMap: false
            }
          }
        ]
      },

      // nunjucks templates
      {
        test: /\.njk|nunjucks/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: {
                minimize: false,
                removeComments: false,
                collapseWhitespace: false
              }
            }
          },
          { // use html-loader or html-withimg-loader to handle inline resource
            loader: 'nunjucks-webpack-loader' // add nunjucks-webpack-loader
          },
        ]
      },
    ]
  },

  plugins: [  // array of plugins to apply to build chunk
    
    new CleanWebpackPlugin({
      dry: true,
      cleanOnceBeforeBuildPatterns : []
    }),  // Clear the dist folder

    new CopyWebpackPlugin([  
      {  // copy static files
        from: './src/static',
        to: './',
        ignore: ['*.md']
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
  },

  optimization: {
    splitChunks: {
      chunks: 'async',
      minChunks: 1,
      automaticNameDelimiter: '~',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: true,
        terserOptions: {
          ecma: 5,
          ie8: false,
          compress: true,
          warnings: true,
        },
      }),
    ]
  }
};
