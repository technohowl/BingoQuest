import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { Texture, Point } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';

export type PowerupCounterType = 'active' | 'counting' | 'completed';

export type PowerupCounterProps = {
    numberOfElements: number,
    textureNormal:Texture,
    textureMarked:Texture
    distance:Point
}


export class PowerupCounterBehavior extends BehaviorBase<PowerupCounterType, PowerupCounterProps> {


  private listItems:SpriteComponent[];
  private counter:number;

  constructor(props?:PowerupCounterProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    value.element.interactive = true;

    this.listItems = [];
    this.counter = 0;

    for(let i = 0; i < this.properties.numberOfElements; i++) {
      this.listItems.push(this.createPowerUp(i));
    }
  }

  private createPowerUp(value:number):SpriteComponent {

    const sprite:SpriteComponent = new SpriteComponent({
      parent: this.targets[0].element,
      element:{
        scale: new Point(0.8,0.8),
        position: new Point(this.properties.distance.x * value, this.properties.distance.y * value),
        texture: this.properties.textureNormal
      }
    })
    return sprite;
  }

  reset():void {
    this.counter = 0;
    this.updateTextures();
  }

  onUpdateCounter():void {
    if(this.counter >= this.properties.numberOfElements) {
      this.change('completed');
      return;
    }

    this.counter++;
    this.updateTextures();
    this.change('counting');
  }
  private updateTextures():void {

    this.listItems.forEach( (value:SpriteComponent, index:number) => {
      value.element.texture = (this.counter <= index) ? this.properties.textureNormal : this.properties.textureMarked;
    })


  }


}
