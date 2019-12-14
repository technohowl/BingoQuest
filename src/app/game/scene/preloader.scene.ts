import { loader } from 'pixi.js'
import { EventManager, StateContainer, RendererController } from '@app/game'
import { GameModelData, GameModelProps } from '@models/game-model.data';
import { FacebookInstant } from '@app/services/facebook-instant';
import { Resources } from '@app/utils/resources.utils';

export class PreloaderScene extends StateContainer {

  // preloaderBar:PreloaderBar;

  constructor() {

    super()

  }

  protected init(): void {

    // this.preloaderBar = new PreloaderBar( 0xFFFFFF )
    // this.preloaderBar.position.set(0, 70)
    // this.preloaderBar.scale.set(0.7)
    // this.addChild( this.preloaderBar )

    loader.add('background2', 'assets/background2.jpg');
    loader.add('bingoicon', 'assets/bingoicon.png');
    loader.add('sudokuicon', 'assets/sudokuicon.png');
    loader.add('idlepizza', 'assets/idlepizza.png');

    loader.add('background', 'assets/background.json');
    loader.add('content', 'assets/content.json');
    loader.add('lobster', 'assets/lobster.fnt');
    loader.add('arial', 'assets/arial.fnt');
    loader.add('sfx', 'assets/sfx.json');
    loader.add('voice', 'assets/voice.json');
    loader.add('config', 'config.json');


    loader.on('progress', this.onLoaderProgress, this)
    loader.once('complete', this.onLoaderComplete, this)

    RendererController.Instance.resizeHandler()

    loader.load()
  }


  onLoaderComplete(_: PIXI.loaders.Loader, __: any) {

    window.dispatchEvent(new Event('resize'));

    FacebookInstant.instance.startGame(() => this.initGame());
  }

  initGame() {
    FacebookInstant.instance.getData((response: GameModelProps) => this.onLoadData(response));

  }

  private onLoadData(response: GameModelProps): void {
    
    GameModelData.instance.reset();

    if (!response.lastTime) {
      GameModelData.instance.money = Resources.getConfig().initial_money;
      if(FacebookInstant.instance.entryPoint) {
        if(FacebookInstant.instance.entryPoint.invite) {
          GameModelData.instance.money += Resources.getConfig().templates.template1.prize
        }
      }
    }

    GameModelData.instance.props = response;

    EventManager.Instance.emit('change-state', 'intro');

    // EventManager.Instance.emit('change-state', 'daily');
    // EventManager.Instance.emit('change-state', 'endgame');
    // EventManager.Instance.emit('change-state', 'chest');
    // EventManager.Instance.emit('change-state', 'game');
    // EventManager.Instance.emit('change-state', 'map');
    // EventManager.Instance.emit('change-state', 'power');
    // EventManager.Instance.emit('change-state', 'social');

  }

  onLoaderProgress(loader: PIXI.loaders.Loader, _: any) {

    FacebookInstant.instance.setProgress(loader.progress);
    // console.log(loader.progress)
  }
}
