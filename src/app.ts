import { 
  RendererController, StateController,
  PreloaderScene, GameScene, IntroScene, 
  ScenesStates,
  DailyPrizeScene,
  EndGameScene, MapSelectScene, PowerSelectScene
 } from '@app/game';
import { ChestSelectScene } from '@app/game/scene/chest-select.scene';
import { FacebookInstant } from '@app/services/facebook-instant';
import { SoundController } from '@app/controller/sound.controller';
import { SocialScene } from '@app/game/scene/social.scene';
import {ShopScene} from "@app/game/scene/shop.scene";


class Game {

  stateController:StateController<ScenesStates>;

  constructor() {

    this.stateController = new StateController();
    
    const renderer = new RendererController(480, 720);
    renderer.init('game', this.stateController.stageContainer);

    SoundController.instance.init();

    this.stateController.addState('preloader', PreloaderScene);
    this.stateController.addState('game', GameScene);
    this.stateController.addState('intro', IntroScene);
    this.stateController.addState('chest', ChestSelectScene);
    this.stateController.addState('daily', DailyPrizeScene);
    this.stateController.addState('endgame', EndGameScene);
    this.stateController.addState('map', MapSelectScene);
    this.stateController.addState('power', PowerSelectScene);
    this.stateController.addState('social', SocialScene);
    this.stateController.addState('inapp', ShopScene);

    this.stateController.setActive('preloader');

    renderer.start(); 
  }
}
// window.localStorage.removeItem('game-speed');

// FacebookInstant.instance.isOnline = false;

FacebookInstant.instance.initializeAPI(() => {
  new Game();
})


// http-server --ssl -c-1 -p 8080 -a 127.0.0.1

// FacebookInstant.instance.addInitialAds('1613142178751809_2558905887508762');
// App TEst
// https://www.facebook.com/embed/instantgames/1613142178751809/player?game_url=https://localhost:8080

// External
// https://www.facebook.com/embed/instantgames/687945204964874/player?game_url=https://localhost:8080


// base64 bingo.txt --decode > bingo.wav
// audiosprite *.wav -e webm -o voice
