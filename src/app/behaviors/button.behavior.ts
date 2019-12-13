import { BehaviorBase } from "@app/core/behavior.core";
import { ComponentBase } from "@app/core/component.core";
import { Texture, Sprite } from "pixi.js";
import { Helper } from "@app/utils/helper.utils";
import { TweenMax } from "gsap";


export type ButtonState = 'idle' | 'over' | 'down' | 'disabled'

export type ButtonBehaviorType = {
  idle?: Texture,
  over?: Texture,
  disabled?: Texture,
  pressed?: Texture,
  useTweenEffect?: boolean,
  click?: (comp?:ComponentBase, behav?:ButtonBehavior) => void
}

export class ButtonBehavior extends BehaviorBase<ButtonState, ButtonBehaviorType> {
 
  private buttonScale:number;

  constructor(props:ButtonBehaviorType) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    value.element.interactive = true;
    value.element.buttonMode = true;
    value.element.on('pointerdown', () => this.onDown(value));
    value.element.on('pointerover', () => this.onOver(value));
    value.element.on('pointerout', () => this.onOut(value));
    value.element.on('pointertap', () => this.onClick(value));

    this.buttonScale = value.element.scale.x;

  }

  private onClick(value:ComponentBase):void {
    
    if(this.properties.useTweenEffect !== false) {
      TweenMax.fromTo(this.targets[0].element.scale, 0.1, 
        {x: this.buttonScale, y: this.buttonScale},
        {x: this.buttonScale*1.1, y: this.buttonScale*1.1, yoyo: true, repeat: 1}
      );
    }
    this.properties.click(value, this);
  }
  
  private onOut(component:ComponentBase):void {
    if(this.state === 'disabled') {
      return;
    }

    Object.assign(component.element as Sprite, Helper.getPropertyIfNotNull('texture', this.properties.idle))
    this.change('idle');
  }

  private onDown(component:ComponentBase):void {
    if(this.state === 'disabled') {
      return;
    }
    
    Object.assign(component.element as Sprite, Helper.getPropertyIfNotNull('texture', this.properties.pressed))
    this.change('down');
  }

  private onOver(component:ComponentBase):void {
    if(this.state === 'disabled') {
      return;
    }
    Object.assign(component.element as Sprite, Helper.getPropertyIfNotNull('texture', this.properties.over))
    this.change('over');
  }

  onDisabled(element:Sprite):void {
    element.interactive = false;
    element.texture = this.properties.disabled || element.texture;
    this.change('disabled');
  }
}