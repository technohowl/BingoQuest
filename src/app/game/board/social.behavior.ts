import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { Container, mesh } from 'pixi.js';
import { Resources } from '@app/utils/resources.utils';

export type SocialType = 'active' | 'clicked';

export type SocialProps = {
    
}


export class SocialBehavior extends BehaviorBase<SocialType, SocialProps> {

  constructor(props?:SocialProps) {
    super(props);
  }

  protected onSubscribe(value:ComponentBase):void {
    
    this.createBackground(value.element);
  }

  private createBackground(parent:Container):void {

    const background:mesh.NineSlicePlane = new mesh.NineSlicePlane(Resources.getTexture('ticket', 'background'), 50,50,50,50);
    parent.addChild(background);
    background.position.set(-190,-240);
    background.width = 380;
    background.height = 540;

  }

}
