import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import { TweenMax, Bounce } from 'gsap';
import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import {SoundController} from "@app/controller/sound.controller";

export type BoardPieceType = 'active' | 'clicked';

export type BoardPieceProps = {
  value:number,
  isValidNumber:(value:number) => boolean,
  textureBingo: Texture,
  textureMarked: Texture
}


export class BoardPieceBehavior extends BehaviorBase<BoardPieceType, BoardPieceProps> {

  constructor(props?:BoardPieceProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {

    value.element.interactive = true;
    value.element.buttonMode = true;
    value.element.hitArea = new Rectangle(-22,-22, 44, 44);
    value.element.on('pointertap', () => this.onClick(value));
    value.emitter.on('bingo', () => this.onBingo(value));
    value.emitter.on('bonus', () => this.onBonus(value));
    value.emitter.on('select', () => this.onMarkAsSelected(value))
    this.change('active');
  }

  private onClick(value:ComponentBase):void {
    switch(this.state) {
      case 'active':
        this.onActive(value);
      break;
      case 'clicked':
        // this.onClicked(value);
      break;
    }
  }

  private onBingo(comp:ComponentBase):void {
    const compchild:ComponentBase = comp.getChildWithTag('icon');

    let image:Sprite = (compchild.element as Sprite);

    TweenMax.fromTo(image, 0.2, {alpha: 0}, {alpha: 1, ease: Bounce.easeOut})
    TweenMax.fromTo(image.scale, 0.2, {x: 0.1, y: 0.1}, {x: 0.4, y: 0.4, ease: Bounce.easeOut})

    image.texture = this.properties.textureBingo;
    SoundController.instance.audio('sfx').play('collect-item');

  }

  private onBonus(_:ComponentBase):void {

  }
  
  private onActive(value:ComponentBase):void {
    this.bounceEffect(value.getChildWithTag('value').element);
    if(this.properties.isValidNumber(this.properties.value)) {
      this.onMarkAsSelected(value);
      this.change('clicked');
    }
  }

  private onMarkAsSelected(value:ComponentBase):void {

    let image:Sprite = (value.getChildWithTag('icon').element as Sprite);

    image.texture = this.properties.textureMarked;

    TweenMax.from(image, 0.2, {rotation: Math.PI, alpha: 0, ease: Bounce.easeOut})
    TweenMax.from(image.scale, 0.2, {x: 0.1, y: 0.1, ease: Bounce.easeOut})
    
    value.getChildWithTag('background').element.visible = false;
    value.getChildWithTag('value').element.visible = false;
    value.element.interactive = false;
    value.element.buttonMode = false;
    value.emitter.emit('selected');
  }

  private bounceEffect(element:Container):void {
    TweenMax.fromTo(element.scale, 0.2, {x: 1,y: 1}, {x: 1.2, y: 1.2, yoyo: true, repeat: 1, ease: Bounce.easeInOut});
  }

}
