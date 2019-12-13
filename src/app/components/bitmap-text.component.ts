import { extras, Container, DisplayObject, Sprite } from 'pixi.js';
import { ComponentBase, ComponentType } from '@app/core/component.core';




export class BitmapTextComponent extends ComponentBase<extras.BitmapText> {

  private blendModeValue:number;

  constructor(prop?:ComponentType<extras.BitmapText>) {
    super(prop);
    this.blendModeValue = 0;
  }

  create():void {
    this._element = new extras.BitmapText('', {font: this.properties.element.font});
    Object.assign(this._element, this.properties.element);
  }
  
  onAddToParent(value:Container):void {
    value.addChild(this.element);
    this._element.updateTransform();
    this.updateBlendMode();
  }

  protected onPostCreate():void {

  }
  blendMode(value:number):BitmapTextComponent {
    this.blendModeValue = value;
    this.updateBlendMode();
    return this;
  }
  private updateBlendMode():void {
    this._element.children.forEach( (elem:DisplayObject) => {
      (elem as Sprite).blendMode = this.blendModeValue;
    });
  }
  
  text(value:string):BitmapTextComponent {
    this._element.text = value;
    this.updateBlendMode();
    return this;
  }

}