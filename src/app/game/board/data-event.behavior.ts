import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';

export type DataEventType = 'active' | 'clicked';

export type DataEventProps = {
    
}


export class DataEventBehavior extends BehaviorBase<DataEventType, DataEventProps> {

  constructor(props?:DataEventProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    value.element.interactive = true;
  }

}
