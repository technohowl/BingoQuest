
import {
  StateContainer,
  RendererController,
  EventManager, FacebookInstant
} from '@app/game';
import { Background } from '@app/components/background.component';
import { SpriteComponent } from '@app/components/sprite.component';
import { Point } from 'pixi.js';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { ContainerComponent } from '@app/components/container.component';
import { ButtonComponent } from '../board/button.component';
import { SocialBehavior } from '../board/social.behavior';
import { LeaderboardBehavior } from '../social/leaderboard.behavior';
import { SharingBehavior } from '../social/sharing.behavior';
import { LocaleHelper } from "@app/components/locale.componenet";


export class ShopScene extends StateContainer {

  matchesTab: ContainerComponent;
  leaderboard: LeaderboardBehavior;
  sharing:SharingBehavior;

  matchesButton:ButtonComponent;
  leaderboardButton:ButtonComponent;

  constructor() {

    super()

  }

  protected init(): void {

    
    const background: Background = new Background();
    this.addChild(background);

    //this.saveLeaderboardData();
    
    //this.createDefaultTab();

    this.createBackgroundModel();

    this.createLeaderboard();

    this.createMultiplier();

    this.createContinuebutton();

    // this.onClickLeaderboard();
    this.onClickMatches();

    RendererController.Instance.resizeHandler();
  }


  private createBackgroundModel(): void {
    new ContainerComponent({
      parent: this,
      behavior: [
        new SocialBehavior()
      ]
    });
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

    this.leaderboard = new LeaderboardBehavior();

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

  private createMultiplier(): void {

    this.sharing = new SharingBehavior();

    this.matchesTab = new ContainerComponent({
      parent: this,
      element: {
        visible: false,
      },
      behavior: [
        this.sharing
      ]
    })

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
    //tarun here on click goes to map
    FacebookInstant.instance.showInterstitialAd(()=>{
      EventManager.Instance.emit('change-state', 'map');
    });
  }

}
