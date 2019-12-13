import { Container } from "pixi.js";
import { BehaviorBase } from "../game";
import { EventEmitter } from "events";

export type ComponentType<T> = {
  element?:Partial<T>,
  parent?:Container,
  tag?:string[],
  children?:ComponentBase[],
  behavior?:BehaviorBase[]
}

export abstract class ComponentBase<T extends Container = Container> {
  
  protected properties:ComponentType<T>;
  protected _element:T;
  protected _emitter:EventEmitter;

  constructor(props:ComponentType<T> = {}) {
    this._emitter = new EventEmitter();
    this.properties = props;
    this.initialize();
    
  }

  protected initialize():void {
    this.properties.children = this.properties.children || [];
    this.properties.behavior = this.properties.behavior || [];
    this.properties.tag = this.properties.tag || [];
    this.create();
    this.renaming();
    this.iterateChildren();
    this.iterateBehaviors();
    this.onPostCreate();
  }
  private renaming():void {
    this.element.name = this.name;
    if(this.properties.parent) {
      this.properties.parent.addChild(this.element);
    }
  }

  protected abstract create():void;
  protected abstract onPostCreate():void;

  protected iterateChildren():void {
    this.properties.children.forEach( (value:ComponentBase) => {
      value.onAddToParent(this._element);
    })
  }

  abstract onAddToParent(value:Container):void;

  protected iterateBehaviors():void {
    this.properties.behavior.forEach( (value:BehaviorBase) => {
      value.subscribe(this);
    })
  }

  addChild(value:ComponentBase):void {
    this.properties.children.push(value);
    value.onAddToParent(this._element);
  }
  addChildren(values:ComponentBase[]):void {
    values.forEach( (elem:ComponentBase) => this.addChild(elem) );
  }

  addBehavior(value:BehaviorBase):void {
    this.properties.behavior.push(value);
    value.subscribe(this);
  }

  getChildWithTag(value:string):ComponentBase {
    return this.properties.children.find( (comp:ComponentBase) => comp.hasTag(value) );
  }

  emitToChildren(tag:string, name:string, ...value:any[]) {
    (this.hasTag(tag)) && this.emitter.emit(name, ...value);
    this.properties.children.forEach( (comp:ComponentBase) => {
      // (comp.tag === tag) && comp.emitter.emit(name, ...value);
      comp.emitToChildren(tag, name, ...value);
    })
  }

  destroy():void {
    this.element.destroy();
  }
  
  get name():string {
    return this['constructor'].name.toString();
  }
  hasTag(value:string):boolean {
    return this.properties.tag.indexOf(value) >= 0;
  }

  get element():T { return this._element }

  get emitter():EventEmitter {
    return this._emitter;
  }
  
  on(value:string, listener: (self:ComponentBase, ...args:any[]) => void ):ComponentBase {
    this.emitter.on(value, (...args:any[]) => listener(this, ...args) );
    return this;
  }

  react( emit:EventEmitter, name:string, callback: (self: this, ...value:any[]) => void ):ComponentBase {

    emit.on(name, (...args:any[]) => callback(this,...args));
    return this;
  }
  get totalBehaviors():number {
    return this.properties.behavior.length;
  }
  get behaviors():BehaviorBase[] {
    return this.properties.behavior;
  }
  
}