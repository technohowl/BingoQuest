
import {
  StateContainer,
  RendererController,
  EventManager
} from '@app/game'
import { Helper } from '@app/utils/helper.utils';
import { GameModelData } from '@models/game-model.data';
import { Background } from '@app/components/background.component';
import { SpriteComponent } from '@app/components/sprite.component';
import { Point } from 'pixi.js';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { TweenMax, Sine } from 'gsap';
import { SoundController } from '@app/controller/sound.controller';


export class IntroScene extends StateContainer {

  bingo: SpriteComponent;

  constructor() {

    super()

  }

  protected init(): void {


    const background: Background = new Background();
    this.addChild(background);

    this.bingo = new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0, -100)
      },
      children: [
        new SpriteComponent({
          element: {
            position: new Point(0, 0),
            scale: new Point(0.8, 0.8)
          }
        }).anchor(0.5).texture('title', 'content')
      ]
    }).anchor(0.5).texture('title-bg', 'content');

    TweenMax.fromTo(this.bingo.element, 5, { y: -105 }, { y: -95, repeat: -1, yoyo: true, ease: Sine.easeInOut });

    this.createContinuebutton();

    RendererController.Instance.resizeHandler();
  }

  private createContinuebutton(): void {
    new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0, 150),
      },
      children: [
        new BitmapTextComponent({
          element: {
            text: 'Play',
            font: '32px arial',
            tint: 0x555555,
            anchor: new Point(0.5, 0.65)
          }
        }).blendMode(2)
      ],
      behavior: [
        new ButtonBehavior({
          click: () => this.onStartGame()
        })
      ],
    }).anchor(0.5).texture('button', 'content');
  }

  onStartGame(): void {
    SoundController.instance.audio('sfx').play('collect');

    TweenMax.killTweensOf(this.bingo.element);

    const timeDiff: number = Helper.getTimeInHours(Date.now()) - Helper.getTimeInHours(GameModelData.instance.lastTime);

    if (timeDiff > 6) {
      EventManager.Instance.emit('change-state', 'daily');
    } else {
      EventManager.Instance.emit('change-state', 'map');
    }

  }

}