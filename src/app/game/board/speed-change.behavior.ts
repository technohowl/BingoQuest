import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { SpriteComponent } from '@app/components/sprite.component';
import { Container, Point } from 'pixi.js';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';

export type SpeedChangeType = 'active' | 'clicked';

export type SpeedChangeProps = {
  min: number,
  default: number,
  max: number,
  onChange: (value?: number) => void
}

export class SpeedChangeBehavior extends BehaviorBase<SpeedChangeType, SpeedChangeProps> {

  private value: number;
  private text:BitmapTextComponent;

  constructor(props?: SpeedChangeProps) {
    super(props);
    this.value = this.speedValue;
  }

  get speedValue():number {
    return parseInt(window.localStorage.getItem('game-speed')) || this.properties.default;
  }
  set speedValue(value:number) {
    window.localStorage.setItem('game-speed', value.toString());
  }

  protected onSubscribe(value: ComponentBase): void {

    this.createSubTitle(value.element, 0, -30);
    this.createButton(value.element, -70, 0, '-');
    this.createButton(value.element, 70, 0, '+');
    this.createText(value.element);

  }
  createSubTitle(parent: Container, x: number, y: number):void {
    this.text = new BitmapTextComponent({
      parent: parent,
      element: {
        position: new Point(x,y),
        text: 'Speed',
        font: '20px arial',
        tint: 0x333333,
        anchor: new Point(0.5, 0.5)
      }
    })
  }

  createButton(parent: Container, x: number, y: number, text: string): SpriteComponent {
    return new SpriteComponent({
      parent: parent,
      element: {
        position: new Point(x, y),
      },
      children: [
        new BitmapTextComponent({
          element: {
            text: text,
            font: '40px arial',
            tint: 0x555555,
            anchor: new Point(0.5, 0.65)
          }
        }).blendMode(2)
      ],
      behavior: [
        new ButtonBehavior({
          click: () => this.onClickButton(text)
        })
      ],
    }).anchor(0.5).texture('circular-button', 'content');
  }

  private onClickButton(value: string): void {

    if (value === '+') {
      this.value++;
    } else {
      this.value--;
    }
    this.value = Math.max(this.properties.min, Math.min(this.properties.max, this.value))
    this.text.text(this.value.toString());
    this.speedValue = this.value;
    this.properties.onChange( this.value );
  }

  createText(parent:Container): void {
    this.text = new BitmapTextComponent({
      parent: parent,
      element: {
        text: this.speedValue.toString(),
        font: '40px arial',
        tint: 0x333333,
        anchor: new Point(0.5, 0.5)
      }
    })
  }


  get props(): SpeedChangeProps {
    return this.properties;
  }
}
