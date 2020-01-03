import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import {Point, } from 'pixi.js';
import { FacebookInstant } from '@app/services/facebook-instant';
import { ContainerComponent } from '@app/components/container.component';

import Product = FBInstant.Product;
import {SpriteComponent} from "@app/components/sprite.component";
import {ButtonBehavior} from "@app/behaviors/button.behavior";
import Purchase = FBInstant.Purchase;
import {GameModelData} from "@models/game-model.data";
import {SoundController} from "@app/controller/sound.controller";
import {MoneyCounterComponent} from "@app/game/power-select/money-counter.component";
import {RendererController} from "@app/controller/renderer.controller";

export type LeaderboardType = 'active' | 'clicked';

export type LeaderboardProps = {

}

export class ShopBehavior extends BehaviorBase<LeaderboardType, LeaderboardProps> {

  private leaderboardContainer: ContainerComponent;
  private listContainer:ContainerComponent;
  private money: MoneyCounterComponent;

  constructor(props?: LeaderboardProps) {
    super(props);
  }

  protected onSubscribe(_value: ComponentBase): void {
   /* _value.addChild(new BitmapTextComponent({
      element: {
        text: "Shop", //'Leaderboard',
        font: '36px lobster',
        tint: 0xffd700,
        position: new Point(0, -150),
        anchor: new Point(0.5, 0.5)
      }
    }));*/
    this.show();
  }


  show(): void {
    this.leaderboardContainer = new ContainerComponent({
      parent: this.targets[0].element,
      element: {
        position: new Point(0, 30)
      }
    });
    this.targets[0].element.visible = true;
    FacebookInstant.instance.getInappCatalog((catalog: Product[])=>{
      //console.log("On getInappCatalog called");
      this.createContainer('Inapp');
      this.showShopItems(catalog);

    });


    // FacebookInstant.instance.getPlayerScore((entry: FBInstant.LeaderboardEntry) => this.addCurrentPosition(entry));
  }

  compare(a:Product, b:Product): number {
    /*if (+a.price > +b.price) return 1;
    if (+b.price > +a.price) return -1;*/

    return +a.title - +b.title;
  }


  showShopItems(catalog: Product[]):void {
    //console.warn("Adding:", catalog);
    const sortCataglog: Product[] = [...catalog].sort(this.compare);
    //console.warn("Sorted Adding:", sortCataglog);
    for (let i = 0; i < sortCataglog.length; i++) {
        this.addEntry(i, sortCataglog[i]);
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

  protected addEntry(index: number, entry: Product): void {

    const dy: number = -80 + index * 50;
    console.warn("Adding:", entry);
   /* var textStyle:TextStyle ;
    textStyle = new TextStyle( {
      fontFamily : 'Arial', fontSize: 24, fill : 0x333333, align : 'left'
    });*/
    let comps:SpriteComponent[] = [];

    for(let i:number = 0; i <= index; i++){
      let rand :number = Math.random() * 10  + index;
      if(i+1 % 2 == 1)
        rand = -rand;
      comps.push(new SpriteComponent({
        element: {
          width: 25, height: 25,
          position: new Point(-45 + rand, dy + rand/2),
        }
      })
          .texture('coin', 'content')
          .anchor(0.5));
    }


    this.listContainer.addChildren([
      new BitmapTextComponent({
        element: {
          text: entry.title,
          font: '22px arial',
          tint: 0x333333,
          align: 'left',
          position: new Point(-75, dy),
          anchor: new Point(1, 0.5)
        }
      }),
            ...comps,

      new BitmapTextComponent({
        element: {
          text: entry.priceCurrencyCode + " " + entry.price,
          font: '20px arial',
          align: 'right',
          tint: 0x333333,
          position: new Point(130, dy),
          anchor: new Point(1, 0.5)
        }
      }),
      new SpriteComponent({
        element: {
          position: new Point(165, dy)
        },
        behavior: [
          new ButtonBehavior({
            click: () => {
              FacebookInstant.instance.logEvent("eClickInappItem", 1);
              FacebookInstant.instance.buyInappItem(entry, (result:Purchase)=>{
                  if(result){
                    FBInstant.payments.consumePurchaseAsync(result.purchaseToken).then(function () {
                      // Purchase successfully consumed!
                      // Game should now provision the product to the player
                      GameModelData.instance.money += +entry.title;
                      SoundController.instance.audio('sfx').play('collect-item');
                      FacebookInstant.instance.saveAllData(()=>{

                      });
                    });

                  }
              });
            }
          })
        ]
      }).texture('playicon').anchor(0.5)
    ]);
    this.createMoneyShower();
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

  createMoneyShower():void {
    this.money = new MoneyCounterComponent({
      parent: this.targets[0].element,
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
}
