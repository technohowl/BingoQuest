
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
import { Resources } from '@app/utils/resources.utils';
import { SocialBehavior } from '../board/social.behavior';
import { LeaderboardBehavior } from '../social/leaderboard.behavior';
import { SharingBehavior } from '../social/sharing.behavior';


export class SocialScene extends StateContainer {

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

    this.saveLeaderboardData();
    
    this.createDefaultTab();

    this.createBackgroundModel();

    this.createLeaderboard();

    this.createMultiplier();

    this.createContinuebutton();

    // this.onClickLeaderboard();
    this.onClickMatches();

    RendererController.Instance.resizeHandler();
  }

  private saveLeaderboardData():void {
    
  }

  private createDefaultTab(): void {

    this.matchesButton = new ButtonComponent({
      parent: this,
      element: {
        position: new Point(-90, -290)
      }
    }, {
      texture: Resources.getTexture('icon-friends', 'content'),
      tint: 0x666666,
      blendMode: 2,
      scale: new Point(0.7, 0.7)
    }).AddCallback( () => this.onClickMatches() );

    this.leaderboardButton = new ButtonComponent({
      parent: this,
      element: {
        position: new Point(90, -290)
      }
    }, {
      texture: Resources.getTexture('icon-tropy', 'content'),
      tint: 0x666666,
      blendMode: 2,
      scale: new Point(0.7, 0.7)
    }).AddCallback( () => this.onClickLeaderboard() )

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
    this.matchesButton.element.tint = 0xffffff;
    this.leaderboardButton.element.tint = 0xaaaaaa;

    this.matchesTab.element.visible = true;
    this.leaderboard.hide();
  }

  private onClickLeaderboard():void {
    this.leaderboardButton.element.tint = 0xffffff;
    this.matchesButton.element.tint = 0xaaaaaa;

    this.matchesTab.element.visible = false;
    this.leaderboard.show();
  }

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
            text: 'Continue',
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
