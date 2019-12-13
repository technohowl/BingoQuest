// import { Sprite, loader } from 'pixi.js';
import { EventEmitter } from 'events';

export class EventManager extends EventEmitter {

  private static instance:EventManager;
  
  private constructor() {
    super();
    this.setMaxListeners(20);
  }

  public static get Instance():EventManager {
    if(this.instance == null) {
      this.instance = new EventManager();
    }
    return this.instance;
  }

  on(event: string | symbol, listener: (...args: any[]) => void):this {
    return super.on(event, listener);
  }
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }

}