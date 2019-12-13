import { ComponentBase } from "@app/game";
import { Container, Graphics } from "pixi.js";
import { ComponentType } from "@app/core/component.core";


export class GraphicsComponent extends ComponentBase<Graphics> {
  
  constructor(props?:ComponentType<Graphics>) {
    super(props);
  }
  
  protected create():void {
    this._element = new Graphics();
    Object.assign(this._element, this.properties.element);
  }

  onAddToParent(value:Container):void {
    value.addChild(this.element);
  }

  onPostCreate():void {

  }
    
  draw( callback: (value:Graphics)=>void ):GraphicsComponent {
    callback(this.element);
    return this;
  }
  
}