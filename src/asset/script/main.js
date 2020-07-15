
console.log("asset/script/main.js is loaded.");

import Readable from '../../audio-attach';

export default class Bon {

  fire(){
    new Readable({
      selector: ".readable-paragraph",
      icon_html: '<i class="fas fa-volume-off"></i>',
      icon_class_active: "fa-volume-up",
      icon_class_inactive: "fa-volume-off",
    });
  }

}