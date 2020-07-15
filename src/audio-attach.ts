/* 
 * Requires $ definition.
 */


 /**
  * ReaderJS's Option definition.
  * @constructor
  */
class Option {
  selector: string;
  attr_state_init: string;
  attr_audio_url: string;
  class_active: string;
  icon_selector: string;
  icon_html: string;
  icon_class_active: string;
  icon_class_inactive: string;
  callback_active: Function;
  callback_inactive: Function;
}

/**
 * Queued state-handler.
 * @constructor
 */
class Playing {
  url: string;
  element: JQuery;
  audio: HTMLAudioElement;
}

/**
 * Minimum event definition.
 * @constructor
 */
class EventSurrogation {
  type: string;
  target: HTMLElement;
  touches?: [TouchEvent]
}

/**
 * Main constructor.
 * @constructor
 */
export default class ReaderJS {

  private config: Option;
  public playing: Playing;

  constructor(option?: Option) {
    this.init(option);
  }

  /**
   * Instance initializer. Should be called once.
   * @param option 
   */
  private init(option?: Option) : void {
    this.refresh(option);

    $('body').on('click touch', this.config.selector,
      (e) => { this.signal_activation(e) });
  }

  /**
   * (Re)Applies Option properties to `this.config`.
   * @param o Option
   */
  private apply_config(o?: Option) : void {
    this.config = this.config || new Option();

    let d = {
      "attr_state_init": "data-audio-gui-initialized",
      "attr_audio_url": "data-audio-url",
      "class_active": "audio-attach-active",
      "selector": ".audio-attach-paragraph",
      "icon_selector": ".audio-state-icon",
      "icon_html": "<b>▶️</b>",
      "icon_class_active": "audio-status-active",
      "icon_class_inactive": "audio-status-inactive",
      "callback_active": ((playing: Playing) => { }),
      "callback_inactive": ((playing: Playing) => { }),
    };
    for(let k in d) this.config[k] = o[k] || d[k];
  }

   /**
    * Collects target jQuery objects.
    * @param void
    */
  private collect_target() : Array<JQuery> {
    let els: Array<JQuery> = [];
    $(this.config.selector).each((i, e) => { els.push($(e)); });
    return els;
  }

  /**
   * UI builder for each paragraph.
   * @param el 
   */
  private build_paragraph(el: JQuery) : ReaderJS {
    let ak = this.config.attr_state_init;
    if (!el.attr(ak)) this.render_paragraph(el);
    el.attr(ak, "true");
    return this;
  }

  /**
   * 
   * @param el Target JQuery object
   */
  private render_paragraph(el: JQuery) : void {
    if(!el.attr(this.config.attr_state_init)){
      this.render_status_icon(el);
    }
  }

  /**
   * 
   * @param el 
   * @mutable
   */
  private render_status_icon(el:JQuery) : void {
    let anc = $(this.config.icon_html);
    anc.addClass(this.config.icon_selector.replace(/^\./, ""));
    el.prepend(anc);
  }

  /**
   * Redirects 'click' action to audio queue.
   * @param event = Event object from 'click' event.
   */
  private signal_activation(event: EventSurrogation) : Promise<ReaderJS|never> {
    if (event.touches && (event.touches.length > 1 || (event.type == "touchend" && event.touches.length > 0))) return;
    let elm = $(event.target);
    let ini = elm.attr(this.config.attr_state_init);
    if (!ini) throw new Error("Not initialized properly.");

    return this.queue(elm).then((R) => R.play()).catch((e) => {console.error(e.message); return e;});
  }

  /**
   * Generates new Playing queue object.
   * Finishes forcefully with 'void' return.
   * @param elm = Initiated target JQuery Object
   */
  private generate_queue( elm:JQuery ) : Playing | void {
    let url = elm.attr(this.config.attr_audio_url);
    if (!url || !url.length) throw new Error("Invalid Audio URL");

    if(this.playing){
      let pr = this.playing.url;
      this.stop();
      if (pr == url) return;
    }

    return this.generate_playing_state(elm, url);
  }

  /**
   * Generates active playing state object with JQuery object.
   * @param elm 
   * @param url 
   */
  private generate_playing_state(elm:JQuery, url:string) : Playing {
    this.playing = {
      element: elm,
      url: url,
      audio: new Audio(url)
    }
    return this.playing;
  }

  private listen(target: {addEventListener:Function}, evs:Array<[string, Function]>) : void {
    evs.forEach((l) => {
      target.addEventListener(l[0], l[1], false);
    });
  }

  //====================
  // Public methods
  //====================

  /**
   * 
   * @param option 
   */
  refresh(option:Option) : ReaderJS {
    this.stop();
    this.apply_config(option);
    this.collect_target().forEach((el) => this.build_paragraph(el));
    return this;
  }

 /**
   * Queues new Audio by referenced by jQuery element.
   * ( Object<JQuery>
   * ) -> Promise
   * 
   * @param elm 
   * @mutable
   */
  queue(elm:JQuery) : Promise<ReaderJS|never> {
    return new Promise((res, rej) => {
      try {
        if (this.generate_queue(elm)) {
          this.listen(this.playing.audio, [
            ['canplaythrough', () => res(this)],
            ['error', (e) => rej(e)]
          ]);
        }
      } catch (e) {
        rej(e);
      }
   });
  }

  /**
   * 
   * @mutable
   */
  play() : Promise<ReaderJS|never> {
    return new Promise((res, rej) => {
      try {
        if (this.playing) {
          this.listen(this.playing.audio, [['ended', () => { this.stop(); res(this); }]])
          this.playing.audio.play();
          this.playing.element.addClass(this.config.class_active);
          this.playing.element.find(this.config.icon_selector).removeClass(this.config.icon_class_inactive);
          this.playing.element.find(this.config.icon_selector).addClass(this.config.icon_class_active);
        }
      } catch (e) {
        this.playing = null;
        rej(e);
      }
    });
  }

  /**
   * 
   * @mutable
   */
  stop() : Promise<ReaderJS|never> {
    return new Promise((res, rej) => {
      try {
        if (this.playing) {
          // Resets audio states for GC
          this.playing.audio.pause();
          this.playing.audio.currentTime = 0;
          this.playing.audio = null;
          this.playing.element.removeClass(this.config.class_active);
          this.playing.element.find(this.config.icon_selector).removeClass(this.config.icon_class_active);
          this.playing.element.find(this.config.icon_selector).addClass(this.config.icon_class_inactive);
          this.playing.element = null;
        }
        res(this);
      } catch (e) {
        rej(e);
      } finally {
        this.playing = null;
      }
    });
  }

}