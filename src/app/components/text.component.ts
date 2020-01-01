import {  Container, DisplayObject, Sprite } from 'pixi.js';
import { ComponentBase, ComponentType } from '@app/core/component.core';




export class TextComponent extends ComponentBase<PIXI.Text> {

  private blendModeValue:number;

  constructor(prop?:ComponentType<PIXI.Text>) {
    super(prop);
    this.blendModeValue = 0;
  }
  anchor(x:number, y?:number):TextComponent {
    this.element.position.set(x,y);
    return this;
  }
  create():void {

    // @ts-ignore
    this._element = new PIXI.Text('', this.properties.element.style);
    Object.assign(this._element, this.properties.element);
  }
  
  onAddToParent(value:Container):void {
    value.addChild(this.element);
    this._element.updateTransform();
    this.updateBlendMode();
  }

  protected onPostCreate():void {

  }
  blendMode(value:number):TextComponent {
    this.blendModeValue = value;
    this.updateBlendMode();
    return this;
  }
  private updateBlendMode():void {
    this._element.children.forEach( (elem:DisplayObject) => {
      (elem as Sprite).blendMode = this.blendModeValue;
    });
  }
  
  text(value:string):TextComponent {
    this._element.text = value;
    this.updateBlendMode();
    return this;
  }

}
