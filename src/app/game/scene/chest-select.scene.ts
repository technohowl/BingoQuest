
import { 
    StateContainer,
    RendererController,
    EventManager
 } from '@app/game'
import { Point, Texture } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { Background } from '@app/components/background.component';
import { ChestCounterComponent } from '../map/chest-counter.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { ComponentBase } from '@app/core/component.core';
import { GameModelData } from '@models/game-model.data';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { Resources } from '@app/utils/resources.utils';
import { FacebookInstant } from '@app/services/facebook-instant';
import { TimelineMax } from 'gsap';
import { Helper } from '@app/utils/helper.utils';
import { ContainerComponent } from '@app/components/container.component';
import {LocaleHelper} from "@app/components/locale.componenet";


export class ChestSelectScene extends StateContainer {

  private chest:ChestCounterComponent;

  constructor () {
    super()
  }

  protected init():void {

    const background:Background = new Background();
    this.addChild(background);

    // GameModelData.instance.powerKeys = 3;

    this.chest = new ChestCounterComponent({
      parent: this,
      element: {
        position: new Point(0, -330)
      }
    });

    this.createChest(new Point(-140, -100));
    this.createChest(new Point(   0, -100));
    this.createChest(new Point( 140, -100));

    this.createChest(new Point(-140, 100));
    this.createChest(new Point(   0, 100));
    this.createChest(new Point( 140, 100));
    
    RendererController.Instance.resizeHandler();

  }
  resize():void {
    if(!this.chest || !this.chest.element) {
      return;
    }
    this.chest.element.y = -RendererController.Instance.center.y + 44;
  }

  createChest(position:Point):void {

    new SpriteComponent({
      parent: this,
      element: {
        position: position,
        scale: new Point(0.7,0.7)
      },
      behavior: [
        new ButtonBehavior({
          click: (comp:ComponentBase) => this.onClickChest(comp as SpriteComponent)
        })
      ]
    }).anchor(0.5).texture('chest-closed', 'content');

  }

  onClickChest(comp:SpriteComponent):void {
    if(GameModelData.instance.powerKeys <= 0) {
      return;
    }

    comp.element.interactive = false;
    comp.element.buttonMode = false;

    new TimelineMax({onComplete: () => this.onCompleteAnim(comp)})

    .to(comp.element, 0.2, {rotation: Helper.DegreeToRad(-20)})
    .to(comp.element, 0.4, {rotation: Helper.DegreeToRad(20)})
    .to(comp.element, 0.2, {rotation: Helper.DegreeToRad(0)})
    .to(comp.element.scale, 0.5, {x: 0.8, y: 0.8}, 0)


    GameModelData.instance.powerKeys--;
    if(GameModelData.instance.powerKeys <= 0) {
      this.createContinuebutton();
    }

  }
  private onCompleteAnim(comp:SpriteComponent):void {
    comp.texture('chest-open', 'content');
    comp.element.alpha = 0.5;
    this.createRandomCard(new Point(comp.element.position.x+25, comp.element.position.y-10));
  }

  private createRandomCard(position:Point):void {

    const rand = Math.random() * 100;

    if(rand < 20) {
      this.createCard(position, Resources.getTexture('bingo-icon', 'content'), '')
      GameModelData.instance.bingos++;
    } else if(rand < 40) {
      this.createCard(position, Resources.getTexture('coin', 'content'), '10')
      GameModelData.instance.money += 10;
    } else if(rand < 60) {
      this.createCard(position, Resources.getTexture('coin', 'content'), '20')
      GameModelData.instance.money += 20;
    } else if(rand < 80) {
      this.createCard(position, Resources.getTexture('coin', 'content'), '30')
      GameModelData.instance.money += 30;
    } else {
      this.createCard(position, Resources.getTexture('coin', 'content'), '40')
      GameModelData.instance.money += 40;
    }

  }

  private createCard(position:Point, texture:Texture, name:string):ContainerComponent {

    return new ContainerComponent({
      parent: this,
      element: {
        position: position,
      },
      children: [
        new SpriteComponent({
          element:{
            scale: new Point(0.7,0.7),
            texture: texture,
          }
        }).anchor(0.5),
        new BitmapTextComponent({
          tag: ['text'],
          element: {
            position: new Point(3, -2),
            text: name,
            font: '30px lobster',
            tint: 0x111111,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    })

  }

  private createContinuebutton():void {
    new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0, 240),
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

  onStartGame():void {

    FacebookInstant.instance.saveAllData( () => {

      EventManager.Instance.emit('change-state', 'social');

    })

  }

}
