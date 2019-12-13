import { Container, Sprite, Point, Graphics } from 'pixi.js';
import { 
    Resources,
    EventManager
} from '@app/game';

export class Background extends Container {

    background:Sprite;
    backgroundSize:Point;
    resizeFunc: (size:any) => void 

  constructor() {
    super();
    this.createBackground();
    // this.createOverlay();
    this.resizeFunc = (size:any) => this.onResize(size);
    EventManager.Instance.on('resize', this.resizeFunc);
  }

  createBackground():void {
    this.background = new Sprite(Resources.getTexture('background2'));
    this.background.anchor.set(0.5);
    this.addChild(this.background);
    this.backgroundSize = new Point(this.background.width, this.background.height);

  }


  createOverlay():void {

    const overlay = new Graphics()
    overlay.beginFill(0x000000, 0.1);
    overlay.drawRect(-240, -360, 480, 720);
    overlay.endFill();
    this.addChild(overlay);
  }

  destroy():void {
    
    EventManager.Instance.removeListener('resize', this.resizeFunc);
    super.destroy({children: true});
  }

  onResize(size:any):void {

    let scale = Math.max(size.width / this.backgroundSize.x, size.height / (this.backgroundSize.y) )
    this.background.scale.set(scale);
  }

}
