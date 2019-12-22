import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { PieceKeyBehavior } from './piece-key.behavior';
import { GameModelData, PowerList } from '@models/game-model.data';
import { Resources } from '@app/utils/resources.utils';
import { Sprite } from 'pixi.js';
import { SoundController } from '@app/controller/sound.controller';

export type PowerupConsumerType = 'active' | 'released' | 'consumed';

export type PowerupConsumerProps = {
  powers:PowerList[]
}


export class PowerupConsumerBehavior extends BehaviorBase<PowerupConsumerType, PowerupConsumerProps> {

  private currentBehavior:PieceKeyBehavior;
  private behaviorsList:PieceKeyBehavior[];

  constructor(props?:PowerupConsumerProps) {
    super(props);

    if(this.properties.powers.length === 0) {
      this.change('consumed');
      return;
    }

    this.addBehaviors();

    this.currentBehavior = this.behaviorsList.shift();
    if(!this.currentBehavior) {
      this.change('consumed');
    }
  }

  private addBehaviors():void {

    this.behaviorsList = [];
    this.properties.powers.forEach( (value:PowerList) => {

      switch(value) {
        case 'key':
          this.behaviorsList.push(this.powerupKey);
        break;
        case '2-bonus-daub':
          this.behaviorsList.push(this.powerupDaub2);
        break;
        case 'bonus-daub':
          this.behaviorsList.push(this.powerupDaub);
        break;
        case 'instant-bingo':
          this.behaviorsList.push(this.powerupBingo);
        break;
        case 'coin':
          this.behaviorsList.push(this.powerupCoin);
        break;
      }


    })

  }

  protected onSubscribe(_:ComponentBase):void {
    // value.element.interactive = true;
    this.emitCurrentBehavior();
  }

  onRelease():boolean {
    if(this.state == 'consumed') {
      this.currentBehavior = null;
      this.emitCurrentBehavior();
      return;
    }

    this.change('released');
    this.targets.forEach( (value:ComponentBase) => {
      
      value.emitToChildren('add-powerup', 'add-powerup', this.currentBehavior);
      if(this.currentBehavior.props.power === '2-bonus-daub') {
        value.emitToChildren('add-powerup', 'add-powerup', this.currentBehavior);
      }
    })
    
    if(this.behaviorsList.length == 0) {
      this.change('consumed');
      return false;
    }

    this.currentBehavior = this.behaviorsList.shift();
    this.change('active');

    this.emitCurrentBehavior();

    return true;
  }
  private emitCurrentBehavior():void {
    this.targets.forEach( (value:ComponentBase) => {
      value.emitToChildren('get-powerup', 'get-powerup', this.currentBehavior);
    })
  }

  get powerupBingo():PieceKeyBehavior {
    return new PieceKeyBehavior({
      power: 'instant-bingo',
      icon: Resources.getTexture('bingo-icon', 'content'),
      onSaveOn: (value:ComponentBase) => {
        value.emitter.emit('bingo');
        GameModelData.instance.powerBingos++;
        SoundController.instance.audio('voice').play('bingo');
      },
      onInitialize: ( (value:ComponentBase) => {
        (value.getChildWithTag('background').element as Sprite).texture = Resources.getTexture('bingo-icon', 'content');
      })
    });
  }

  get powerupDaub():PieceKeyBehavior {
    return new PieceKeyBehavior({
      power: 'bonus-daub',
      icon: Resources.getTexture('star-icon', 'content'),
      onSaveOn: () => {
        SoundController.instance.audio('sfx').play('selection-2');
      },
      onInitialize: ( (value:ComponentBase) => {
        value.emitter.emit('select')
      })
    });
  }

  get powerupDaub2():PieceKeyBehavior {
    return new PieceKeyBehavior({
      power: '2-bonus-daub',
      icon: Resources.getTexture('star-icon2', 'content'),
      onSaveOn: () => {
        SoundController.instance.audio('sfx').play('selection-2');
      },
      onInitialize: ( (value:ComponentBase) => {
        value.emitter.emit('select')
      })
    });
  }

  get powerupCoin():PieceKeyBehavior {
    return new PieceKeyBehavior({
      power: 'coin',
      icon: Resources.getTexture('coin', 'content'),
      onSaveOn: () => {
        GameModelData.instance.powerCoins++;
        SoundController.instance.audio('sfx').play('selection-2');
      },
      onInitialize: ( (value:ComponentBase) => {
        (value.getChildWithTag('background').element as Sprite).texture = Resources.getTexture('coin', 'content');
      })
    })
  }

  get powerupKey():PieceKeyBehavior {
    return new PieceKeyBehavior({
      power: 'key',
      icon: Resources.getTexture('key', 'content'),
      onSaveOn: () => {
        GameModelData.instance.powerKeys++;
        SoundController.instance.audio('sfx').play('selection-2');
      },
      onInitialize: ( (value:ComponentBase) => {
        (value.getChildWithTag('background').element as Sprite).texture = Resources.getTexture('key', 'content');
      })
    });
  }

}
