// This is shared-configuration between Gulp and Webpack
//
// ==== A Notion for Windows ====
// DONT use \ backslash as a path-separator.
// the backslashes will be escaped with \\
// and glob-module wont be able to find path properly.

module.exports = {

  // Adjust src/dist path accordingly.
  // glob(./src/*.js),or .ts is an entry point.
  // DONT put "./" thing.
  ENTRY: "src",

  DEST: "dist",

  // Pages Generator
  PAGE: {
    BASEDIR: "template",
    FAVICON: "asset/favicon.png",
    DEFAULT: {
      // Default `data` will be merged with each TARGET page's data.
      data: {
        title: "WEBAPP",
        description: "This is a sample."
      }
    },
    TARGET: {
      // If you dont use HTML generator, just remove this entry.
      "index.njk": {
        data: {}
      }
    }
  },

  // As default, Nunjucks and Vue template syntax is conflicted with tag opener & closer.
  // If you need to write Vue template in Nunjucks templates, change this tag confs.
  TEMPLATE: {
    CACHE: false,
    TAG_OPEN: "{",
    TAG_CLOSE: "}"
  },

  // Gulp-GLOB and Webpack.exclude, both use this.
  EXCLUDE: [
    'node_modules',
    '/vendor/',
    '/log/',
    '.log$',
    '/cache/'
  ],

  ASSET_GLOB: {
    TEMPLATE: "**/*.{njk,hbs}",
    HTML: "**/*.{html,htm}",
    VIEW: "**/*.{vue,react}",
    STYLE: "**/*.{scss,sass,css}",
    SCRIPT: "**/*.{ts,js}",
  }

};