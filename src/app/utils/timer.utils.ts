import { ticker, settings } from 'pixi.js'
import { EventEmitter } from 'events';

/**
 * RendererManager.js
 *
 * The main entry point, appends PIXI to the DOM
 *
 */
export class TimeEvent {

    id:symbol;
    callback: () => void;
    timeCounter:number;
    timeInterval:number;
    repeatCounter:number;
    repeatTotal:number;
    isRunning:boolean;


  constructor(callback:any, timeInterval:number = 1000, repeatTotal:number = 0) {

    this.id = Symbol('id')
    this.callback = callback
    this.repeatTotal = repeatTotal
    this.repeatCounter = 0
    this.timeCounter = 0
    this.timeInterval = timeInterval
    this.isRunning = true

  }

  update(time:number) {
    if(!this.isRunning) {
      return false
    }

    this.timeCounter += time
    if(this.timeCounter >= this.timeInterval) {
      try {
        this.callback()
      } catch(e) {
        console.log(e)
        return false
      }
      if(this.repeatCounter >= this.repeatTotal) {
        this.isRunning = false
        return false
      }
      this.repeatCounter++
      this.timeCounter -= this.timeInterval
    }
    return true
  }
}


export class Timer extends EventEmitter {

  events:Map<symbol,any>;  
  private static instance:Timer;
  private _paused:boolean;

  constructor() {
    super()
    this.events = new Map()
    ticker.shared.add( this.update, this )
  }

  public static get Instance():Timer {
    if(this.instance == null) {
      this.instance = new Timer();
    }
    return this.instance;
  }

  public setTimeout(callback:any, time = 1000):TimeEvent {
    if(time <= 0) {
      callback()
      return null
    }
    return this.setInterval(callback, time, 0)
  }

  public clear(id:symbol):void {
    if(id) {
      this.events.delete(id)
    } else {
      this.events.clear()
    }
  }

  public setInterval(callback:any, time = 1000, repeat = 0):TimeEvent {

    const _repeat = (repeat < 0) ? Infinity : repeat
    const timeEvent = new TimeEvent(callback, time, _repeat)

    this.events.set( timeEvent.id, timeEvent )

    return timeEvent
  }

  private update(time:number):void {
    if(this._paused) {
      return;
    }

    this.events.forEach( (value:any, _:symbol) => {
      if( !value.update( time / settings.TARGET_FPMS ) ) {
        this.events.delete( name )
      }
    })

  }

  set paused(value:boolean) {
    this._paused = value;
  }
  get paused():boolean {
    return this._paused;
  }

}