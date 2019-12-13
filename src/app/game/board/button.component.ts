
import { ComponentType, ComponentBase } from '@app/core/component.core';
import { Point, Sprite } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';


export class ButtonComponent extends SpriteComponent {

  private callback:()=>void;

  constructor(props?: ComponentType<Sprite>, icon?: Partial<Sprite>, textData?: Partial<BitmapTextComponent>) {
    super(Object.assign(props, {
      children: [
        new SpriteComponent({
          element: Object.assign({}, icon),
          tag: ['sprite'],
        }).anchor(0.5),
        new BitmapTextComponent({
          tag: ['text'],
          element: Object.assign({
            text: '',
            font: '30px arial',
            tint: 0x555555,
            anchor: new Point(0.5, 0.65)
          }, textData)
        }).blendMode(2)
        .on('text', (self:ComponentBase,value:string) => (self as BitmapTextComponent).text(value))
      ],
      behavior: [
        new ButtonBehavior({
          click: () => this.onClickAction()
        })
      ]
    }));
    this.anchor(0.5);
    this.texture('button', 'content');
  }
  
  text(value:string):ButtonComponent {
    this.emitToChildren('text', 'text', value);
    return this;
  }

  AddCallback( callback:() => void ):ButtonComponent {
    this.callback = callback;
    return this;
  }

  private onClickAction():void {
    if(!this.callback) {
      return;
    }
    this.callback();
  }

  onPostCreate(): void {



  }

}
