import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import {Point, Graphics, Texture} from 'pixi.js';
import { FacebookInstant } from '@app/services/facebook-instant';
import { SpriteComponent } from '@app/components/sprite.component';
import { ContainerComponent } from '@app/components/container.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import {LocaleHelper} from "@app/components/locale.componenet";
import {isNullOrUndefined} from "util";
import {TextComponent} from "@app/components/text.component";
import TextStyle = PIXI.TextStyle;

export type LeaderboardType = 'active' | 'clicked';

export type LeaderboardProps = {

}

export class LeaderboardBehavior extends BehaviorBase<LeaderboardType, LeaderboardProps> {

  private leaderboardContainer: ContainerComponent;
  private playerStats: ContainerComponent;
  private listContainer:ContainerComponent;
  private isPressed:boolean;
  private weeklyLeaderboard:Array<FBInstant.LeaderboardEntry>;
  private globalLeaderboard:Array<FBInstant.LeaderboardEntry>;
  private playerData:FBInstant.LeaderboardEntry;
  private weeklyPlayerData:FBInstant.LeaderboardEntry;

  constructor(props?: LeaderboardProps) {
    super(props);
    this.isPressed = false;
  }

  protected onSubscribe(value: ComponentBase): void {
    
    value.addChildren([
      new BitmapTextComponent({
        element: {
          text: LocaleHelper.Instance.getLocale("leaderboard"), //'Leaderboard',
          font: '30px lobster',
          tint: 0xffd700,
          position: new Point(0, -210),
          anchor: new Point(0.5, 0.5)
        }
      }),
      new SpriteComponent({
        element: {
          position: new Point(0, -60),
          scale: new Point(0.6, 0.6)
        },
        children: [
          new SpriteComponent({
            element: {
              position: new Point(72, 0)
            }
          }).texture('switch-front', 'content').anchor(0.5)
        ],
        behavior: [
          new ButtonBehavior({
            useTweenEffect: false,
            click: (comp: ComponentBase) => this.onClickSwitch(comp)
          })
        ]
      }).texture('switch-back', 'content').anchor(0.5),
      new BitmapTextComponent({
        element: {
          text: LocaleHelper.Instance.getLocale("weekly"), //'Weekly',
          font: '16px arial',
          tint: 0x333333,
          position: new Point(44, -62),
          anchor: new Point(0.5, 0.5)
        }
      }),
      new BitmapTextComponent({
        element: {
          text: LocaleHelper.Instance.getLocale("all_time"), //'All Time',
          font: '16px arial',
          tint: 0x333333,
          position: new Point(-46, -62),
          anchor: new Point(0.5, 0.5)
        }
      })
    ]);
    
  }

  loadLeaderboardData(callback:()=>void):void {
    if(this.weeklyLeaderboard && this.weeklyLeaderboard.length > 0 &&
        this.globalLeaderboard && this.globalLeaderboard.length > 0) {
      callback();
      return;
    }
    try {
      FacebookInstant.instance.getWeeklyScore(0, 6, (list: Array<FBInstant.LeaderboardEntry>) => {
        this.weeklyLeaderboard = list;
        //console.log("Weekly lb:", list);
        FacebookInstant.instance.getGlobalScore(0, 6, (list: Array<FBInstant.LeaderboardEntry>) => {
          this.globalLeaderboard = list;
          callback();
        });
        /* if(isLoaded) {
           callback();
         }
         isLoaded = true;*/
      });
    }catch(e) {
      callback();
    }


  }

  onClickSwitch(comp: ComponentBase = null): void {
    this.isPressed = !this.isPressed;
    
    comp.element.children[0].position.x = (this.isPressed) ? -72 : 72

    if(this.isPressed) {
      this.showGlobalLeaderboard();
    } else {
      this.showWeeklyLeaderboard();
    }
  }

  show(): void {

    this.leaderboardContainer = new ContainerComponent({
      parent: this.targets[0].element,
      element: {
        position: new Point(0, 30)
      }
    });

    this.loadLeaderboardData( () => {
      this.targets[0].element.visible = true;
      this.showWeeklyLeaderboard();
    });

    this.loadPlayerScore();
    // FacebookInstant.instance.getPlayerScore((entry: FBInstant.LeaderboardEntry) => this.addCurrentPosition(entry));
  }

  loadPlayerScore():void {
    if(this.playerData) {
      this.addCurrentPosition(this.playerData);
      return;
    }

    FacebookInstant.instance.getPlayerScore((entry: FBInstant.LeaderboardEntry) => {
      this.playerData = entry;
      this.addCurrentPosition(this.playerData);
      try {
        FacebookInstant.instance.getPlayerWeeklyScore((entry: FBInstant.LeaderboardEntry) => {
          this.weeklyPlayerData = entry;
          if (entry != null && !isNullOrUndefined(this.weeklyPlayerData.getScore())) {
            this.playerStats.emitToChildren('score', 'text', this.weeklyPlayerData.getScore());
            this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(this.weeklyPlayerData.getRank()));
          } else {
            this.playerStats.emitToChildren('score', 'text', 0);
            if(!isNullOrUndefined(this.weeklyPlayerData))
              this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(this.weeklyPlayerData.getRank()));
            else
              this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(0));

          }
          //this.addCurrentPosition(this.playerData);
        });
      }catch(e){
        this.playerStats.emitToChildren('score', 'text', 0);
        this.playerStats.emitToChildren('rank', 'text', 0);
      }
    });


    
  }

  showWeeklyLeaderboard():void {
    this.createContainer('Weekly');
    let length = this.weeklyLeaderboard.length;
    if(length > 6)
      length = 6;
    for (let i = 0; i < length; i++) {
      this.addEntry(i, this.weeklyLeaderboard[i]);
      //console.log("weekly leaerboard:", this.weeklyLeaderboard[i]);
    }

    if(this.weeklyPlayerData == null || isNullOrUndefined(this.weeklyPlayerData.getScore())){
      this.playerStats.emitToChildren('score', 'text', 0);
      this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(0));
    }else {
      this.playerStats.emitToChildren('score', 'text', this.weeklyPlayerData.getScore());
      this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(this.weeklyPlayerData.getRank()));
    }
  }

  showGlobalLeaderboard():void {
    this.createContainer('Global');
    let length = this.globalLeaderboard.length;
    if(length > 6)
      length = 6;
    for (let i = 0; i < length; i++) {
      this.addEntry(i, this.globalLeaderboard[i]);
    }
    if(this.playerData == null || isNullOrUndefined(this.playerData.getScore())) {
      this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(0));
      this.playerStats.emitToChildren('score', 'text', 0);
    }
    else {
      this.playerStats.emitToChildren('rank', 'text', this.getRankLetter(this.playerData.getRank()));
      this.playerStats.emitToChildren('score', 'text', this.playerData.getScore());
    }
  }

  createContainer(name:string):void  {
    if(this.listContainer) {
      this.listContainer.destroy();
    }

    this.listContainer = new ContainerComponent({
      parent: this.leaderboardContainer.element
    });
    this.listContainer.element.name = `ContainerComponent-${name}`

  }

  protected addEntry(index: number, entry: FBInstant.LeaderboardEntry): void {

    const dy: number = -40 + index * 50;

    var textStyle:TextStyle ;
    textStyle = new TextStyle( {
      fontFamily : 'Arial', fontSize: 24, fill : 0x333333, align : 'left'
    });

    this.listContainer.addChildren([
      new BitmapTextComponent({
        element: {
          text: entry.getRank().toString(),
          font: '24px arial',
          tint: 0x333333,
          align: 'right',
          position: new Point(-140, dy),
          anchor: new Point(1, 0.5)
        }
      }),
      new SpriteComponent({
        element: {
          width: 40, height: 40,
          position: new Point(-100, dy)
        }
      })
        .fromTexture(FacebookInstant.instance.getPlayerImage(entry.getPlayer()))
        .anchor(0.5)
        .mask(new Graphics().beginFill(0xff0000).drawCircle(-100, dy, 20).endFill()),
      new TextComponent({
        element: {
          text: entry.getPlayer().getName().substr(0, 20),
          style: textStyle
          //font: '20px arial',
          //tint: 0x333333,
          //align: 'left',
          //position: new Point(-60, dy),
          //anchor: new ObservablePoint(()=>{}, null, -60, dy)
        }
      }).anchor( -60, dy - 15),
      new SpriteComponent({
        element: {
          position: new Point(-100, dy),
          scale: new Point(0.5, 0.5),
          tint: 0x4ce9fd
        }
      }).texture('circular-mask', 'content').anchor(0.5),
      new BitmapTextComponent({
        element: {
          text: entry.getScore().toString(),
          font: '26px arial',
          align: 'right',
          tint: 0x333333,
          position: new Point(150, dy),
          anchor: new Point(1, 0.5)
        }
      })
    ]);

  }

  protected addCurrentPosition(entry: FBInstant.LeaderboardEntry): void {
    console.warn("Current player:", entry);
    let playerPhoto : Texture;
    let score : number;
    let rank : number;
    if(isNullOrUndefined(entry)){
        //FBInstant.player.getPhoto()
      playerPhoto = Texture.fromImage(FBInstant.player.getPhoto());
      score = 0;
      rank = 0;
    }else{
      playerPhoto = FacebookInstant.instance.getPlayerImage(entry.getPlayer());
      score = entry.getScore();
      rank = entry.getRank();
    }
    this.playerStats = new ContainerComponent({
      parent: this.leaderboardContainer.element,
      element: {
        position: new Point(0, -50)
      },
      children: [
        new BitmapTextComponent({
          element: {
            text: LocaleHelper.Instance.getLocale("best_score"), //'Your Best Score',
            font: '16px arial',
            tint: 0x000000,
            position: new Point(0, -150),
            anchor: new Point(0.5, 0.5)
          }
        }),
        new SpriteComponent({
          element: {
            width: 60, height: 60,
            position: new Point(0, -105)
          }
        })
          .fromTexture(playerPhoto)
          .anchor(0.5)
          .mask(new Graphics().beginFill(0xff0000).drawCircle(0, -105, 30).endFill()),
        new SpriteComponent({
          element: {
            position: new Point(0, -105),
            scale: new Point(0.75, 0.75),
            tint: 0x4ce9fd
          }
        }).texture('circular-mask', 'content').anchor(0.5),
        new BitmapTextComponent({
          tag: ['rank'],
          element: {
            text: this.getRankLetter(rank),
            font: '20px arial',
            tint: 0x000000,
            position: new Point(-40, -110),
            anchor: new Point(1, 0.5)
          }
        }).on('text', (self:ComponentBase,value:string) => (self as BitmapTextComponent).text(value)),
        new BitmapTextComponent({
          tag: ['score'],
          element: {
            text: score.toString(),
            font: '36px arial',
            tint: 0x000000,
            position: new Point(35, -110),
            anchor: new Point(0, 0.5)
          }
        }).on('text', (self:ComponentBase,value:string) => (self as BitmapTextComponent).text(value))
      ]
    });

  }

  getRankLetter(value: number): string {

    switch (value) {
      case 1:
        return `${value}st`;
      case 2:
        return `${value}nd`;
      case 3:
        return `${value}rd`;
      default:
        return `${value}th`;
    }

  }


  hide(): void {
    this.targets[0].element.visible = false;
    if(!this.leaderboardContainer) {
      return;
    }
    this.leaderboardContainer.destroy();
  }

  get props(): LeaderboardProps {
    return this.properties;
  }
}
