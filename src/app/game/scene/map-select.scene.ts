
import {
    StateContainer,
    EventManager, FacebookInstant
} from '@app/game';
import { RendererController } from '@app/controller/renderer.controller';
import { SpriteComponent } from '@app/components/sprite.component';
import {Point, Graphics, Texture} from 'pixi.js';
import { ScrollingBehavior } from '../map/scrolling.behavior';
import { ContainerComponent } from '@app/components/container.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { BingoCounterComponent } from '../map/bingo-counter.component';
import { ButtonBehavior } from '@app/behaviors/button.behavior';
import { ComponentBase } from '@app/core/component.core';
import { GameModelData } from '@models/game-model.data';
import { Bounce, TweenMax, Sine} from "gsap";


export class MapSelectScene extends StateContainer {

    private lastOpened:boolean;
    private counter:BingoCounterComponent;
    private background:Graphics;
    private bottomBar: SpriteComponent;
    //private mapSprite: SpriteComponent;

    constructor () {
        super();
    }

    protected init():void {

        this.background = new Graphics();
        this.background.beginFill(0x91bd00);
        this.background.drawRect(0,0,1,1);
        this.background.endFill();
        this.addChild(this.background);

        this.createMap();

        this.subscribeBot();

        this.createBingoCounter();
        this.createBottomBar();

        this.checkEntryPoints();

        RendererController.Instance.resizeHandler()
    }

    createMap():void {
        let childComps: ContainerComponent[];
        //GameModelData.instance.bingos = 659;
        if(GameModelData.instance.bingos >= 659){
            childComps = this.addLevelsToChildren(1);
        }
        else{
            childComps = this.addLevelsToChildren(0);
        }

        new SpriteComponent({
            parent: this,
            element: {
                position: new Point(0, RendererController.Instance.center.y)
            },
            children: childComps,
            behavior: [
                new ScrollingBehavior()
            ]
        }).anchor(0.5, 1).texture('map', 'background')

    }


    addLevelsToChildren(level: number):ContainerComponent[] {
        const containers:ContainerComponent[] = [];

        containers.push(this.createLevel( 1 + (level * 53),  (level * 659), new Point( 145, -133)));
        containers.push(this.createLevel( 2+ (level * 53),  3+(level * 659), new Point(  12, -145)));
        containers.push(this.createLevel( 3+ (level * 53),  6+(level * 659), new Point( -89, -156)));
        containers.push(this.createLevel( 4+ (level * 53),  9+(level * 659), new Point(-186, -189)));
        containers.push(this.createLevel( 5+ (level * 53), 12+(level * 659), new Point(-109, -251),4));
        containers.push(this.createLevel( 6+ (level * 53), 16+(level * 659), new Point(   7, -256),4));
        containers.push(this.createLevel( 7+ (level * 53), 20+(level * 659), new Point( 109, -272),4));
        containers.push(this.createLevel( 8+ (level * 53), 24+(level * 659), new Point( 209, -325),4));
        containers.push(this.createLevel( 9+ (level * 53), 28+(level * 659), new Point( 150, -380),4));
        containers.push(this.createLevel(10+ (level * 53), 32+(level * 659), new Point(  36, -382),4));

        containers.push(this.createLevel(11+ (level * 53), 36+(level * 659), new Point( -63, -389),4));
        containers.push(this.createLevel(12+ (level * 53), 40+(level * 659), new Point(-152, -413),5));
        containers.push(this.createLevel(13+ (level * 53), 45+(level * 659), new Point(-176, -486),5));
        containers.push(this.createLevel(14+ (level * 53), 50+(level * 659), new Point( -89, -503),5));
        containers.push(this.createLevel(15+ (level * 53), 55+(level * 659), new Point(   7, -508),5));
        containers.push(this.createLevel(16+ (level * 53), 60+(level * 659), new Point( 103, -520),5));
        containers.push(this.createLevel(17+ (level * 53), 65+(level * 659), new Point( 189, -562),5));
        containers.push(this.createLevel(18+ (level * 53), 70+(level * 659), new Point( 147, -626),5));
        containers.push(this.createLevel(19+ (level * 53), 75+(level * 659), new Point(  60, -631),5));
        containers.push(this.createLevel(20+ (level * 53), 80+(level * 659), new Point( -28, -641),5));

        containers.push(this.createLevel(21+ (level * 53), 85+(level * 659), new Point(-118, -665),5));
        containers.push(this.createLevel(22+ (level * 53), 90+(level * 659), new Point(-177, -716),5));
        containers.push(this.createLevel(23+ (level * 53), 95+(level * 659), new Point(-162, -789),5));
        containers.push(this.createLevel(24+ (level * 53), 100+(level * 659), new Point( -66, -792),10));
        containers.push(this.createLevel(25+ (level * 53), 110+(level * 659), new Point(  37, -805),10));
        containers.push(this.createLevel(26+ (level * 53), 120+(level * 659), new Point( 126, -829),10));
        containers.push(this.createLevel(27+ (level * 53), 130+(level * 659), new Point( 191, -884),10));
        containers.push(this.createLevel(28+ (level * 53), 140+(level * 659), new Point( 182, -940),10));
        containers.push(this.createLevel(29+ (level * 53), 150+(level * 659), new Point(  90, -960),10));
        containers.push(this.createLevel(30+ (level * 53), 160+(level * 659), new Point(  -5, -970),10));

        containers.push(this.createLevel(31+ (level * 53), 170+(level * 659), new Point( -97, -992),10));
        containers.push(this.createLevel(32+ (level * 53), 180+(level * 659), new Point(-166,-1038),10));
        containers.push(this.createLevel(33+ (level * 53), 190+(level * 659), new Point(-166,-1119),10));
        containers.push(this.createLevel(34+ (level * 53), 200+(level * 659), new Point( -74,-1125),10));

        containers.push(this.createLevel(35+ (level * 53),210+(level * 659), new Point(  18,-1135),10));
        containers.push(this.createLevel(36+ (level * 53),220+(level * 659), new Point( 116,-1150),10));
        containers.push(this.createLevel(37+ (level * 53),230+(level * 659), new Point( 189,-1203),10));
        containers.push(this.createLevel(38+ (level * 53),240+(level * 659), new Point( 118,-1253),10));
        containers.push(this.createLevel(39+ (level * 53),250+(level * 659), new Point(  13,-1253),20));
        containers.push(this.createLevel(40+ (level * 53),270+(level * 659), new Point( -85,-1270),20));
        containers.push(this.createLevel(41+ (level * 53),290+(level * 659), new Point(-161,-1312),20));
        containers.push(this.createLevel(42+ (level * 53),310+(level * 659), new Point(-173,-1392),20));
        containers.push(this.createLevel(43+ (level * 53),330+(level * 659), new Point( -82,-1413),20));
        containers.push(this.createLevel(44+ (level * 53),350+(level * 659), new Point(  25,-1414),20));
        containers.push(this.createLevel(45+ (level * 53),370+(level * 659), new Point( 120,-1440),20));
        containers.push(this.createLevel(46+ (level * 53),390+(level * 659), new Point( 183,-1495),30));
        containers.push(this.createLevel(47+ (level * 53),420+(level * 659), new Point( 103,-1533),30));
        containers.push(this.createLevel(48+ (level * 53),450+(level * 659), new Point(  18,-1533), 30));
        containers.push(this.createLevel(49+ (level * 53),480+(level * 659), new Point(  -68,-1545), 30));
        containers.push(this.createLevel(50+ (level * 53),510+(level * 659), new Point(  -140,-1562), 30));
        containers.push(this.createLevel(51+ (level * 53),540+(level * 659), new Point(  -170,-1610), 40));
        containers.push(this.createLevel(52+ (level * 53),580+(level * 659), new Point(  -115,-1645), 40));
        containers.push(this.createLevel(53+ (level * 53),620+(level * 659), new Point(  -40,-1660), 40));
        containers.push(this.createLevel(54+ (level * 53),660+(level * 659), new Point(  -100,-1665), 0,true));


        //console.log("containers[0].element", containers[containers.length - 1].element, containers[1].element.y);
        containers.sort( (a:ContainerComponent, b:ContainerComponent) => {
            return a.element.y - b.element.y
        });


        return containers;
    }

    createLevel(value:number, required:number, position:Point, nextReq:number = 3, isLast:boolean = false):ContainerComponent {

        const locked:boolean = required > GameModelData.instance.bingos;
        //const areAllOpened:boolean = GameModelData.instance.bingos > 620;
        if(!locked) {
            this.lastOpened = true;
        }
        const isNextOpen:boolean = ((required + nextReq) > GameModelData.instance.bingos && !isLast);
//    TweenMax.from(image.scale, 0.2, {x: 0.1, y: 0.1, ease: Bounce.easeOut})
        const container:ContainerComponent = new ContainerComponent({
            element: {
                position: position,
                visible: isNextOpen 

            },
            children: [
                new SpriteComponent({
                    element: {
                        scale: new Point(0.7,0.7),
                        position: new Point(0, -16)
                    }
                })
                    .anchor(0.5).texture(locked ? 'level-item-locked': 'level-item-open', 'content'),
                new BitmapTextComponent({
                    element: {
                        position: new Point(0, -25),
                        text: value.toString(),
                        font: '34px lobster',
                        tint: 0x333333,
                        anchor: new Point(0.5,0.5)
                    }
                }),
                new ContainerComponent({
                    element: {
                        position: new Point(0, -70),
                        // tarun && will hide played levels
                        visible: locked && this.lastOpened,
                    },
                    children: [
                        new SpriteComponent({
                            element: {
                                // scale: new Point(0.4,0.6)
                            }
                        }).anchor(0.5).texture('modal-message', 'content'),
                        new BitmapTextComponent({
                            element: {
                                letterSpacing: -5,
                                position: new Point(0, -5),
                                text: `${GameModelData.instance.bingos} of ${required}`,
                                font: '24px arial',
                                tint: 0x333333,
                                anchor: new Point(0.5,0.5)
                            }
                        })
                    ]
                })
            ],
            behavior: locked ? [] : [
                new ButtonBehavior({
                    click: (_:ComponentBase) => this.onClickLevel(value)
                })
            ]
        });

        if(locked) {
            this.lastOpened = false;
        }
        container.element.name += `_${value}`;
        if(isNextOpen && !locked) {
            TweenMax.fromTo(container.element.scale, 0.3, {x: 1, y: 1}, {
                x: 1.05,
                y: 1.05,
                yoyo: true,
                repeat: -1,
                repeatDelay: 0.2,
                ease: Bounce.easeInOut
            });
        }
        return container;
    }

    createBingoCounter():void {
        this.counter = new BingoCounterComponent({
            parent: this,
            element: {
                position: new Point(0,-330)
            }
        });
    }

    resize():void {
        if(!this.counter || !this.counter.element) {
            return;
        }
        this.counter.element.y = -RendererController.Instance.center.y + 44;
        this.bottomBar.element.y = RendererController.Instance.center.y ;
        this.background.x = -RendererController.Instance.center.x;
        this.background.y = -RendererController.Instance.center.y;
        this.background.width = RendererController.Instance.center.x * 2;
        this.background.height = RendererController.Instance.center.y * 2;
    }

    onClickLevel(_:number):void {
        //SoundController.instance.audio('sfx').play('collect');
        EventManager.Instance.emit('change-state', 'power');
    }

    subscribeBot():void {
        FacebookInstant.instance.showBot(()=>{
            if((parseInt(window.localStorage.getItem('shortcut')) || 0) == 0)
                FacebookInstant.instance.createShortcut();
        });
    }

    createBottomBar(): void {

        this.bottomBar = new SpriteComponent({
            parent: this,
            element: {
                position: new Point(0, RendererController.Instance.center.y ),
            }
        }).texture('botton-bar', 'background').anchor(0.5, 1);

        //this.createItemCounter( new Point(-60, -50), Resources.getTexture('bingoicon'),'2458786131022945');
        //this.createItemCounter( new Point(40, -50), Resources.getTexture('sudokuicon'),'836916043371368');
        //this.createItemCounter( new Point(140, -50), Resources.getTexture('idlepizza'),'958968481102514');

        //this.createItemCounter('powers-daub', new Point( 150, -60), Resources.getTexture('star-icon', 'content'))

        this.createButtonSettings();
        if(FBInstant.getSupportedAPIs().includes("payments.purchaseAsync")){
            FBInstant.payments.onReady(()=> {
                this.createInappButton();
            });
        }
    }

    createButtonSettings(): void {
        new SpriteComponent({
            parent: this.bottomBar.element,
            element: {
                position: new Point(-160, -36)
            },
            children: [
                new SpriteComponent({
                    element: {
                        position: new Point(0, -4),
                        scale: new Point(0.7, 0.7),
                        blendMode: 2,
                        tint: 0x555555
                    }
                }).texture('icon-tropy', 'content').anchor(0.5)
            ],
            behavior: [
                new ButtonBehavior({
                    click: () => {
                        EventManager.Instance.emit('change-state', 'social');
                    }
                })
            ]
        }).texture('circular-button', 'content').anchor(0.5)
    }

    createInappButton(): void {
       let inappBtn: SpriteComponent =  new SpriteComponent({
            parent: this.bottomBar.element,
            element: {
                position: new Point(-160, -105)
            },
            children: [
                new SpriteComponent({
                    element: {
                        position: new Point(0, -4),
                        scale: new Point(0.7, 0.7),
                       /* blendMode: 2,
                        tint: 0x555555*/
                    }
                }).texture('shop').anchor(0.5)
            ],
            behavior: [
                new ButtonBehavior({
                    click: () => {
                        EventManager.Instance.emit('change-state', 'inapp');
                        FacebookInstant.instance.logEvent("eOpenShop", 1);
                    }
                })
            ]
        })
        TweenMax.fromTo(inappBtn.element.scale, 0.5, {x: 0.7,y: 0.7}, {x: 0.8, y: 0.8, yoyo: true, repeat: -1, repeatDelay: 0.3, ease: Sine.easeInOut});

    }

    createItemCounter(position: Point, tex: Texture, gameId: string): void {

       new SpriteComponent({
            parent: this.bottomBar.element,
            element: {
                position: position
            },
            children: [
                new SpriteComponent({
                    element: {
                        scale: new Point(0.60, 0.60),
                        position: new Point(0, 0),
                        texture: tex,
                    }
                }).anchor(0.5),

            ],
           behavior: [
               new ButtonBehavior({
                   click: () => {
                       FacebookInstant.instance.logEvent("e_game_open_"+ gameId, 1);
                       FacebookInstant.instance.openGame(gameId, ()=>{
                           FacebookInstant.instance.logEvent("e_game_open_success_"+ gameId, 1);
                       });
                   }
               })
           ]
        }).anchor(0.5).texture('bottom-marker-background', 'content')
    }

     checkEntryPoints():void {
         /*let entryPoints = FBInstant.getEntryPointData();
         Log.Instance.log("Entry points:", entryPoints);*/
    }
}
