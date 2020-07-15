const C = require("./workspace.config.js");

module.exports = {

  nunjucks: (nunjucks, o) => {
    nunjucks.configure("./" + C.ENTRY + "/" + C.PAGE.BASEDIR, {
      noCache: !C.TEMPLATE.CACHE,
      tags: {
        blockStart: C.TEMPLATE.TAG_OPEN + '%',
        blockEnd: '%' + C.TEMPLATE.TAG_CLOSE,
        variableStart: C.TEMPLATE.TAG_OPEN + '{',
        variableEnd: '}' + C.TEMPLATE.TAG_CLOSE,
        commentStart: C.TEMPLATE.TAG_OPEN + '#',
        commentEnd: '#' + C.TEMPLATE.TAG_CLOSE
      }
    });
    return nunjucks;
  }

}