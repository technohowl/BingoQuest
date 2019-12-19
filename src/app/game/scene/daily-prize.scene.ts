
import { 
    StateContainer,
    RendererController
 } from '@app/game'
import { Point } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { ContainerComponent } from '@app/components/container.component';
import { Helper } from '@app/utils/helper.utils';
import { SpinningBehavior } from '../daily-prize/spinning.behavior';
import { GameModelData } from '@models/game-model.data';
import { Background } from '@app/components/background.component';
import { MoneyCounterComponent } from '../power-select/money-counter.component';
import { FacebookInstant } from '@app/services/facebook-instant';
import { ComponentBase } from '@app/core/component.core';
import { TweenMax, Sine } from 'gsap';
import { SoundController } from '@app/controller/sound.controller';
import { EventManager } from '@app/components/event-manager.component';
import {LocaleHelper} from "@app/components/locale.componenet";
//import { Resources } from '@app/utils/resources.utils';


export class DailyPrizeScene extends StateContainer {


  private money:MoneyCounterComponent;
  private spinningWheel:ContainerComponent;
  private continueButton:SpriteComponent;
  private usedPower:boolean;

  constructor () {

    super()

  }

  resize():void {
    this.money.element.y = -RendererController.Instance.center.y + 44;
  }

  protected init():void {

    this.usedPower = false;

    const background:Background = new Background();
    this.addChild(background);

    this.createSpinningWheel();

    this.money = new MoneyCounterComponent({
      parent: this,
      element: {
        position: new Point(0, -330)
      }
    });

    RendererController.Instance.resizeHandler();
  }

  private createSpinningWheel():void {

    if(this.spinningWheel) {
      this.spinningWheel.destroy();
    }

    const results:number[] = [75, 10, 50,25, 100, 50, 10, 10];

    const spinBehavior:SpinningBehavior = new SpinningBehavior({
      stops: [0, 45, 90, 135, 180, 225, 270, 305]
    })

    this.spinningWheel = new ContainerComponent({
      parent: this,
      element: {
        position: new Point(0,0),
        scale: new Point(0.8,0.8)
      },
      children: [
        new SpriteComponent({
          element:{
            // scale: new Point(0.8,0.8)
          },
          children: this.createGameResults(results),
          behavior: [
            spinBehavior
          ]
        }).anchor(0.5).texture('wheel', 'content'),
        new SpriteComponent({
          element: {
            // scale: new Point(0.7, 0.7)
          },
          children: [
            new BitmapTextComponent({
              tag: ['button'],
              parent: this,
              element: {
                position: new Point(0, -6),
                text: LocaleHelper.Instance.getLocale("spin"), //'Spin',
                font: '56px lobster',
                align: 'center',
                tint: 0x111111,
                anchor: new Point(0.5,0.5)
              }
            }).on('button', (comp:ComponentBase) => {
              comp.element.visible = false
            })
          ]
        }).anchor(0.5).texture('wheel-button', 'content')
      ]
    })
    new SpriteComponent({
      parent: this,
      element:{
        position: new Point(0, -220),
        scale: new Point(0.8,0.8)
      },
    }).anchor(0.5).texture('wheel-arrow', 'content');

    TweenMax.fromTo(this.spinningWheel.element, 0.7, {rotation: 0, alpha: 0}, {rotation: -Math.PI*2, alpha: 1, ease: Sine.easeIn});
    TweenMax.fromTo(this.spinningWheel.element.scale, 0.7, {x: 0.1, y: 0.1}, {x: 0.8, y: 0.8, ease: Sine.easeIn});

    spinBehavior.on('spinning', () => {
      this.spinningWheel.emitToChildren('button', 'button');
      const sound:Howl = SoundController.instance.audio('sfx');
      sound.play('spin-sort');
      sound.rate(0.5);
    });

    spinBehavior.on('completed', () => this.onCompleteSpin(results[spinBehavior.spinResult]));

  }

  private onCompleteSpin(value:number):void {
    GameModelData.instance.money += value;
    GameModelData.instance.saveTime();
    this.createContinuebutton();
    const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable();
    if(isRewardVisible)
      this.createAdsButton();
  }
  

  private createGameResults(value:number[]):BitmapTextComponent[] {

    const results:BitmapTextComponent[] = [];

    for(let i = 0; i < value.length; i++) {
      results.push( this.createBitmapFontAt(value[i], 45*i) )
    }
    return results;
  }

  private createBitmapFontAt(value:number, rotation:number):BitmapTextComponent {
    return new BitmapTextComponent({
      element: {
        text: value.toString(),
        font: '48px lobster',
        tint: 0x111111,
        rotation: Helper.DegreeToRad(rotation),
        anchor: new Point(0.5, 3.5)
      }
    })
  }

  private createContinuebutton():void {
    this.continueButton = new SpriteComponent({
    // new SpriteComponent({
      parent: this,
      element: {
        position: new Point(100, 240),
        scale: new Point(0.9, 0.9),
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

  createAdsButton():void {
    if(this.usedPower) {
      return;
    }
    this.usedPower = true;
    
    new SpriteComponent({
      parent: this,
      element: {
        position: new Point(-100, 240),
        scale: new Point(1.1,1.1),
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5,0.5),
            tint: 0x444444,
            blendMode: 2,
            position: new Point(-48, -3)
          }
        }).texture('icon-ads', 'content').anchor(0.5),
        new BitmapTextComponent({
            element: {
              position: new Point(18, 0),
              text: LocaleHelper.Instance.getLocale("spin_again"), //'Spin\nAgain',
              align: 'center',
              font: '20px arial',
              tint: 0x555555,
              anchor: new Point(0.5,0.65)
            }
        }).blendMode(2)
      ],
      behavior: [
        new ButtonBehavior({
          click: (comp:ComponentBase) => this.onClickSpinAgain(comp)
        })
      ],
    }).anchor(0.5).texture('button', 'content');
  }

  onClickSpinAgain(comp:ComponentBase):void {

    FacebookInstant.instance.playVideo( () => {
      
      comp.element.visible = false;
      this.continueButton.destroy();
      this.createSpinningWheel();
      
    }, (_:any) => {
      comp.element.visible = false;
    })

  }

  onStartGame():void {
   
    SoundController.instance.audio('sfx').play('collect');
    FacebookInstant.instance.saveAllData( () => {
      EventManager.Instance.emit('change-state', 'map');

    })
  }

}
