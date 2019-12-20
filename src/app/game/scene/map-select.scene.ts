
import {
    StateContainer,
    EventManager, FacebookInstant, Resources
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
import { SoundController } from '@app/controller/sound.controller';
import { Bounce, TweenMax} from "gsap";


export class MapSelectScene extends StateContainer {

    private lastOpened:boolean;
    private counter:BingoCounterComponent;
    private background:Graphics;
    private bottomBar: SpriteComponent;

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

        RendererController.Instance.resizeHandler()
    }

    createMap():void {


        new SpriteComponent({
            parent: this,
            element: {
                position: new Point(0, RendererController.Instance.center.y)
            },
            children: this.addLevelsToChildren(),
            behavior: [
                new ScrollingBehavior()
            ]
        }).anchor(0.5, 1).texture('map', 'background')

    }


    addLevelsToChildren():ContainerComponent[] {
        const containers:ContainerComponent[] = [];

        containers.push(this.createLevel( 1,  0, new Point( 145, -133)));
        containers.push(this.createLevel( 2,  3, new Point(  12, -145)));
        containers.push(this.createLevel( 3,  6, new Point( -89, -156)));
        containers.push(this.createLevel( 4,  9, new Point(-186, -189)));
        containers.push(this.createLevel( 5, 12, new Point(-109, -251)));
        containers.push(this.createLevel( 6, 16, new Point(   7, -256)));
        containers.push(this.createLevel( 7, 20, new Point( 109, -272)));
        containers.push(this.createLevel( 8, 24, new Point( 209, -325)));
        containers.push(this.createLevel( 9, 28, new Point( 150, -380)));
        containers.push(this.createLevel(10, 32, new Point(  36, -382)));

        containers.push(this.createLevel(11, 36, new Point( -63, -389)));
        containers.push(this.createLevel(12, 40, new Point(-152, -413)));
        containers.push(this.createLevel(13, 45, new Point(-176, -486)));
        containers.push(this.createLevel(14, 50, new Point( -89, -503)));
        containers.push(this.createLevel(15, 55, new Point(   7, -508)));
        containers.push(this.createLevel(16, 60, new Point( 103, -520)));
        containers.push(this.createLevel(17, 65, new Point( 189, -562)));
        containers.push(this.createLevel(18, 70, new Point( 147, -626)));
        containers.push(this.createLevel(19, 75, new Point(  60, -631)));
        containers.push(this.createLevel(20, 80, new Point( -28, -641)));

        containers.push(this.createLevel(21, 85, new Point(-118, -665)));
        containers.push(this.createLevel(22, 90, new Point(-177, -716)));
        containers.push(this.createLevel(23, 95, new Point(-162, -789)));
        containers.push(this.createLevel(24, 100, new Point( -66, -792)));
        containers.push(this.createLevel(25, 110, new Point(  37, -805)));
        containers.push(this.createLevel(26, 120, new Point( 126, -829)));
        containers.push(this.createLevel(27, 130, new Point( 191, -884)));
        containers.push(this.createLevel(28, 140, new Point( 182, -940)));
        containers.push(this.createLevel(29, 150, new Point(  90, -960)));
        containers.push(this.createLevel(30, 160, new Point(  -5, -970)));

        containers.push(this.createLevel(31, 170, new Point( -97, -992)));
        containers.push(this.createLevel(32, 180, new Point(-166,-1038)));
        containers.push(this.createLevel(33, 190, new Point(-166,-1119)));
        containers.push(this.createLevel(34, 200, new Point( -74,-1125)));

        containers.push(this.createLevel(35,210, new Point(  18,-1135)));
        containers.push(this.createLevel(36,220, new Point( 116,-1150)));
        containers.push(this.createLevel(37,230, new Point( 189,-1203)));
        containers.push(this.createLevel(38,240, new Point( 118,-1253)));
        containers.push(this.createLevel(39,250, new Point(  13,-1253)));
        containers.push(this.createLevel(40,270, new Point( -85,-1270)));
        containers.push(this.createLevel(41,290, new Point(-161,-1312)));
        containers.push(this.createLevel(42,310, new Point(-173,-1392)));
        containers.push(this.createLevel(43,330, new Point( -82,-1413)));
        containers.push(this.createLevel(44,350, new Point(  25,-1414)));
        containers.push(this.createLevel(45,370, new Point( 120,-1440)));
        containers.push(this.createLevel(46,390, new Point( 183,-1495)));
        containers.push(this.createLevel(47,420, new Point( 103,-1533)));
        containers.push(this.createLevel(48,450, new Point(  18,-1533), true));


        containers.sort( (a:ContainerComponent, b:ContainerComponent) => {
            return a.element.y - b.element.y
        });


        return containers;
    }

    createLevel(value:number, required:number, position:Point, isLast:boolean = false):ContainerComponent {

        const locked:boolean = required > GameModelData.instance.bingos;
        const areAllOpened:boolean = GameModelData.instance.bingos >= 449;
        if(!locked) {
            this.lastOpened = true;
        }
        const isNextOpen:boolean = (required+3 > GameModelData.instance.bingos && !isLast);
//    TweenMax.from(image.scale, 0.2, {x: 0.1, y: 0.1, ease: Bounce.easeOut})
        const container:ContainerComponent = new ContainerComponent({
            element: {
                position: position,
                visible: true
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
                        visible: locked && this.lastOpened || areAllOpened,
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
        if(isNextOpen && !locked)
            TweenMax.fromTo(container.element.scale, 0.3, {x: 1,y: 1}, {x: 1.05, y: 1.05, yoyo: true, repeat: -1, repeatDelay: 0.2, ease: Bounce.easeInOut});

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
        SoundController.instance.audio('sfx').play('collect');
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

        this.createItemCounter( new Point(-60, -50), Resources.getTexture('bingoicon'),'2458786131022945');
        this.createItemCounter( new Point(40, -50), Resources.getTexture('sudokuicon'),'836916043371368');
        this.createItemCounter( new Point(140, -50), Resources.getTexture('idlepizza'),'958968481102514');
        // this.createItemCounter('powers-daub', new Point( 150, -60), Resources.getTexture('star-icon', 'content'))

        this.createButtonSettings();
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
}
