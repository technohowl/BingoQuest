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

export type SharingType = 'active' | 'clicked';

export type SharingProps = {

}

export class SharingBehavior extends BehaviorBase<SharingType, SharingProps> {

  constructor(props?: SharingProps) {
    super(props);
  }

  protected onSubscribe(value: ComponentBase): void {

    new ContainerComponent({
      parent: value.element,
      children: [
        new BitmapTextComponent({
          element: {
            text: 'Play with Friends',
            font: '30px lobster',
            tint: 0xffd700,
            position: new Point(0, -210),
            anchor: new Point(0.5, 0.5)
          }
        }),
        new ContainerComponent({
          element: {
            position: new Point(0, -145)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: 'Play With Friends',
                font: '22px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(110, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text('Invite').AddCallback(() => this.onInviteFriend())
          ]
        }),
        new ContainerComponent({
          element: {
            position: new Point(0, -90)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: 'Share Game',
                font: '24px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(110, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text('Share').AddCallback(() => this.onShare())
          ]
        }),
        new ContainerComponent({
          element: {
            position: new Point(0, -30)
          },
          children: [
            new BitmapTextComponent({
              element: {
                text: 'Random Player',
                font: '24px arial',
                tint: 0x333333,
                position: new Point(-140, 0),
                anchor: new Point(0, 0.5)
              }
            }),
            new ButtonComponent({
              element: {
                position: new Point(110, 0),
                scale: new Point(0.7, 0.7)
              }
            }).text('Join').AddCallback(() => this.onInviteRandom())
          ]
        })
      ]
    });

    this.showFriendsLeaderboard();
    this.sendUpdate();

  }

  onInviteRandom(): void {
    FacebookInstant.instance.startMatchmaking((_: string) => {
      EventManager.Instance.emit('change-state', 'map')
    }
    );
  }

  onInviteFriend(): void {
    
    FacebookInstant.instance.inviteSocial(() => {
      console.log('inviteSocial', Resources.getConfig().templates.template1.prize);
    })
  }

  sendUpdate(): void {
    
    FacebookInstant.instance.updateStatus(() => {
      console.log('updateStatus', Resources.getConfig().templates.template1.prize);
    })
  }

  onShare(): void {
    
    FacebookInstant.instance.share(() => {
      console.log('onShare', Resources.getConfig().templates.template1.prize);
    })
  }

  showFriendsLeaderboard(): void {
    const containerParent:ContainerComponent = new ContainerComponent({
      parent: this.targets[0].element
    });

    FacebookInstant.instance.getGlobalScore(0, 6, (list: Array<FBInstant.LeaderboardEntry>) => {
      for (let i = 0; i < list.length; i++) {
        // for (let j = 0; j < 5; j++) {
          this.addEntry(containerParent, i, list[i]);
        // }
      }

    });
  }

  protected addEntry(parent: ContainerComponent, index: number, entry: FBInstant.LeaderboardEntry): void {

    const dy: number = 35 + index * 45;

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
          text: entry.getPlayer().getName().substr(0, 20),
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
          position: new Point(150, dy),
          anchor: new Point(1, 0.5)
        }
      })
    ]);


  }


  get props(): SharingProps {
    return this.properties;
  }
}
