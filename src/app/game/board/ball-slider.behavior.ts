import { TweenMax, Elastic } from 'gsap';
import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { Point } from 'pixi.js';
import { ContainerComponent } from '@app/components/container.component';
import { Helper } from '@app/utils/helper.utils';
import {Resources} from "@app/utils/resources.utils";


export type BallSliderStates = 'stopped' | 'generating' | 'finished' | 'waiting';

export type BallSliderProps = {
  quantity: number,
  eventName: string
}


export class BallSliderBehavior extends BehaviorBase<BallSliderStates, BallSliderProps> {

  private ballList:ContainerComponent[];
  
  constructor(props?: BallSliderProps) {
    super(props);
    // EventManager.Instance.on(GameEvents.GET_NUMBER, (value, total) => this.onGetNumber(value,total));
  }

  protected onSubscribe(value:ComponentBase):void {
    this.initializeBalls();
    value.emitter.on(this.properties.eventName, (newvalue:number) => this.onGenerateNew(newvalue));
  }

  onGenerateNew(value:number):void {
    this.removeExtraBalls();
    this.moveAllBalls();
    this.ballList.push(this.createBall(value));
  }
  
  initializeBalls():void {
    this.ballList = [];
  }

  createBall(value:number):ContainerComponent {
    const ball:ContainerComponent = new ContainerComponent({
      parent: this.targets[0].element,
      element: {
        position: new Point(-90,0)
      },
      children:[
        new SpriteComponent({
          element: {
            scale: new Point(0.75, 0.75),
            texture: Resources.getTexture(this.getBallByValue(value)),
            position: new Point(0, 0),
          }
        }).anchor(0.5),
        /*new BitmapTextComponent({
          element: {
            position: new Point(-8, 0),
            text: this.getFormattedValue(value),
            font: '22px arial',
            tint: 0x000000,
            anchor: new Point(1,0.6)
          }
        }),*/
        new BitmapTextComponent({
          element: {
            position: new Point(0, 7),
            text: Helper.numPad(value),
            font: '35px arial',
            tint: 0x000000,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    });

    this.applyAppearEffect(ball);

    return ball;
  }

  // @ts-ignore
  private getFormattedValue(value:number):string {
    if(value <= 15) {
      return `B`;
    } else if(value <= 30) {
      return `I`;
    } else if(value <= 45) {
      return `N`;
    } else if(value <= 60) {
      return `G`;
    } else {
      return `O`;
    }
  }

  getBallByValue(value:number):string {
    if(value <= 15) {
      //return 'ball-1';
      return 'b';
    } else if(value <= 30) {
      //return 'ball-2';
      return 'i';
    } else if(value <= 45) {
      //return 'ball-3';
      return 'n';
    } else if(value <= 60) {
      //return 'ball-4';
      return 'g';
    } else {
      //return 'ball-5';
      return 'o';
    }
  }

  private applyAppearEffect(value:ContainerComponent):void {

    TweenMax.fromTo(value.element, 0.2, {alpha:0}, {alpha: 1});
    TweenMax.fromTo(value.element.scale, 0.3, {x:0, y: 0}, {x: 0.55, y:0.55, ease: Elastic.easeOut});

  }

  moveAllBalls():void {
    TweenMax.to(
      this.ballList.map( (comp:ContainerComponent) => comp.element ),
    0.5, {x: '+=47'})
  }

  removeExtraBalls():void {
    if(this.ballList.length >= this.properties.quantity) {
      const ball:ContainerComponent = this.ballList.shift();
      ball.destroy();
    }
  }

}
