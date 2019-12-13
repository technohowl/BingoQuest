
import { 
  ContainerComponent,
} from '@app/game'
import { ComponentType, ComponentBase } from '@app/core/component.core';
import { Container, Point } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { GameModelData } from '@models/game-model.data';


export class BingoCounterComponent extends ContainerComponent {

  constructor(props?:ComponentType<Container>) {
    super(Object.assign(props, {
      children: [
        new SpriteComponent({
          element: {
            
          }
        }).anchor(0.5).texture('marker-top', 'content'),
        new SpriteComponent({
          element: {
            position: new Point(-40, -6),
            scale: new Point(0.5,0.5)
          }
        }).anchor(0.5).texture('bingo-line', 'content'),
        new BitmapTextComponent({
          tag: ['text-value'],
          element: {
            position: new Point(8, -7),
            text: GameModelData.instance.bingos.toString(),
            font: '34px lobster',
            tint: 0xEEEEEE,
            anchor: new Point(0,0.5)
          }
        }).on('text-value', (comp:ComponentBase, value:number) => {
          (comp as BitmapTextComponent).text(value.toString());
        })
      ]
    }));

    GameModelData.instance.on('bingos', (value:number) => {
      this.emitToChildren('text-value', 'text-value', value);
    })

  }

  onPostCreate():void {

    

  }

}