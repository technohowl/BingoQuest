import { Container, ticker } from 'pixi.js'
import { EventManager } from '@app/game';

export abstract class StateContainer extends Container {

  private _id:number;
  destroyOnRemove:boolean;
  resizeFunc: (w:number,h:number) => void;
  updateFunc: (t:number) => void;

  private static ID:number = 1;

  constructor() {
    
    super()
    this.name = 'state-container';

    this._id = StateContainer.ID++;

    this.destroyOnRemove = true

    this.resizeFunc = ( width, height ) => this.resize( width, height )
    this.updateFunc = (time) => this.update(time)


    this.once('init', (...data:any[]) => this.init(...data) )
    this.on('init', (...data:any[]) => this.start(...data) )
    this.on('remove', () => this.remove() )

    EventManager.Instance.on('resize', this.resizeFunc )

    ticker.shared.add( this.updateFunc )

  }

  protected init(..._:any[]):void {

  }

  protected start(..._:any[]):void {

  }
  protected update(_:number):void {

  }

  protected resize(_:number, __:number):void {
    
  }

  remove():void {
    EventManager.Instance.removeListener('resize', this.resizeFunc )

    if( this.destroyOnRemove ) {
      this.destroy( {children: true} )
    }
  }

  get id():number {
    return this._id;
  }

}