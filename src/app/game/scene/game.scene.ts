import {Background, Helper, RendererController, StateContainer} from '@app/game';
import {Graphics, Point, Texture} from 'pixi.js';
import {ContainerComponent} from '@app/components/container.component';
import {SpriteComponent} from '@app/components/sprite.component';
import {BitmapTextComponent} from '@app/components/bitmap-text.component';
import {BallGeneratorBehavior} from '../board/ball-generator.behavior';
import {BallSliderBehavior} from '../board/ball-slider.behavior';
import {BoardBehavior} from '../board/board.behavior';
import {Resources} from '@app/utils/resources.utils';
import {PowerupCounterBehavior} from '../board/powerup-counter.behavior';
import {PowerupConsumerBehavior} from '../board/powerup-consumer.behavior';
import {PieceKeyBehavior} from '../board/piece-key.behavior';
import {GameModelData, GameModelPropType, PowerList} from '@models/game-model.data';
import {EventManager} from '@app/components/event-manager.component';
// import { TweenMax } from 'gsap';
import {PieceCounterBehavior} from '../board/piece-counter.behavior';
import {ComponentBase} from '@app/core/component.core';
import {ButtonBehavior} from '@app/behaviors/button.behavior';
import {TimeEvent, Timer} from '@app/utils/timer.utils';
import {GraphicsComponent} from '@app/components/graphics.component';
import {ButtonComponent} from '../board/button.component';
import {SpeedChangeBehavior} from '../board/speed-change.behavior';
import {FacebookInstant} from '@app/services/facebook-instant';
import {LocaleHelper} from "@app/components/locale.componenet";
import {Bounce, TweenMax} from "gsap";

export class GameScene extends StateContainer {

  private ballGenerator: BallGeneratorBehavior;
  private powerupCounter: PowerupCounterBehavior;
  private powerupConsumer: PowerupConsumerBehavior;
  private pieceCounter: PieceCounterBehavior;

  private topBar: ContainerComponent;
  private bottomBar: SpriteComponent;
  private counterComp: ContainerComponent;
  private pauseScreenComp: ContainerComponent;
  private gameOverCounter:TimeEvent;
  private endGameContainer:ContainerComponent;
  private isAdUsed:boolean;
  private isExtraAdUsed:boolean;
  //private isGameRunning: boolean;

  constructor() {
    super()
  }

  resize(): void {
    this.topBar.element.y = -RendererController.Instance.center.y;
    this.bottomBar.element.y = RendererController.Instance.center.y;
    
    if (this.pauseScreenComp) {
      this.pauseScreenComp.emitToChildren('resize', 'resize');
    }
  }

  protected init(): void {

    this.isAdUsed = false;
    this.isExtraAdUsed = false;

    const background: Background = new Background();
    this.addChild(background);

    this.createBehaviors();

    this.createBallCounter(new Point(0, -360));

    this.createBoard(new Point(0, -140));

    this.createBoard(new Point(0, 120));

    this.createPiecesCounter(new Point(180, -215));

    this.createBottomBar();

    RendererController.Instance.resizeHandler();
    //this.isGameRunning = true;

    Timer.Instance.paused = false;
    FacebookInstant.instance.isGamePlayed = true;
    const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable(Resources.getConfig().ads.game);

    if(!isRewardVisible) {
      FacebookInstant.instance.cacheRewarded(Resources.getConfig().ads.game, () => {
        Helper.log("Present game ball cached ad");
      });
    }

    FacebookInstant.instance.addPause(() =>
        {
          //Log.instance.warn("on Paused called");
          this.pauseScreen()
        }
    );
    //todo tarun remove in prod
    //this.createCoinAdsButton(Resources.getConfig().ads_win_extra_ball);

  }

  createBehaviors(): void {

    this.pieceCounter = new PieceCounterBehavior();

    this.ballGenerator = new BallGeneratorBehavior({
      balls: this.getTotalBalls(),
      interval: 2400
    });
    this.ballGenerator.on('finished', () => this.onFinishLevel());

    this.powerupCounter = new PowerupCounterBehavior({
      numberOfElements: 6,
      textureNormal: Resources.getTexture('marker-disabled', 'content'),
      textureMarked: Resources.getTexture('marker-enabled', 'content'),
      distance: new Point(46, 0)
    });

    this.powerupConsumer = new PowerupConsumerBehavior({
      powers: GameModelData.instance.items
    });

    this.powerupCounter.on('completed', () => {

      if (this.powerupConsumer.onRelease()) {
        this.powerupCounter.reset();
      }

    })
  }
  private getTotalBalls(): number {
    let initial = Resources.getConfig().total_balls;
    if(GameModelData.instance.isExtraCalls)
    {
      initial += 2;
      console.warn("Received extra 2 calls");
    }

    GameModelData.instance.isExtraCalls = false;

    GameModelData.instance.items.forEach((value: PowerList) => {
      if (value === 'extra-ball') {
        initial++;
      }
    })

    return initial;
  }

  createBoard(position: Point): void {
    const boardBehavior: BoardBehavior = new BoardBehavior({

    });
    new SpriteComponent({
      tag: ['number-generator', 'add-powerup'],
      parent: this,
      element: {
        position: position,
      },
      behavior: [
        boardBehavior,
        this.ballGenerator,
        this.powerupConsumer
      ]
    })
      .texture('ticket', 'background').anchor(0.5)
      .on('number-generator', (_: SpriteComponent, newvalue: number) => {
        boardBehavior.onGetNumber(newvalue);
      }).on('add-powerup', (_: ContainerComponent, behavior: PieceKeyBehavior) => {
        boardBehavior.addExtraBehaviorToFreePiece(behavior);
      })
  }

  createBallCounter(position: Point): void {

    this.topBar = new ContainerComponent({
      parent: this,
      element: {
        position: position,
        // scale: new Point(0.8,0.8)
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(-1,1)
          }
        }).texture('top-bar', 'background').anchor(0.5, 0),
        new ContainerComponent({
          tag: ['number-generator'],
          element: {
            position: new Point(1, 39)
          },
          behavior: [
            new BallSliderBehavior({
              eventName: 'number-generator',
              quantity: 5
            })
          ]
        }),
        new ContainerComponent({
          element: {
            position: new Point(-166, 44),
          },
          children: [
            new BitmapTextComponent({
              tag: ['number-generator'],
              element: {
                text: this.ballGenerator.ballsLeft.toString(),
                font: '34px lobster',
                tint: 0x7fe9ef,
                anchor: new Point(0.5, 0.5)
              }
            }).on('number-generator', (self: BitmapTextComponent, _: number, ballsLeft: number) => {
              self.text(ballsLeft.toString());
            })
          ]
        }),
        new ContainerComponent({
          tag: ['number-generator'],
          element: {
            position: new Point(-110, 70)
          },
          behavior: [
            this.powerupCounter
          ]
        }).on('number-generator', () => this.powerupCounter.onUpdateCounter()),
        new ContainerComponent({
          tag: ['powerup'],
          element: {
            position: new Point(-168, 45)
          },
          children: [
            new SpriteComponent({
              element: {
                scale: new Point(0.8, 0.8)
              }
            }).texture('bottom-marker-background', 'content').anchor(0.5),
            new SpriteComponent({
              tag: ['get-powerup'],
              element: {
                scale: new Point(0.4, 0.4)
              }
            }).anchor(0.5).on('get-powerup', (comp: ComponentBase, behavior: PieceKeyBehavior) => {


              if (behavior == null) {
                (comp as SpriteComponent).element.parent.visible = false;
              } else {
                (comp as SpriteComponent).element.parent.visible = true;
                (comp as SpriteComponent).element.texture = behavior.props.icon;
              }
            })
          ]
        })
      ],
      behavior: [
        this.ballGenerator,
        this.powerupConsumer
      ]
    });

  }

  createBottomBar(): void {

    this.bottomBar = new SpriteComponent({
      parent: this,
      element: {
        position: new Point(0, 360),
      }
    }).texture('botton-bar', 'background').anchor(0.5, 1)

    this.createItemCounter('powers-keys', new Point(-60, -60), Resources.getTexture('key', 'content'))
    this.createItemCounter('powers-coins', new Point(40, -60), Resources.getTexture('coin', 'content'))
    this.createItemCounter('powers-bingos', new Point(140, -60), Resources.getTexture('bingo-icon', 'content'))
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
        }).texture('cog-icon', 'content').anchor(0.5)
      ],
      behavior: [
        new ButtonBehavior({
          click: () => {
            this.pauseScreen();
          }
        })
      ]
    }).texture('circular-button', 'content').anchor(0.5)
  }

  pauseScreen(): void {
    ///console.error("OnPaused:");
   /* if(Timer.Instance.paused || !this.isGameRunning) {
      return;
    }*/

    Timer.Instance.paused = true;

    const container: ContainerComponent = new ContainerComponent({
      parent: this,
      element: {

      },
      children: [
        new GraphicsComponent({
          tag: ['resize'],
          element: {
            interactive: true,
          }
        }).draw((value: Graphics) => {
          value.beginFill(0x000000, 0.7).drawRect(0, 0, 1, 1).endFill()
          value.position.set(-RendererController.Instance.center.x, -RendererController.Instance.center.y)
          value.width = RendererController.Instance.center.x * 2;
          value.height = RendererController.Instance.center.y * 2;
        }).on('resize', (comp: ComponentBase) => {
          comp.element.position.set(-RendererController.Instance.center.x, -RendererController.Instance.center.y)
          comp.element.width = RendererController.Instance.center.x * 2;
          comp.element.height = RendererController.Instance.center.y * 2;
        }),
        new SpriteComponent({
          element: {

          }
        }).anchor(0.5).texture('ticket', 'background'),
        new BitmapTextComponent({
          element: {
            position: new Point(0, -100),
            text: LocaleHelper.Instance.getLocale("paused"), //'Paused',
            font: '40px lobster',
            tint: 0x000000,
            anchor: new Point(0.5, 0.5)
          }
        }),
        new ButtonComponent({
          element: {
            position: new Point(100, -110),
            scale: new Point(0.7, 0.7)
          }
        }).text('X').AddCallback(() => {
          container.destroy();
          Timer.Instance.paused = false;
        }).texture('circular-close-button', 'content'),
        new ContainerComponent({
          element: {
            position: new Point(0, 0),
          },
          behavior: [
            new SpeedChangeBehavior({
              min: 1, max: 5, default: this.ballGenerator.speed,
              onChange: (value: number) => {
                this.ballGenerator.changeSpeed(value);
              }
            })
          ]
        }),
        new ButtonComponent({
          element: {
            position: new Point(0, 75),
            visible: true
          }
        }).text('Exit Game').AddCallback(() => {
          /*
          FacebookInstant.instance.showInterstitialAd(()=>{
            this.onForceQuit();
          });*/
          this.onForceQuit();

        }),
      ]
    })

  }

  createItemCounter(name: GameModelPropType, position: Point, tex: Texture): void {

    const sprite: SpriteComponent = new SpriteComponent({
      parent: this.bottomBar.element,
      element: {
        position: position
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5, 0.5),
            position: new Point(0, 0),
            texture: tex,
          }
        }).anchor(0.5),
        new SpriteComponent({
          element: {
            position: new Point(19, 30),
          }
        }).anchor(0.5).texture('bottom-marker-number', 'content'),
        new BitmapTextComponent({
          tag: ['text'],
          element: {
            position: new Point(18, 28),
            text: '0',
            font: '20px arial',
            tint: 0x000000,
            anchor: new Point(0.5, 0.5)
          }
        }).on('text', (comp: BitmapTextComponent, value: number) => {
          comp.text(value.toString());
        })
      ]
    }).anchor(0.5).texture('bottom-marker-background', 'content');

    GameModelData.instance.on(name, (value: number) => {
      sprite.emitToChildren('text', 'text', value);
    })

  }

  private createPiecesCounter(value: Point): void {
    this.counterComp = new ContainerComponent({
      parent: this,
      tag: ['number-generator'],
      element: {
        position: value,
      },
      behavior: [
        this.pieceCounter,
        this.ballGenerator
      ]
    });
    this.counterComp.on('number-generator', (_: ComponentBase, value: number) => {
      this.pieceCounter.onReiceveValue(value);
    })
  }

  private onFinishLevel(): void {
    //this.isGameRunning = false;
    const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable(Resources.getConfig().ads.game);
    if(isRewardVisible)
      this.createAdsButton(Resources.getConfig().ads_win_extra_ball);

    if(this.isAdUsed && !this.isExtraAdUsed){

      const isRewardVisible: Boolean = FacebookInstant.instance.isRewardedAdAvailable(Resources.getConfig().ads.extraballs);
      Helper.log("Checking extra ball cached ad", isRewardVisible);
      if (isRewardVisible) {
        this.isAdUsed = false;
        this.createAdsButton(Resources.getConfig().ads_win_extra_ball_second);
        Helper.log("Created extra ball cached ad");
      }
    }

    this.endGameContainer = this.createGameOverCountdown();

    let counter = 20;
    this.gameOverCounter = Timer.Instance.setInterval(() => {
      counter--;
      this.endGameContainer.emitToChildren('text', 'text', counter);
      if (counter === 0) {
        EventManager.Instance.emit('change-state', 'endgame')
        FacebookInstant.instance.removePause()
      }
    }, 1000, 20);

  }
  createGameOverCountdown():ContainerComponent {
    return new ContainerComponent({
      parent: this.topBar.element,
      element: {
        position: new Point(-168, 45),
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.8, 0.8),
            tint: 0x00FFFF
          }
        }).texture('bottom-marker-background', 'content').anchor(0.5),
        new BitmapTextComponent({
          tag: ['text'],
          element: {
            text: 'GAME\nOVER\n20s',
            align: 'center',
            font: '10px arial',
            tint: 0xEEEEEE,
            anchor: new Point(0.5, 0.5)
          }
        }).on('text', (elem: ComponentBase, value: number) => {
          (elem as BitmapTextComponent).text(`GAME\nOVER\n${value}s`);
        })
      ]
    });
  }

  createAdsButton(award: number): void {
    if(this.isAdUsed) {
      return;
    }
    this.isAdUsed = true;

    let element = new SpriteComponent({
      parent: this,
      element: {
        position: new Point(175, -300),
        scale: new Point(0.8, 0.8),
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5, 0.5),
            tint: 0x444444,
            blendMode: 2,
            position: new Point(-40, -3)
          }
        }).texture('icon-ads', 'content').anchor(0.5),
        new BitmapTextComponent({
          element: {
            position: new Point(11, 4),
            text: `+${award}\nBalls`,
            align: 'center',
            font: '24px arial',
            tint: 0x555555,
            anchor: new Point(0.5, 0.65)
          }
        }).blendMode(2)
      ],
      behavior: [
        new ButtonBehavior({
          click: (comp: ComponentBase) => this.onClickAds(comp, award)
        })
      ],
    }).anchor(0.5).texture('button-ads', 'content');
    TweenMax.fromTo(element.element.scale, 0.3, {x: 0.7,y: 0.7}, {x: 0.8, y: 0.8, yoyo: true, repeat: -1, repeatDelay: 0.2, ease: Bounce.easeInOut});
  }

  createCoinAdsButton(award: number): void {

    let element = new SpriteComponent({
      parent: this,
      element: {
        position: new Point(175, -300),
        scale: new Point(1, 0.8),
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.4, 0.4),
            //tint: 0x444444,
            //blendMode: 2,
            position: new Point(-50, -3)
          }
        }).texture('coin', 'content').anchor(0.5),

        new BitmapTextComponent({
          element: {
            position: new Point(14, 7),
            text: `+${award} Balls`,
            align: 'center',
            font: '24px arial',
            tint: 0x555555,
            anchor: new Point(0.4, 1)
          }
        }),
        new BitmapTextComponent({
          element: {
            position: new Point(11, 5),
            text: `200 Coins`,
            align: 'center',
            font: '24px arial',
            tint: 0x555555,
            visible:false,
            anchor: new Point(0.5, 0.2)
          }}).blendMode(2)
      ],
      behavior: [
        new ButtonBehavior({
          click: (comp: ComponentBase) => this.onClickAds(comp, award)
        })
      ],
    }).anchor(0.5).texture('button', 'content');
    TweenMax.fromTo(element.element.scale, 0.5, {x: 0.8,y: 0.8}, {x: 0.76, y: 0.76, yoyo: true, repeat: -1, repeatDelay: 0.4, ease: Bounce.easeInOut});
  }

  onClickAds(comp: ComponentBase, award: number):void {

    comp.destroy();
    this.gameOverCounter.isRunning = false;

    if(award == Resources.getConfig().ads_win_extra_ball) {
      FacebookInstant.instance.cacheRewarded(Resources.getConfig().ads.extraballs, ()=>{
        Helper.log("Received extra ball cached ad");
      });
    }else{
      this.isExtraAdUsed = true;
    }
    FacebookInstant.instance.showRewardedAd( award == Resources.getConfig().ads_win_extra_ball
        ? Resources.getConfig().ads.game
        : Resources.getConfig().ads.extraballs,
        () => {
      this.onCompleteVideo(award);
    }, (_: any) => {
      this.onFailVideo();
    })
   /*   FacebookInstant.instance.playVideo(() => {
        this.onCompleteVideo();
      }, (_: any) => {
        this.onFailVideo();
      })*/

  }

  private onCompleteVideo(award: number):void {
    Timer.Instance.clear(this.gameOverCounter.id);
    this.endGameContainer.destroy();

    this.ballGenerator.change('waiting');
    this.ballGenerator.addExtraBalls(award);
    this.ballGenerator.generate();
  }
  private onFailVideo():void {
    this.gameOverCounter.isRunning = true;
  }


  private onForceQuit(): void {

    GameModelData.instance.powerCoins = 0;
    GameModelData.instance.powerBingos = 0;
    GameModelData.instance.powerDaub = 0;
    GameModelData.instance.powerDaub2 = 0;
    GameModelData.instance.powerKeys = 0;

    this.powerupCounter.destroy();
    this.powerupConsumer.destroy();
    this.pieceCounter.destroy();
    this.ballGenerator.destroy();
    Timer.Instance.paused = false;
    FacebookInstant.instance.removePause()
    EventManager.Instance.emit('change-state', 'map');
  }


}
