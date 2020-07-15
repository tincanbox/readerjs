const path = require('path');
const glob = require('glob');
const fs = require('fs');

const C = require("./workspace.config.js");

let conf = {

  mode: 'development',

  devtool: 'source-map',

  entry: (() => {
    let entries = {};
    let pts = glob.sync("./" + C.ENTRY + "/*.{js,ts}");
    for(let p of pts){
      let pinf = path.parse(p);
      entries[pinf.name] = p;
    }
    return entries;
  })(),

  output: {
    path: path.resolve(__dirname, C.DEST),
    filename: "[name].js",
    publicPath: "."
  },

  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
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
  },

  resolve: {
    modules: [path.join(__dirname, C.ENTRY), "node_modules"],
    extensions: [
      '.ts', '.tsx', '.js', '.vue'
    ],
    alias: {
      // vue-template-compiler
      vue$: 'vue/dist/vue.esm.js',
      //asset: path.resolve(__dirname + "/" + C.ENTRY + "/asset")
    },
  },

  devServer: {
    contentBase: path.join(__dirname, C.ENTRY),
    compress: true,
    inline: true,
    hot: false,
    port: 3030
  },

  watchOptions: {
    // Example watchOptions
    aggregateTimeout: 300,
    poll: 1000
  }

};

conf = Object.assign(conf, require('./webpack.config.module.js')(conf), require('./webpack.config.local.js')(conf))

// Asset List
let srcm = new RegExp("^" + C.ENTRY.replace(/(^\/|\/$)/, "") + "/");
let srcs = glob.sync(C.ENTRY + "/**/*.{html,htm,xml,yml,jpg,jpeg,png,gif,tiff,svg,woff,woff2,ttf,eot,mp3,mp4,m4a,wav,zip}")
  .map((r) => { return r.replace(srcm, ""); });
fs.writeFileSync(C.ENTRY + "/.asset.list.js", "// generated in webpack.config\nexport default " + JSON.stringify(srcs));
console.log("[WORKSPACE]", "Listing up assets... ", srcs);

module.exports = conf;