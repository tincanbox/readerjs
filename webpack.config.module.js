const fs = require('fs');
const path = require('path');

const C = require("./workspace.config.js");
const H = require('./workspace.helper.js');


// Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const html_webpack_plugin = require('html-webpack-plugin')

// Template
const nunjucks = H.nunjucks(require('nunjucks'), {});

// Misc.
let exclude_reg_list = C.EXCLUDE.map((ex) => new RegExp(ex));

module.exports = (WCF) => { return {

  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      //filename: '[name].css',
      //chunkFilename: '[id].css',
    })
  ].concat(
    // Pages
    (() => {
      let r = [];
      let d = C.PAGE.DEFAULT;
      for (let k in C.PAGE.TARGET) {
        r.push(new html_webpack_plugin({
          hash: true,
          // Just include favicon from your bundle.js file.
          //favicon: C.ENTRY + "/" + C.PAGE.FAVICON,
          template: path.resolve(__dirname + "/" + C.ENTRY + "/" + k),
          minify: {
            html5: true,
            collapseWhitespace: true,
            caseSensitive: true,
            removeComments: true,
            removeEmptyElements: false
          }
        }));
      }
      return r;
    })()
  ),
  module: {

    rules: [
      {
        test: /\.htm(l?)$/i,
        use: [
          {
            loader: 'html-loader',
          }
        ]
      },
      {
        test: /\.vue$/,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'vue-loader'
          },
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'file-loader',
            options: {
              // DONT use hash if you want to use HTML templating.
              name: '[path][name].[ext]',
              outputPath: (p) => {
                return p.replace(new RegExp("^" + C.ENTRY), "");
              },
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'file-loader',
            options: {
              // DONT use hash if you want to use HTML templating.
              name: '[path][name].[ext]',
              outputPath: (p) => {
                return p.replace(new RegExp("^" + C.ENTRY), "");
              },
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: [].concat(exclude_reg_list),
        use: [
          //{ loader: 'style-loader', options: { injectType: 'linkTag' } },
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              //url: false
            }
          },
          'sass-loader',
        ],
      },
      {
        test: /\.ts(x?)$/,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ["@babel/env"]
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              // If your project takes too long to build with type-checkings.
              //transpileOnly: true,
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ["@babel/env"]
              ]
            }
          },
          {
            loader: 'eslint-loader',
          }
        ]
      },
      //========================================

      // Template
      {
        test: /\.(njk)$/,
        exclude: [].concat(exclude_reg_list),
        use: [
          {
            loader: 'html-loader',
            options: {
              preprocessor: (content, loader) => {
                try {
                  console.log("[WORKSPACE][Nunjucks]", "processing ", loader._module.resource);
                  let df = C.PAGE.DEFAULT;
                  let ov = {};
                  for (let k in C.PAGE.TARGET) {
                    let rg = new RegExp(k + "$");
                    if (rg.test(loader._module.resource)) {
                      ov = C.PAGE.TARGET[k];
                      break;
                    }
                  }
                  return nunjucks.renderString(content, Object.assign({
                    WORKSPACE_CONFIG: C,
                    WEBPACK_CONFIG: WCF
                  }, df.data || {}, ov.data || {}));
                } catch (e) {
                  loader.emitError(e);
                  return content;
                }
              },
            },
          }
        ]
      },

    ] // Rules END

  }

}}