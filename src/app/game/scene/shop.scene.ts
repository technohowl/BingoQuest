
import {
  StateContainer,
  RendererController,
  EventManager
} from '@app/game';
import { Background } from '@app/components/background.component';
import { SpriteComponent } from '@app/components/sprite.component';
import { Point } from 'pixi.js';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { ContainerComponent } from '@app/components/container.component';
import { ButtonComponent } from '../board/button.component';
import { LocaleHelper } from "@app/components/locale.componenet";
import {ShopBehavior} from "@app/game/shop/shop.behavior";


export class ShopScene extends StateContainer {

  matchesTab: ContainerComponent;
  leaderboard: ShopBehavior;

  matchesButton:ButtonComponent;
  leaderboardButton:ButtonComponent;

  constructor() {

    super()

  }

  protected init(): void {


    const background: Background = new Background();
    this.addChild(background);

    new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0,0)
      },
      children: [
        new BitmapTextComponent({
          element: {
            position: new Point(0, -193),
            text: "Buy Coins", //'Powerups Selection',
            font: '34px lobster',
            tint: 0x333333,
            anchor: new Point(0.5,0.5)
          }
        }),
        new BitmapTextComponent({
          element: {
            position: new Point(0, -105),
            text: "", //'Buy up to 3 powerups\nwith your coins and powers\npopup with powers icon.',
            align: 'center',
            font: '20px arial',
            tint: 0x4ce9fd,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    }).anchor(0.5).texture('game-modal', 'background');

    //this.saveLeaderboardData();

    //this.createDefaultTab();

    //this.createBackgroundModel();

    this.createLeaderboard();


    this.createContinuebutton();

    // this.onClickLeaderboard();
    this.onClickMatches();

    RendererController.Instance.resizeHandler();
  }



  private onClickMatches():void {
   }

  /*private onClickLeaderboard():void {
    this.leaderboardButton.element.tint = 0xffffff;
    this.matchesButton.element.tint = 0xaaaaaa;

    this.matchesTab.element.visible = false;
    this.leaderboard.show();
  }*/

  private createLeaderboard():void {

    this.leaderboard = new ShopBehavior();

    new ContainerComponent({
      parent: this,
      element: {
        visible: false,
      },
      behavior: [
        this.leaderboard
      ]
    });

  }

  private createContinuebutton(): void {
    new SpriteComponent({
      parent: this,
      element: {
        // 280
        position: new Point(0, 350),
      },
      children: [
        new BitmapTextComponent({
          element: {
            text: LocaleHelper.Instance.getLocale("continue"), //'Continue',
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
    EventManager.Instance.emit('change-state', 'map');
  }

}
