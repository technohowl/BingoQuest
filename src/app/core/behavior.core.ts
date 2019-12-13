import { ComponentBase } from "../game";

export abstract class BehaviorBase<T = any, TProp = any> {
  
  private _state:T;
  private stateCallbacks:Map<T, Set<()=>void>>;
  protected targets:ComponentBase[];
  protected properties:TProp;
  
  constructor(props?:TProp) {
    this.stateCallbacks = new Map();
    this.targets = [];
    this.properties = props;
  }

  protected abstract onSubscribe(value:ComponentBase):void;

  get name():string {
    return this['constructor'].name.toString();
  }

  subscribe(value:ComponentBase):void {
    this.targets.push(value);
    this.onSubscribe(value);
  }
  
  get state():T {
    return this._state;
  }

  change(value:T):void {
    this._state = value;
    this.triggerStateEvent(this._state);
  }

  private triggerStateEvent(value:T):void {
    if(!this.stateCallbacks.has(value)) {
      return;
    }
    this.stateCallbacks.get(value).forEach( (callback) => callback() );
  }

  on(value:T, callback: () => void):BehaviorBase {
    if(!this.stateCallbacks.has(value)) {
      this.stateCallbacks.set(value, new Set());
    }
    this.stateCallbacks.get(value).add(callback);
    return this;
  }

  off(value:T, callback: () => void):void {
    if(!this.stateCallbacks.has(value)) {
      return;
    }
    this.stateCallbacks.get(value).delete(callback);
  }

  destroy():void {
    this.stateCallbacks.clear();
    this.targets = [];
  }
  
}