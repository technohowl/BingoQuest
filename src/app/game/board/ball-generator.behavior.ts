// import { Container, Sprite, extras } from 'pixi.js';
import { Timer } from '@app/game';
import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { SoundController } from '@app/controller/sound.controller';
import { Helper } from '@app/utils/helper.utils';
import { TimeEvent } from '@app/utils/timer.utils';


export type BallGeneratorType = 'stopped' | 'generating' | 'waiting' | 'finished';

export type BallGeneratorProps = {
    balls: number,
    interval: number,
};


export class BallGeneratorBehavior extends BehaviorBase<BallGeneratorType, BallGeneratorProps> {

  private ballList:number[];
  private totalBalls:number;
  private _speed:number;
  private timeId:TimeEvent;
  
  constructor(props: BallGeneratorProps = {balls: 35, interval: 3000}) {
    super(props);
    this.totalBalls = this.properties.balls;

    this.changeSpeed(this.savedSpeed || 3)
    this.initialize();
  }
  get savedSpeed():number {
    return parseInt(window.localStorage.getItem('game-speed'));
  }

  addExtraBalls(value:number):void {
    this.totalBalls += value;
  }

  private initialize():void {
      
    this.ballList = [];

    for(let i = 1; i <= 75; i++) {
        this.ballList.push(i);
    }
    this.ballList.sort( () => -0.5 + Math.random() )

    this.change('stopped');
    this.setTimeout();
  }
  setTimeout():void {
    this.timeId = Timer.Instance.setTimeout( () => this.generate(), this.properties.interval );
  }

  generate():void {
    if(this.state === 'finished') {
      return;
    } 

    const newNum:number = this.getNewNumber();
    if(newNum < 0) {
        console.log("Error");
        return;
    }
    this.change('generating');
    
    this.totalBalls--;

    SoundController.instance.audio('voice').once('end', () => {
      SoundController.instance.audio('voice').play(Helper.numPad(newNum));
    })
    SoundController.instance.audio('voice').play(this.getLetterByValue(newNum))
    
    this.targets.forEach( (comp:ComponentBase) => {
      comp.emitToChildren('number-generator', 'number-generator', newNum, this.totalBalls);
    });

    if(this.totalBalls > 0) {
      this.setTimeout();
        this.change('waiting');
    } else {
        this.change('finished');
    }
  }

  private getLetterByValue(value:number):string {
    if(value <= 15) {
      return 'b';
    } else if(value <= 30) {
      return 'i';
    } else if(value <= 45) {
      return 'n';
    } else if(value <= 60) {
      return 'g';
    } else {
      return 'o';
    }
  }

  private getNewNumber():number {
    if(this.ballList.length > 0) {
        return this.ballList.shift();
    }
    return -1;
  }

  protected onSubscribe(_:ComponentBase):void {

  }
  get ballsLeft():number {
    return this.totalBalls;
  }

  changeSpeed(value:number):void {
    this._speed = value;
    this.properties.interval = 1500 + (5 - value) * 400;
  }
  get speed():number {
    return this._speed;
  }
  destroy():void {
    super.destroy();
    this.change('finished');
    Timer.Instance.clear(this.timeId.id);
  }

}
