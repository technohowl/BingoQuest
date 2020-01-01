import { RendererController }          from '@app/game'
import { TweenMax } from "gsap";
import { Container}   from 'pixi.js'
import { EventManager } from '@app/components/event-manager.component';

export type ScenesStates = 'preloader' | 'game' | 'intro' | 'chest' | 'daily' | 'endgame' | 'map' | 'power' | 'social' | 'inapp';

export class StateController<T> {

    private activeStates:Map<T,any>;
    private states:Map<T,any>;
    public stageContainer:Container;

  constructor() {

    this.activeStates = new Map();
    this.states = new Map();
    this.stageContainer = new Container()

    EventManager.Instance.on('state-resize', () => this.resize());
    EventManager.Instance.on('state-position', (x:number, y:number) => this.stageContainer.position.set(x,y));
    EventManager.Instance.on('change-state', (value:T) => this.setActive(value) );
  }

  resize() {
    this.stageContainer.position.set( RendererController.Instance.center.x, RendererController.Instance.center.y )
  }

  addState ( key:T, state:any ) {
    this.states.set( key, state )
  }
 
  
  removeActive (key:T) {
    if( !this.activeStates.has( key ) ) {
      return
    }
    let oldState = this.activeStates.get( key )
    oldState.emit('remove');
    
    this.activeStates.delete( key )

    return oldState
  }

  removeAllActives(exceptionKey:T = null) {
    this.activeStates.forEach( (_:any, key:T) => {
      if( key !== exceptionKey ) {
        this.removeActive( key )
      }
    });
  }

  restart( name:T ) {
    this.addActive( name )    
  }

  addActive ( key:T, clear = false, ...data:any[] ) {
    if( !this.states.has( key ) ) {
      console.log(`no state with name ${key}`)
      return
    }

    const stateClass = this.states.get( key )
    const state = new stateClass()

    if( state ) {
      if(clear) {
        this.removeAllActives()
        this.stageContainer.removeChildren()
      }
      this.activeStates.set(key, state)
      this.stageContainer.addChild(state)
      state.emit('init', ...data )
      
    }
    return state
  }

  setActive ( key:T, ...data:any[] ) {
    this.addActive( key, true, ...data )
  }

  switchFade (newKey:T, time = 1000) {

    const oldStateName = this.activeStates.keys().next().value
    const oldState = this.activeStates.values().next().value
    const newState = this.addActive( newKey );

    this.fadeToState(oldState, 1, 0, time );
    this.fadeToState(newState, 0, 1, time, time*0.5 ).eventCallback('onComplete', () => this.removeActive( oldStateName ) );

  }

  fadeToState (state:any, fromValue = 0, toValue = 1, time=1000, delay = 0) {   
    return TweenMax.fromTo(state, time, {alpha: fromValue}, {alpha: toValue, delay: delay});
  }

}
