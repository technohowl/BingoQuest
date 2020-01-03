
import { 
  ContainerComponent,
} from '@app/game'
import { ComponentType, ComponentBase } from '@app/core/component.core';
import { Container, Point } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { GameModelData } from '@models/game-model.data';


export class MoneyCounterComponent extends ContainerComponent {

  constructor(props?:ComponentType<Container>) {
    super(Object.assign(props, {
      children: [
        new SpriteComponent({
          element: {
            
          }
        }).anchor(0.5).texture('marker-top', 'content'),
        new SpriteComponent({
          element: {
            position: new Point(-61, -6),
            scale: new Point(0.35,0.35)
          }
        }).anchor(0.5).texture('coin', 'content'),
        new BitmapTextComponent({
          tag: ['text-value'],
          element: {
            position: new Point(-28, -8),
            text: GameModelData.instance.money.toString(),
              font: '34px lobster',
              tint: 0xEEEEEE,
              anchor: new Point(0,0.5)
          }
        }).on('text-value', (comp:ComponentBase, value:number) => {
          //(comp as BitmapTextComponent).text((value).toString());
          let currentValue:number = +(comp as BitmapTextComponent).element.text;
          console.error("Current money :", currentValue, value);
          this.timerF(currentValue, value, comp);

        })
      ]
    }));


    GameModelData.instance.on('money', (value:number) => {
      //console.warn("GameModelData: money");

      this.emitToChildren('text-value', 'text-value', value);
    })

  }


  // @ts-ignore
  private timerF(value:number, finalValue:number, comp:ComponentBase):void{
    let diff:number = finalValue - value;
    let decr: number = 1;
    if(diff > 50)
      decr = 2;
    else if (diff > 200)
      decr = 5;
    else if (diff > 500)
      decr = 50;
    else if (diff > 1000)
      decr = 100;
    else if (diff > 2000)
      decr = 200;

    if(diff<0){

        (comp as BitmapTextComponent).text((value - decr).toString());
        setTimeout( this.timerF.bind(this, (value - decr), finalValue, comp), 30 );

    }else if(diff>0) {

        (comp as BitmapTextComponent).text((value + decr).toString());
        setTimeout(this.timerF.bind(this, (value + decr), finalValue, comp), 30);

    }
  }

  onPostCreate():void {

    

  }

}
