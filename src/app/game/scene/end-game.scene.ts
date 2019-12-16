
import { 
    StateContainer,
    RendererController,
    EventManager
 } from '@app/game'
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { Point, Texture } from 'pixi.js';
import { SpriteComponent } from '@app/components/sprite.component';
import { Resources } from '@app/utils/resources.utils';
import { Background } from '@app/components/background.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { GameModelData } from '@models/game-model.data';
import { MoneyCounterComponent } from '../power-select/money-counter.component';
import { FacebookInstant } from '@app/services/facebook-instant';
import { ContainerComponent } from '@app/components/container.component';


export class EndGameScene extends StateContainer {

  private money:MoneyCounterComponent;
  private bingosWon: number;

  constructor () {
    super()
  }

  protected init():void {

    const background:Background = new Background();
    this.addChild(background);

    this.createWinMessage();  

    this.createWinningCards(0, -20);

    this.saveData();

    this.createContinuebutton();

    this.createMoneyShower();

    RendererController.Instance.resizeHandler();
  }

  private createWinMessage():void {
    
  }

  private createWinningCards(x:number=0,y:number=0):void {

    new SpriteComponent({
      parent: this,
      element: {
        
      },
      children: [
        new BitmapTextComponent({
          element: {
            position: new Point(0, -150),
            text: 'Congratulations',
            font: '35px lobster',
            tint: 0x333333,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    }).texture('prize-window', 'background').anchor(0.5)

    this.createCard(new Point(-120+x, y), Resources.getTexture('key', 'content'), GameModelData.instance.powerKeys);
    this.createCard(new Point(   0+x, y), Resources.getTexture('bingo-icon', 'content'), GameModelData.instance.powerBingos);
    this.createCard(new Point( 120+x, y), Resources.getTexture('coin', 'content'), GameModelData.instance.powerCoins);    

  }


  private createCard(position:Point, texture:Texture, value:number):void {

    new ContainerComponent({
      parent: this,
      element: {
        position: position,
      },
      children: [
        new SpriteComponent({
        }).anchor(0.5).texture('bottom-marker-background', 'content'),
        new SpriteComponent({
          element:{
            scale: new Point(0.5,0.5),
            position: new Point(0, 0),
            texture: texture,
          }
        }).anchor(0.5),
        new SpriteComponent({
          element: {
            position: new Point(25,35),
            scale: new Point(1.2,1.2)
          }
        }).anchor(0.5).texture('bottom-marker-number', 'content'),
        new BitmapTextComponent({
          element: {
            position: new Point(24, 33),
            text: value.toString(),
            font: '25px arial',
            tint: 0x000000,
            anchor: new Point(0.5,0.5)
          }
        })
      ]
    })

  }

  private saveData():void {

    GameModelData.instance.money += GameModelData.instance.powerCoins;
    this.bingosWon = GameModelData.instance.powerBingos;
    GameModelData.instance.sessionBingos = GameModelData.instance.powerBingos;

    GameModelData.instance.bingos += GameModelData.instance.powerBingos;

    GameModelData.instance.powerCoins = 0;
    GameModelData.instance.powerBingos = 0;

  }

  private createContinuebutton():void {
    new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0, 115),
      },
      children: [
        new BitmapTextComponent({
            element: {
              text: 'Continue',
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

  createMoneyShower():void {
    if(this.money!=null)
      console.log("createMoneyShower money not null");
    this.money = new MoneyCounterComponent({
      parent: this,
      element: {
        position: new Point(0, -320)
      }
    });
  }
  resize():void {
    if(!this.money || !this.money.element) {
      return;
    }
    this.money.element.y = -RendererController.Instance.center.y + 44;
  }

  onStartGame():void {

    FacebookInstant.instance.addScore(GameModelData.instance.bingos, (data:any) => {
      FacebookInstant.instance.logEvent("e_bingos", this.bingosWon);
      this.bingosWon = 0;
      console.log(data);
    });

    if(GameModelData.instance.powerKeys > 0) {
      
      EventManager.Instance.emit('change-state', 'chest');

    } else {

      FacebookInstant.instance.saveAllData( () =>{
        // EventManager.Instance.emit('change-state', 'map');
        EventManager.Instance.emit('change-state', 'social');
      })

    }
  }

}
