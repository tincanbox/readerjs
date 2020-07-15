let webpack_config = require('./webpack.config.js');

module.exports = (opt) => {

  if (opt) {
    // --mode
    if(opt.mode) webpack_config.mode = opt.mode;
  }

  return webpack_config;

}