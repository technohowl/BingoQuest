import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { TweenMax, Circ } from 'gsap';
import { Container } from 'pixi.js';
import { Helper } from '@app/utils/helper.utils';

export type SpinningType = 'active' | 'spinning' | 'completed';

export type SpinningProps = {
    stops: number[],
}

export class SpinningBehavior extends BehaviorBase<SpinningType, SpinningProps> {


  private result:number;

  constructor(props?:SpinningProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    value.element.interactive = true;
    value.element.buttonMode = true;
    value.element.on('pointertap', () => this.onBeginSpin(value.element))
    this.change('active');
  }

  private onBeginSpin(element:Container):void {
    if(this.state !== 'active') {
      return;
    }
    element.interactive = false;
    element.buttonMode = false;

    this.result = Helper.RandomInt(0, this.properties.stops.length-1);

    
    const finalAngle:number = Helper.DegreeToRad(this.properties.stops[this.result] + 360 * 3);

    this.change('spinning');
    
    new TweenMax(element, 3, { rotation: -finalAngle, ease: Circ.easeOut, onComplete: () => this.onStopSpin()});
  }


  private onStopSpin():void {
    this.change('completed');
  }

  get spinResult():number {
    return this.result;
  }

}
