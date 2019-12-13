import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { Container, Point, Sprite } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { ContainerComponent } from '@app/components/container.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';

export type PieceCounterType = 'active' | 'clicked';

export type PieceCounterProps = {
    
}


export class PieceCounterBehavior extends BehaviorBase<PieceCounterType, PieceCounterProps> {

  private listDots:Map<number, ContainerComponent>;

  constructor(props?:PieceCounterProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    value.element.interactive = true;

    this.listDots = new Map();
    this.createList(value.element);

  }

  createList(parent:Container):void {

    for(let i = 1; i <= 75; i++) {
        this.createDot(i, parent);
    }

  }

  createDot(value:number, parent:Container):void {

    let countPos = value-1;

    const cont:ContainerComponent = new ContainerComponent({
        parent: parent,
        element: {
          position: new Point(countPos%3 * 20, -50 + Math.ceil(value/3) * 20),
        },
        children: [
          new SpriteComponent({
            tag: ['ball'],
            element: {
              scale: new Point(1,1),
              tint: 0xaaaaaa
            }
          }).texture(this.getBallTexture(value), 'content')
          .anchor(0.5),
          new BitmapTextComponent({
            tag: ['text'],
            element: {
              visible: false,
              position: new Point(0,0),
              text: value.toString(),
              font: '10px arial',
              // 0x111111
              tint: 0xEEEEEE,
              anchor: new Point(0.5,0.5),
            }
          })
        ]
    });
    this.listDots.set(value, cont);
  }

  onReiceveValue(value:number):void {
    (this.listDots.get(value).getChildWithTag('ball').element as Sprite).tint = 0x444444;
    this.listDots.get(value).getChildWithTag('text').element.visible = true;

  }

  private getBallTexture(value:number):string {
      if(value <= 15) {
        return 'ball-1-small';
      } else if(value <= 30) {
        return 'ball-2-small';
      } else if(value <= 45) {
        return 'ball-3-small';
      } else if(value <= 60) {
        return 'ball-4-small';
      } else {
        return 'ball-5-small';
      }
  }

}
