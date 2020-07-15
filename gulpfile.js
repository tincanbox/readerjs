const path = require('path');
const CONFIG = require('./workspace.config.js');
// Webpack
const webpack = require('webpack');
const webpack_dev_server = require('webpack-dev-server');
const webpack_config_factory = require('./webpack.config.factory.js');
// Gulp
const gulp = require('gulp');
const gulp_util = require('gulp-util');
// Others
const del = require('del');
const browsersync = require('browser-sync').create();

// Fetchs command line arguments
// Also is used as webpack adaptor.
const arg = (li => {
  let arg = {}, a, opt, ori, cur;
  for (a = 0; a < li.length; a++) {
    ori = li[a].trim(); opt = ori.replace(/^\-+/, '');
    if (opt === ori) { // argument value
      if (cur) arg[cur] = opt;
      cur = null;
    } else { // argument name
      arg[(cur = opt)] = true;
    }
  }
  return arg;
})(process.argv);

console.log("[WORKSPACE]", "CLI args", arg);
const WCF = webpack_config_factory(arg);


//-------------------------
// Helper
//-------------------------

function bind_config(type, ...cbs){
  return gulp[type].apply(gulp, cbs.map((f) => {
    if (typeof f == "function") {
      return async (done) => {
        let r = await f.apply(gulp, [CONFIG, done]);
        return r;
      };
    } else {
      return f;
    }
  }));
}

function generate_src_list(C, glob_type){
  let inc = "./" + C.ENTRY + (glob_type ? ("/" + (glob_type == "*" ? "**/*" : C.ASSET_GLOB[glob_type.toUpperCase()]) ) : "/**/*");
  let exc = C.EXCLUDE.map((r) => ('!**/' + r + '/**/*'));
  return [].concat(inc, exc).filter(r => r);
}

//-------------------------
// Base Tasks
//-------------------------

function define_clean(glob_str){
  return (C, done) => {
    return del.sync([C.DEST + "/" + (glob_str || "*")]);
  }
}

function define_clean_page(){
  return (C, done) => {
    let tg = [];
    for(let p in C.PAGE.TARGET){
      tg.push(C.DEST + "/" + p);
    }
    return del.sync(tg);
  }
}

function define_webpack_server() {
  return (C, done) => {
    // Start a webpack-dev-server
    console.log(WCF.devServer);
    let compiler = webpack(WCF);
    new webpack_dev_server(compiler, WCF.devServer)
      .listen(WCF.devServer.port, "localhost", function (err) {
        if (err) throw new gulp_util.PluginError("webpack-dev-server", err);
        // Server listening
        gulp_util.log("[webpack-dev-server]", "http://localhost:" + WCF.devServer.port);
      });
  }
}

function define_webpack_watch() {
  return (C, done) => {
    const compiler = webpack(WCF);
    const watching = compiler.watch(Object.assign(WCF.watchOptions, {
      contentBase: __dirname + '/' + C.DEST,
    }), (err, stats) => { // Stats Object
      console.log(stats.toString({ chunks: false, colors: true }));
    });
    // done();
  }
}

function define_webpack_build(){
  return (C, done) => {
    /* its hard to tell `finished` state to browsersync & gulp... */
    return new Promise((res, rej) => {
      webpack(WCF).run((err, stats) => {

        if (err) {
          console.error(err.stack || err);
          if (err.details) console.error(err.details);
          return rej(err);
        }

        const info = stats.toJson();
        if (stats.hasErrors()) console.error(info.errors);
        if (stats.hasWarnings()) console.warn(info.warnings);

        console.log(stats.toString({ chunks: false, colors: true }));

        console.log("resolving...");
        res(stats);
      });
    });
  }
}

function define_browsersync(){
  return (C, done) => {
    browsersync.init({
      port: WCF.devServer.port,
      reloadOnRestart: true,
      server: {
        baseDir: "./" + C.DEST
      }
    });
    console.log("This Browser uses the part of webpack.config's devServer property.");
    return done();
  }
}

function define_draw_border(){
  return (done) => {
    console.log("");
    console.log("==================== CHANGES DETECTED ====================");
    console.log(new Date());
    console.log("");
    done();
  }
}

function define_observe(){
  return (C, done) => {
    // Removes generated PAGE files and lets force webpack to rebuild.
    // Webpack ignores fileDependencies with Non-Entrypoint file's includes & dependencies for performance.
    // Thus, after 2nd time builds, webpack.watch won't recompile included files.
    // Also Pug has similar problems like described above.
    gulp.watch(generate_src_list(C, 'template'))
      .on('change', gulp.series(define_draw_border(), 'clean-all-page', 'webpack:build', browsersync.reload));

    // Other files (just redirects all changes to webpack)
    // See workspace.config for further details.
    gulp.watch(generate_src_list(C, 'html'))
      .on('change', gulp.series(define_draw_border(), 'webpack:build', browsersync.reload));
    gulp.watch(generate_src_list(C, 'view'))
      .on('change', gulp.series(define_draw_border(), 'webpack:build', browsersync.reload));
    gulp.watch(generate_src_list(C, 'script'))
      .on('change', gulp.series(define_draw_border(), 'webpack:build', browsersync.reload));
    gulp.watch(generate_src_list(C, 'style'))
      .on('change', gulp.series(define_draw_border(), 'webpack:build', browsersync.reload));
    return done();
  }
}


//-------------------------
// Bundling Tasks
//-------------------------

// laundry
gulp.task('clean', bind_config("series", define_clean("*")));
gulp.task('clean-all-page', bind_config("series", define_clean_page()));
// webpack
gulp.task("webpack:server", bind_config("series", define_webpack_server()));
gulp.task("webpack:watch", bind_config("series", define_webpack_watch()));
gulp.task("webpack:build", bind_config("series", define_webpack_build()));
// browser
gulp.task("browser", bind_config("series", define_browsersync()));
gulp.task('observe', bind_config("series", define_observe()));
// basic exports
gulp.task('build', gulp.series('webpack:build'));
gulp.task('pack', gulp.series('clean', 'build'));
gulp.task('watch', gulp.series('pack', 'observe'))
gulp.task('default', gulp.series('watch', 'browser'));