import { EventManager }      from '@app/game'
import { WebGLRenderer, Point, Rectangle, ticker, Container, interaction }  from 'pixi.js'


export class RendererController extends WebGLRenderer {

    private _paused:boolean;
    private viewport:Rectangle;
    private animateFunc:(delta:number) => void;
    private scale:number;
    public center:Point;

    public static Instance:RendererController;
    private rendererContainer:Container;

    public interaction:interaction.InteractionManager;

  constructor(width:number, height:number) {
    super( width, height )
    RendererController.Instance = this;
  }

  init(parentName:string = null, container:Container) {
    this.center = new Point(this.width * 0.5, this.height * 0.5);

    this._paused = false;

    this.viewport = new Rectangle( 0, 0, this.width, this.height )
    this.screen = new Rectangle( 0, 0, this.width, this.height )

    this.rendererContainer = container;

    if(parentName) {
      document.getElementById(parentName).appendChild( this.view )
    } else {
      document.body.appendChild( this.view )
    }
    this.autoResize = true

    EventManager.Instance.emit('state-resize');

    window.addEventListener('resize', () => this.resizeHandler() )

    this.interaction = this.plugins['interaction'] as interaction.InteractionManager;

    this.resizeHandler()
  }

  initFullScreen(element:any = this.view) {

    if(element.requestFullscreen) {
      element.requestFullscreen()
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }

  }

  start () {

    this.stop()
    this.animateFunc = (time) => this.animate(time)
    ticker.shared.add( this.animateFunc, this )

  }

  get pause() {
    return this._paused
  }

  set pause( value ) {
    this._paused = value

    if(this._paused) {
      ticker.shared.stop()
    } else {
      ticker.shared.start()
    }
  }

  stop () {
    
    if(!this.animateFunc) {
      return
    }
    ticker.shared.remove( this.animateFunc, this )

  }

  animate ( _:number ) {
    this.render( this.rendererContainer )
  }

  resizeHandler() {
    window.scrollTo(0,1)

    setTimeout( () => window.scrollTo(0,1), 400)

    this.scale = Math.min(window.innerWidth / this.viewport.width, window.innerHeight / this.viewport.height )

    const width  = Math.floor( this.viewport.width * this.scale )
    const height = Math.floor( this.viewport.height * this.scale )

    const offsetX = (window.innerWidth - width)
    const offsetY = (window.innerHeight - height)
    
    this.resize( (width + offsetX) / this.scale, (height + offsetY) / this.scale )
    
    this.view.style.transformOrigin = "0 0"
    this.view.style.transform = `scale( ${this.scale/this.resolution} )`

    this.center.x = this.width * 0.5 / this.resolution
    this.center.y = this.height * 0.5 / this.resolution

    this.viewport.x = -this.viewport.width * 0.5
    this.viewport.y = -this.viewport.height * 0.5

    this.screen.x =  -this.center.x
    this.screen.y =  -this.center.y

    this.screen.width = this.width
    this.screen.height = this.height
    
    EventManager.Instance.emit('state-position', this.width * 0.5 / this.resolution, this.height * 0.5 / this.resolution);

    EventManager.Instance.emit( 'resize', { width: this.width, height: this.height } )
  }

}