import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { ContainerComponent } from '@app/components/container.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonComponent } from '../board/button.component';
import { Point, Graphics } from 'pixi.js';
import { FacebookInstant } from '@app/services/facebook-instant';
import { EventManager } from '@app/components/event-manager.component';
import { Resources } from '@app/utils/resources.utils';
import { SpriteComponent } from '@app/components/sprite.component';
import {ButtonBehavior} from "@app/behaviors/button.behavior";
import { LocaleHelper } from '@app/components/locale.componenet';

import Texture = PIXI.Texture;

export type SharingType = 'active' | 'clicked';

export type SharingProps = {

}

export class SharingBehavior extends BehaviorBase<SharingType, SharingProps> {

  constructor(props?: SharingProps) {
    super(props);
  }

  protected onSubscribe(value: ComponentBase): void {

    console.warn(LocaleHelper.Instance.getLocale("play_friends"));

    new ContainerComponent({
      parent: value.element,
      children: [
        new BitmapTextComponent({
          element: {
            text: LocaleHelper.Instance.getLocale("play_friends"), //'Play with Friends',
            font: '30px lobster',
            tint: 0xffd700,
            position: new Point(0, -210),
            anchor: new Point(0.5, 0.5)
          }
        }),
        new ContainerComponent({
          element: {
            position: new Point(-30, -145)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: LocaleHelper.Instance.getLocale("play_friends"),//'Play With Friends',
                font: '22px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(140, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text(LocaleHelper.Instance.getLocale("invite")).AddCallback(() => this.onInviteFriend())
          ]
        }),
        new ContainerComponent({
          element: {
            position: new Point(-30, -90)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: LocaleHelper.Instance.getLocale("share_game"),// 'Share Game',
                font: '24px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(140, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text(LocaleHelper.Instance.getLocale("share")).AddCallback(() => this.onShare())
          ]
        }),
        new ContainerComponent({
          element: {
            position: new Point(-30, -30)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: LocaleHelper.Instance.getLocale("random_play"), //'Random Player',
                font: '24px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(140, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text(LocaleHelper.Instance.getLocale("join")).AddCallback(() => this.onInviteRandom())
          ]
        })
      ]
    });

    this.showFriendsLeaderboard();

  }

  onInviteRandom(): void {
    FacebookInstant.instance.startMatchmaking((_: string) => {
      EventManager.Instance.emit('change-state', 'map');
          FacebookInstant.instance.logEvent("e_matchmaking", 1);
    }
    );
  }

  onInviteFriend(): void {
    FacebookInstant.instance.inviteSocial(() => {
      console.log('inviteSocial', Resources.getConfig().templates.template1.prize);
      FacebookInstant.instance.logEvent("e_socialInvite", 1);
    })
  }

  onShare(): void {
    
    FacebookInstant.instance.share(() => {
      console.log('onShare', Resources.getConfig().templates.template1.prize);
      FacebookInstant.instance.logEvent("e_shareGame", 1);
    })
  }

  showFriendsLeaderboard(): void {
    const containerParent:ContainerComponent = new ContainerComponent({
      parent: this.targets[0].element
    });

    if(FBInstant.context.getID()!= null){
      console.error("FBInstant.context.getID() != null");
      //getContextLeaderboard
      FacebookInstant.instance.getContextLeaderboard(0,6, (list: Array<FBInstant.LeaderboardEntry>) => {
        let length = list.length;
        if(length > 6)
          length = 6;
        for (let i = 0; i < length; i++) {
          // for (let j = 0; j < 5; j++) {
          this.addEntry(containerParent, i, list[i]);
        }
      });
    }else{
      console.error("FBInstant.context.getID() = null");
      FacebookInstant.instance.getFriendsScore(0, 6, (list: Array<FBInstant.LeaderboardEntry>) => {
        let length = list.length;
        if(length > 6)
          length = 6;
        for (let i = 0; i < length; i++) {
          // for (let j = 0; j < 5; j++) {
          this.addEntry(containerParent, i, list[i]);
        }
      });
    }


  }
  protected addContextEntry(parent: ContainerComponent, index: number, entry: FBInstant.ContextPlayer): void {
    const dy: number = 35 + index * 45;

    console.log("addEntry:",entry.getID(),  entry.getName());
    parent.addChildren([
      new BitmapTextComponent({
        element: {
          text: (index+1).toString(),
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
          .fromTexture(Texture.from(entry.getPhoto()))
          .anchor(0.5)
          .mask(new Graphics().beginFill(0xff0000).drawCircle(-100, dy, 20).endFill()),
      new BitmapTextComponent({
        element: {
          text: entry.getName().substr(0, 20),
          font: '20px arial',
          tint: 0x333333,
          align: 'left',
          position: new Point(-60, dy),
          anchor: new Point(0, 0.5)
        }
      }),
      new SpriteComponent({
        element: {
          position: new Point(-100, dy),
          scale: new Point(0.5, 0.5),
          tint: 0x4ce9fd
        }
      }).texture('circular-mask', 'content').anchor(0.5),
      new BitmapTextComponent({
        element: {
          text: "",
          font: '26px arial',
          align: 'right',
          tint: 0x333333,
          position: new Point(150, dy),
          anchor: new Point(1, 0.5)
        }
      })/*,
      new SpriteComponent({
        element: {
          position: new Point(160, dy)
        },
        behavior: [
          new ButtonBehavior({
            click: () => {
              FacebookInstant.instance.switchAsync(entry.getID(), ()=>{
                FacebookInstant.instance.logEvent("e_ctx_friend_invited", 1);
              });
            }
          })
        ]
      }).texture('playicon').anchor(0.5)*/

    ]);
  }

  protected addEntry(parent: ContainerComponent, index: number, entry: FBInstant.LeaderboardEntry): void {

    const dy: number = 35 + index * 45;
    const isVisible: boolean = (FBInstant.player.getID() !== entry.getPlayer().getID());
    console.log("addEntry:",entry.getRank().toString(),  entry.getPlayer().getName(), entry.getScore());
    parent.addChildren([
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
      new BitmapTextComponent({
        element: {
          text: entry.getPlayer().getName().substr(0, 15),
          font: '20px arial',
          tint: 0x333333,
          align: 'left',
          position: new Point(-60, dy),
          anchor: new Point(0, 0.5)
        }
      }),
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
          position: new Point(120, dy),
          anchor: new Point(1, 0.5)
        }
      }),
      new SpriteComponent({
        element: {
          position: new Point(160, dy),
          visible: isVisible
        },
        behavior: [
          new ButtonBehavior({
            click: () => {
                FacebookInstant.instance.switchAsync(entry.getPlayer().getID(), ()=>{
                  FacebookInstant.instance.logEvent("e_friend_invited", 1);
              });
            }
          })
        ]
      }).texture('playicon').anchor(0.5)

    ]);


  }


  get props(): SharingProps {
    return this.properties;
  }
}
