import { ComponentBase } from "@app/game";
import { Sprite, Container, Texture, Graphics } from "pixi.js";
import { Resources } from "@app/utils/resources.utils";
import { ComponentType } from "@app/core/component.core";


export class SpriteComponent extends ComponentBase<Sprite> {
  
  constructor(props?:ComponentType<Sprite>) {
    super(props);
  }

  anchor(x:number, y?:number):SpriteComponent {
    this.element.anchor.set(x,y);
    return this;
  }
  texture(sprite:string, spritesheet?:string):SpriteComponent {
    this.element.texture = Resources.getTexture(sprite,spritesheet);
    return this;
  }
  mask(graph:Graphics):SpriteComponent {
    this.element.mask = graph;
    return this;
  }

  fromTexture(tex:Texture):SpriteComponent {
    this.element.texture = tex;
    return this;
  }
  fromImage(url:string):SpriteComponent {
    this.element.texture = Texture.fromImage(url);
    return this;
  }

  protected create():void {
    this._element = new Sprite();
    Object.assign(this._element, this.properties.element);
  }

  onAddToParent(value:Container):void {
    value.addChild(this.element);
    if(this.element.mask) {
      value.addChild(this.element.mask);
    }
  }

  onPostCreate():void {

  }
  
  
}