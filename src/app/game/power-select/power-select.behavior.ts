
import { 
    BehaviorBase, ComponentBase
} from '@app/game'
import { Texture } from 'pixi.js';
import { PowerList } from '@models/game-model.data';
import { SpriteComponent } from '@app/components/sprite.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { Helper } from '@app/utils/helper.utils';


export type PowerBehaviorState = 'unused' | 'enable' | 'selected';

export type PowerSelectData = {
  texture:Texture,
  power:PowerList,
  name:string,
  chances: number
}

export type PowerBehaviorProps = {
  powers?: PowerSelectData[]
}

export class PowerSelectBehavior extends BehaviorBase<PowerBehaviorState, PowerBehaviorProps> {

  private panel:SpriteComponent;
  private title:BitmapTextComponent;
  private button:ComponentBase;
  private counter:number;
  private selectedResult:PowerList;

  constructor(props?:PowerBehaviorProps) {
    super(props);
    this.counter = 0;
  }

  protected onSubscribe(element:ComponentBase):void {

    this.button = element.getChildWithTag('button');
    this.button.emitter.on('click', () => this.onClick())
    
    this.panel = element.getChildWithTag('icon') as SpriteComponent;
    this.title = element.getChildWithTag('title') as BitmapTextComponent;

  }
  
  private getRandomResult():PowerSelectData {

    let counter = 0;
    let sort = Helper.RandomInt(0, 24);

    for(let i = 0; i < this.properties.powers.length; i++) {
      counter += this.properties.powers[i].chances;
      if(sort < counter) {
        return this.properties.powers[i];
      }
    }
    
    return this.properties.powers.sort( () => Math.random() - 0.5 )[0];
  }
  
  onClick():void {
    this.counter++;

    const selected:PowerSelectData = this.getRandomResult();

    this.panel.element.texture = selected.texture;
    this.title.text(selected.name);
    
    this.selectedResult = selected.power;

    if(this.counter >= 3) {
      this.button.element.visible = false;
    }

    this.targets.forEach( (value:ComponentBase) => {
      value.emitToChildren('power-counter', 'power-counter', this.clicksLeft);
    })

    this.change('selected');

  }

  private get clicksLeft():number {
    return 3 - this.counter;
  }

  get selected():PowerList {
    return this.selectedResult
  }
  get totalClicks():number {
    return this.counter;
  }

}
/*
key         - 8/25
coin        - 7/25
extra ball  - 4/25
daub        - 3/25 
2daub       - 2/25
bingo       - 1/25
*/