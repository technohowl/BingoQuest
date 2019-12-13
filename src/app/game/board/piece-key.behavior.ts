import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { PowerList } from '@models/game-model.data';
import { Texture } from 'pixi.js';

export type PieceKeyType = 'active' | 'clicked';

export type PieceKeyProps = {
  power: PowerList,
  icon: Texture,
  onSaveOn: (value?:ComponentBase) => void,
  onInitialize: (value:ComponentBase) => void
}

export class PieceKeyBehavior extends BehaviorBase<PieceKeyType, PieceKeyProps> {

  constructor(props?:PieceKeyProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    this.properties.onInitialize(value);
    value.emitter.on('selected', () => this.properties.onSaveOn(value));
  }

  get props():PieceKeyProps {
    return this.properties;
  }
}
