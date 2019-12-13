import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { Point, interaction, Rectangle } from 'pixi.js';
import { RendererController } from '@app/controller/renderer.controller';

export type ScrollingType = 'active' | 'clicked';

export type ScrollingProps = {
    
}


export class ScrollingBehavior extends BehaviorBase<ScrollingType, ScrollingProps> {

  private originPoint:Point;
  private isPressed:boolean;
  private targetPosition:number;

  constructor(props?:ScrollingProps) {
    super(props);
    this.isPressed = false;
  }

  protected onSubscribe(value:ComponentBase):void {

    value.element.interactive = true;
    value.element.on('pointerdown', (ev:interaction.InteractionEvent) => this.onDown(ev))
    value.element.on('pointerend', (ev:interaction.InteractionEvent) => this.onUp(ev))
    value.element.on('pointerout', (ev:interaction.InteractionEvent) => this.onUp(ev))
    value.element.on('pointerup', (ev:interaction.InteractionEvent) => this.onUp(ev))
    value.element.on('pointermove', (ev:interaction.InteractionEvent) => this.onMove(ev))

  }

  private onDown(ev:interaction.InteractionEvent):void {
    this.targetPosition = ev.currentTarget.position.y;
    this.originPoint = new Point(ev.data.global.x, ev.data.global.y);
    
    this.isPressed = true;
  }
  
  private onUp(_:interaction.InteractionEvent):void {
    this.isPressed = false;
  }

  private onMove(ev:interaction.InteractionEvent):void {
    if(!this.isPressed) {
      return;
    }

    const rect:Rectangle = ev.currentTarget.getBounds();
    
    
    const newPos:number = this.targetPosition + (ev.data.global.y - this.originPoint.y);
    
    if(RendererController.Instance.screen.y+newPos <= 0 || newPos - RendererController.Instance.screen.y >= rect.height) {
      return;
    }
    
    ev.currentTarget.position.y = newPos;

  }

  get position():Point {
    return this.originPoint;
  }

}