
import { 
  StateContainer, EventManager,
  SpriteComponent,
 } from '@app/game'
import { Point, Sprite } from 'pixi.js';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ContainerComponent } from '@app/components/container.component';
import { Resources } from '@app/utils/resources.utils';
import { PowerSelectBehavior } from '../power-select/power-select.behavior';
import { Background } from '@app/components/background.component';
import { RendererController } from '@app/controller/renderer.controller';
import { ComponentBase } from '@app/core/component.core';
import { GameModelData, PowerList } from '@models/game-model.data';
import { MoneyCounterComponent } from '../power-select/money-counter.component';
import { FacebookInstant } from '@app/services/facebook-instant';
import { TweenMax, Bounce } from 'gsap';
import { SoundController } from '@app/controller/sound.controller';
import {LocaleHelper} from "@app/components/locale.componenet";


export class PowerSelectScene extends StateContainer {

  private powersSelected:PowerList[];
  private listContainers:ContainerComponent[];
  private money:MoneyCounterComponent;

  constructor () {
    super()
  }

  protected init():void {

    this.powersSelected = [];

    const background:Background = new Background();
    this.addChild(background);

    const element:SpriteComponent = new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0,0)
      },
      children: [
        new BitmapTextComponent({
          element: {
            position: new Point(0, -193),
            text: LocaleHelper.Instance.getLocale("power_selection"), //'Powerups Selection',
            font: '34px lobster',
            tint: 0x333333,
            anchor: new Point(0.5,0.5)
          }
        }),
        new BitmapTextComponent({
          element: {
            position: new Point(0, -105),
            text: LocaleHelper.Instance.getLocale("power_desc"), //'Buy up to 3 powerups\nwith your coins and powers\npopup with powers icon.',
            align: 'center',
            font: '20px arial',
            tint: 0x333333,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    }).anchor(0.5).texture('game-modal', 'background');

    this.listContainers = [];

    this.createPowerSelectEntity(element, 0, new Point(-120,10));
    this.createPowerSelectEntity(element, 1, new Point(   0,10));
    this.createPowerSelectEntity(element, 2, new Point( 120,10));


    TweenMax.fromTo(element.element, 0.5, {y: -300, alpha: 0}, {y: 0, alpha: 1, ease: Bounce.easeOut});
    
    this.createContinuebutton(element);

    this.money = new MoneyCounterComponent({
      parent: this,
      element: {
        position: new Point(0, -330)
      }
    });

    const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable();
    if(isRewardVisible)
        this.createAdsButton(element.element);

    RendererController.Instance.resizeHandler();
  }

  private createContinuebutton(comp:SpriteComponent):void {
    new SpriteComponent({
      parent: comp.element,
        element: {
        position: new Point(0, 165),
        scale: new Point(0.9,0.9)
      },
      children: [
        new BitmapTextComponent({
            element: {
              text: LocaleHelper.Instance.getLocale("continue"), //'Continue',
              font: '30px arial',
              tint: 0x555555,
              anchor: new Point(0.5,0.65)
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

  validateMoneyButtons():void {
    this.listContainers.forEach( (container:ContainerComponent) => {
      if(GameModelData.instance.money < 15 + 5 * (container.behaviors[0] as PowerSelectBehavior).totalClicks) {
        container.getChildWithTag('button').element.alpha = 0.5;
        container.getChildWithTag('button').element.interactive = false;
        container.getChildWithTag('button').element.buttonMode = false;
      }
    } )
  }

  createAdsButton(parent:Sprite):void {

    const prize:number = Resources.getConfig().ads_win_powerup;
    new SpriteComponent({
      parent: parent,
      element: {
        position: new Point(0, 290),
        scale: new Point(1.1,1.1),
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5,0.5),
            tint: 0x444444,
            blendMode: 2,
            position: new Point(-40, -3)
          }
        }).texture('icon-ads', 'content').anchor(0.5),
        new BitmapTextComponent({
            element: {
              position: new Point(11, 4),
              //todo locale
              text: `Win\n${prize}    `,
              align: 'center',
              font: '24px arial',
              tint: 0x555555,
              anchor: new Point(0.5,0.65)
            }
        }).blendMode(2),
        new SpriteComponent({
          element: {
            scale: new Point(0.25,0.25),
            position: new Point( 40, 12),
          }
        }).texture('coin', 'content').anchor(0.5)
      ],
      behavior: [
        new ButtonBehavior({
          click: (comp:ComponentBase) => this.onClickAds(comp)
        })
      ],
    }).anchor(0.5).texture('button-ads', 'content');
  }

  onClickAds(comp:ComponentBase):void {
    comp.destroy();

    FacebookInstant.instance.playVideo(  () => {
      GameModelData.instance.money += Resources.getConfig().ads_win_powerup;
    }, (_:any) => {
      console.log('error');
    })

  }

  createPowerSelectEntity(comp:SpriteComponent, index:number, position:Point):void {

    const powerSelected:PowerSelectBehavior = new PowerSelectBehavior({
      powers:[
        {name: 'Bingo',      chances: 3, texture:Resources.getTexture('bingo-icon', 'content'), power: 'instant-bingo'},
        {name: 'Coin',       chances: 7, texture:Resources.getTexture('coin', 'content'), power: 'coin'},
        {name: 'Extra Ball', chances: 5, texture:Resources.getTexture('extra-ball', 'content'), power: 'extra-ball'},
        {name: 'Daub',       chances: 4, texture:Resources.getTexture('star-icon', 'content'), power: 'bonus-daub'},
        {name: '2 Daub',     chances: 1, texture:Resources.getTexture('star-icon2', 'content'), power: '2-bonus-daub'},
        {name: 'Key',        chances: 5, texture:Resources.getTexture('key', 'content'), power: 'key'},
      ]
    });

    powerSelected.on('selected', () => {
      if(GameModelData.instance.money < 20){
        return;
      }
      SoundController.instance.audio('sfx').play('collect');
      this.powersSelected[index] = powerSelected.selected;
      //tarun
      GameModelData.instance.money -= (15 + 5 * powerSelected.totalClicks);
      this.validateMoneyButtons();
    });

    const container:ContainerComponent = new ContainerComponent({
      parent: comp.element,
      element: {
        position: position
      },
      children: [
        new SpriteComponent({
          tag: ['panel'],
          element: {
            scale: new Point(0.7,0.7)
          }
        }).anchor(0.5).texture('power-box', 'background'),
        new SpriteComponent({
          tag: ['icon'],
          element: {
            scale: new Point(0.6,0.6),
            position: new Point(0, 0)
          }
        }).anchor(0.5).texture('question', 'content'),
        new BitmapTextComponent({
          tag: ['title'],
          element: {
            position: new Point(0,-60),
            text: '',
            font: '20px arial',
            tint: 0x024877,
            anchor: new Point(0.5,0.5)
          }
        }),
        new SpriteComponent({
          tag: ['button'],
          element: {
            position: new Point(0, 80),
            scale: new Point(0.6, 0.6)
          },
          children: [
            new SpriteComponent({
              element: {
                scale: new Point(0.4,0.4),
                position: new Point(-28, -4)
              }
            }).anchor(0.5).texture('coin', 'content'),
            new BitmapTextComponent({
              tag: ['power-counter'],
              element: {
                position: new Point(15,-2),
                text: '20',
                font: '36px lobster',
                tint: 0x333333,
                anchor: new Point(0.5,0.6)
              }
            }).on('power-counter', (comp:ComponentBase, _:number) => {
              (comp as BitmapTextComponent).text(`${20+5*powerSelected.totalClicks}`);
            })
          ],
          behavior: [ new ButtonBehavior({
            click: (value:SpriteComponent) => {
              if(GameModelData.instance.money < (20+5*powerSelected.totalClicks)){
                return;
              }
              value.emitter.emit('click');
            }
          })
          ],
        }).anchor(0.5).texture('button', 'content')
      ],
      behavior: [
        powerSelected
      ]
    });

    this.listContainers.push(container);

  }

  onStartGame():void {
    
    GameModelData.instance.items = [];
    this.powersSelected.forEach( (value:PowerList) => {
      (value && GameModelData.instance.items.push(value));
    });
    this.beginLevel();
  }

  resize():void {
    if(!this.money || !this.money.element) {
      return;
    }
    this.money.element.y = -RendererController.Instance.center.y + 44;
  }

  beginLevel():void {
    SoundController.instance.audio('sfx').play('collect');
    FacebookInstant.instance.saveAllData( () => {
      console.log('Data Saved');
      EventManager.Instance.emit('change-state', 'game')
    })
  }

}
