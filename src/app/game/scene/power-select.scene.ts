
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
    private coinsComp:SpriteComponent;
    private callsComp:SpriteComponent;

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

        this.createPowerSelectEntity(element, 0, new Point(-140,10));
        this.createPowerSelectEntity(element, 1, new Point(   -50,10));
        this.createPowerSelectEntity(element, 2, new Point( 40,10));
        this.createPowerSelectEntity(element, 3, new Point( 130,10));


        TweenMax.fromTo(element.element, 0.5, {y: -300, alpha: 0}, {y: 0, alpha: 1, ease: Bounce.easeOut});

        this.createContinuebutton(element);

        this.money = new MoneyCounterComponent({
            parent: this,
            element: {
                position: new Point(0, -330)
            }
        });

        const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable(Resources.getConfig().ads.game);
        if(isRewardVisible)
            this.createAdsButton(element.element);

        //this.createConfetti();
        //this.createAdsButton(element.element);
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
        this.coinsComp = new SpriteComponent({
            parent: parent,
            element: {
                position: new Point(-RendererController.Instance.center.x/2,  290),
                scale: new Point(1,1),
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
                    click: (comp:ComponentBase) => this.onClickAds(comp, 0)
                })
            ],
        }).anchor(0.5).texture('button-ads', 'content');

        this.callsComp = new SpriteComponent({
            parent: parent,
            element: {
                position: new Point(RendererController.Instance.center.x/2, 290),
                scale: new Point(1,1),
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
                        text: `+2\nCalls`,
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
                        visible:false,
                    }
                }).texture('coin', 'content').anchor(0.5)
            ],
            behavior: [
                new ButtonBehavior({
                    click: (comp:ComponentBase) => this.onClickAds(comp, 1)
                })
            ],
        }).anchor(0.5).texture('button-ads', 'content');
    }

    onClickAds(_comp:ComponentBase, type: number):void {
        //comp.destroy();

        this.coinsComp.destroy();
        this.callsComp.destroy();

        FacebookInstant.instance.playVideo(  () => {
            SoundController.instance.audio('sfx').play('notification-alert-02');
            if(type == 0)
                GameModelData.instance.money += Resources.getConfig().ads_win_powerup;
            else
                GameModelData.instance.isExtraCalls = true;

        }, (_:any) => {
            console.log('error');
        })

    }

    createPowerSelectEntity(comp:SpriteComponent, index:number, position:Point):void {

        const powerSelected:PowerSelectBehavior = new PowerSelectBehavior({
            powers:[
                {name: 'Bingo',      chances: 3, texture:Resources.getTexture('bingo-icon', 'content'), power: 'instant-bingo'},
                {name: 'Coin',       chances: 9, texture:Resources.getTexture('coin', 'content'), power: 'coin'},
                {name: 'Extra Ball', chances: 4, texture:Resources.getTexture('extra-ball', 'content'), power: 'extra-ball'},
                {name: 'Daub',       chances: 4, texture:Resources.getTexture('star-icon', 'content'), power: 'bonus-daub'},
                {name: '2 Daubs',    chances: 1, texture:Resources.getTexture('star-icon2', 'content'), power: '2-bonus-daub'},
                {name: 'Key',        chances: 4, texture:Resources.getTexture('key', 'content'), power: 'key'},
            ]
        });

        powerSelected.on('selected', () => {
            SoundController.instance.audio('sfx').play('notification-alert-01');
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
                        scale: new Point(0.6,0.6)
                    }
                }).anchor(0.5).texture('power-box', 'background'),
                new SpriteComponent({
                    tag: ['icon'],
                    element: {
                        scale: new Point(0.5,0.5),
                        position: new Point(0, 0)
                    }
                }).anchor(0.5).texture('question', 'content'),
                new BitmapTextComponent({
                    tag: ['title'],
                    element: {
                        position: new Point(-10,-60),
                        text: '',
                        font: '18px arial',
                        tint: 0xffd700,
                        anchor: new Point(0.4,0.4)
                    }
                }),
                new SpriteComponent({
                    tag: ['button'],
                    element: {
                        position: new Point(0, 70),
                        scale: new Point(0.5, 0.5)
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
                                anchor: new Point(0.5,0.5)
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
        SoundController.instance.audio('sfx').play('notification-alert-02');
        FacebookInstant.instance.saveAllData( () => {
            console.log('Data Saved');
            EventManager.Instance.emit('change-state', 'game')
        })
    }
/*
    private createConfetti() {
       // TweenMax.set("img",{xPercent:"-50%",yPercent:"-50%"})

        let total:number = 70 ;
      // let     w:number = RendererController.Instance.width/2 ;
       let h:number =RendererController.Instance.height/2;

        for (var i=0 , div:SpriteComponent ; i<total; i++){
            div = new SpriteComponent(
                {
                    parent: this,
                    element: {
                    scale: new Point(0.4,0.4),
                    position: new Point(-28, this.R( -RendererController.Instance.height/2, RendererController.Instance.height/2))
                }
            }).anchor(0.5).texture('coin', 'content');
            //this.addChild(div);
            //TweenMax.set(div,{x:this.R(0,w),y:this.R(-100,100),opacity:1,scale:this.R(0,0.5)+0.5,color:"hsl("+this.R(170,360)+",50%,50%)"});
            this.animm(div, h);
            console.log("Adding sprite:")
        };


    }

    animm(elm:SpriteComponent, h:number):void{
        TweenMax.to(elm,this.R(0,5)+3,{y:h,ease:Linear.easeNone,repeat:-1, delay:-5});
        TweenMax.to(elm,this.R(0,5)+1,{x:'+=70', repeat:-1,yoyo:true,ease:Sine.easeInOut})
        TweenMax.to(elm,this.R(0,1)+0.5,{opacity:0, repeat:-1,yoyo:true,ease:Sine.easeInOut})
    };

    R(min:number, max:number):number{ return min + ( Math.random() * (max - min)) };*/
}
