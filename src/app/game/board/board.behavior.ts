import { Point, Sprite } from 'pixi.js';
import { ContainerComponent } from '@app/components/container.component';
import { BitmapTextComponent } from '@app/components/bitmap-text.component';
import { SpriteComponent } from '@app/components/sprite.component';
import { BoardPieceBehavior } from './board-piece.behavior';
import { BehaviorBase } from '@app/core/behavior.core';
import { ComponentBase } from '@app/core/component.core';
import { Resources } from '@app/utils/resources.utils';
import { PieceKeyBehavior } from './piece-key.behavior';
import { GameModelData } from '@models/game-model.data';
import { SoundController } from '@app/controller/sound.controller';


export type BoardBehaviorType = 'idle';
export type BoardBehaviorProps = {
  lines?: boolean[],
  columns?: boolean[],
  positive?: boolean,
  negative?: boolean,
  star?: boolean
}

export class BoardBehavior extends BehaviorBase<BoardBehaviorType, BoardBehaviorProps> {

  private listNumbers:number[][];
  private markedValues:boolean[][];
  private listPieces:ContainerComponent[][];
  private listSortedValues:number[];
  private powersBehaviors:PieceKeyBehavior[];
  private totalKeys:number;

  constructor(props?:BoardBehaviorProps) {
    super(props);
    this.listSortedValues = [];

    this.properties.lines = [];
    this.properties.columns = [];
    this.properties.positive = false;
    this.properties.negative = false;
    
    this.generateNumbers();
    this.createMarked();
    this.createBehaviors();
  }
  private createBehaviors():void {

    this.totalKeys = 0;
    this.powersBehaviors = [
      new PieceKeyBehavior({
        power: 'key',
        icon: Resources.getTexture('key', 'content'),
        onSaveOn: () => {
          GameModelData.instance.powerKeys++;
        },
        onInitialize: ( (value:ComponentBase) => {
          (value.getChildWithTag('background').element as Sprite).texture = Resources.getTexture('key', 'content');
        })
      }),
      new PieceKeyBehavior({
        power: 'coin',
        icon: Resources.getTexture('coin', 'content'),
        onSaveOn: () => {
          GameModelData.instance.powerCoins++;
        },
        onInitialize: ( (value:ComponentBase) => {
          (value.getChildWithTag('background').element as Sprite).texture = Resources.getTexture('coin', 'content');
        })
      })
    ];
  }

  protected onSubscribe(_:ComponentBase):void {
    this.createPieces();
  }

  private generateNumbers():void {

    this.listNumbers = [];
    let list:number[] = [];
    for(let i = 0; i < 5; i++) {
      list = this.generateRandomList(15*i+1, 15*i+15);
      for(let j = 0; j < 5; j++) {
        if(j == 0) {
          this.listNumbers[i] = [];
        }
        this.listNumbers[i][j] = list[j];
      }
    }
  }

  private generateRandomList(initial:number, final:number):number[] {
    let list:number[] = [];

    for(let i = initial; i <= final; i++) {
      list.push(i);
    }
    list.sort( () => -0.5 + Math.random() )

    return list;
  }

  createPieces():void {
    
    this.listPieces = [];

    for(let i = 0; i < 5; i++) {
      this.createHeader(i);
      for(let j = 0; j < 5; j++) {
        if(j === 0) {
          this.listPieces[i] = [];
        }
        this.listPieces[i][j] = this.createPieceComponent(i,j, this.listNumbers[i][j]);
      }
    }
    this.listPieces[2][2].element.visible = false;
    this.createCenterPiece();
  }
  private createHeader(x:number):void {
    new ContainerComponent({
      parent: this.targets[0].element,
      element: {
        position: this.getPositionAt(x,-1)
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5,0.4),
            position: new Point(0, 4),
            tint: this.getColorbyValue(x)
          }
        }).texture('board-piece', 'content').anchor(0.5),
        new BitmapTextComponent({
          element: {
            text: 'BINGO'.split('')[x],
            font: '24px arial',
            align: 'center',
            tint: 0x010101,
            anchor: new Point(0.5,0.5),
            position: new Point(0, 4),
          }
        }),
        new BitmapTextComponent({
          element: {
            text: 'BINGO'.split('')[x],
            font: '24px arial',
            align: 'center',
            tint: 0xFFFFFF,
            anchor: new Point(0.5,0.5),
            position: new Point(0, 3),
          }
        })
      ]
    })
  }

  createCenterPiece():void {
    new SpriteComponent({
      parent: this.targets[0].element,
      element: {
        position: this.getPositionAt(2, 2),
        scale: new Point(0.5,0.5)
      },
    }).texture('board-piece-center', 'content').anchor(0.5)
  }

  private getPositionAt(x:number, y:number):Point {
    return new Point(-84 + x * 42, -66 + y * 42);
  }

  private createPieceComponent(x:number, y:number, value:number):ContainerComponent {
    
    const cont:ContainerComponent = new ContainerComponent({
      parent: this.targets[0].element,
      element: {
        position: this.getPositionAt(x, y)
      },
      children: [
        new SpriteComponent({
          element: {
            scale: new Point(0.5,0.5),
            alpha: 0.8
          }
        }).texture('board-piece', 'content').anchor(0.5),
        new SpriteComponent({
          tag: ['background'],
          element: {
            scale: new Point(0.35, 0.35),
            alpha: 0.7
          }
        }).anchor(0.5),
        new BitmapTextComponent({
          tag: ['value'],
          element: {
            text: value.toString(),
            font: '24px arial',
            align: 'center',
            tint: 0x010101,
            // tint: this.getColorbyValue(value),
            anchor: new Point(0.5,0.5)
          }
        }),
        new SpriteComponent({
          tag: ['icon'],
          element: {
            scale: new Point(0.4,0.4)
          }
        }).anchor(0.5)
      ],
      behavior: [
        new BoardPieceBehavior({
          value: value,
          textureBingo: Resources.getTexture('bingo-icon', 'content'),
          textureMarked: Resources.getTexture('star-icon', 'content'),
          isValidNumber: (value:number) => this.onValidateNumber(value)
        }).on('clicked', () => this.onClickNumber(value))
      ]
    })
    const rand = Math.random() * 100;
    if(rand > 90) {
      if(this.totalKeys < 3) {
        cont.addBehavior(this.powersBehaviors[0]); // key
        this.totalKeys++;
      } else {
        cont.addBehavior(this.powersBehaviors[1]); // coin
      }
    } else if(rand > 80) {
      cont.addBehavior(this.powersBehaviors[1]); // coin
    }

    cont.emitter.on('select', () => {
      this.onValidateNumber(value);
      this.onClickNumber(value);
    })

    return cont;
  }
  private getColorbyValue(value:number):number {
    switch(value) {
      case 0: return 0xb296c8;
      case 1: return 0xf8ad93;
      case 2: return 0xc6e3a0;
      case 3: return 0x95d5f1;
      default: return 0xf68ebc;
    }
      
  }

  onValidateNumber(value:number):boolean {
    return this.listSortedValues.indexOf(value) >= 0;
  }

  createMarked():void {
    this.markedValues = [];

    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        if(j === 0) {
          this.markedValues[i] = [];
        }

        this.markedValues[i][j] = (i === 2 && j === 2);
      }
    }
  }

  onGetNumber(value:number):void {
    this.listSortedValues.push(value);
  }

  onClickNumber(value:number):void {
    const position = this.getPositionOfValue(value);
    
    this.markedValues[position.x][position.y] = true;
    this.validateBingo();
  }

  getPositionOfValue(value:number):Point {
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        if(this.listNumbers[i][j] === value) {
          return new Point(i,j);
        }
      }
    }
    return new Point(-1,-1);
  }
 
  validateBingo():void {
    
    for(let i = 0; i < 5; i++) {
      if(this.validateLine(i)) {
        this.markLine(i);
      }
      if(this.validateColumn(i)) {
        this.markColumn(i);
      }
    }
    if(this.validateDiagonalPositive()) {
      this.markDiagonalPositive();
    }
    if(this.validateDiagonalNegative()) {
      this.markDiagonalNegative();
    }
    if(this.validateStar()){

    }

  }

  validateLine(value:number):boolean {
    let counter:number = 0;
    for(let i = 0; i < 5; i++) {
      if(this.markedValues[value][i]) {
        counter++;
      }
    }
    return (counter >= 5);
  }

  validateColumn(value:number):boolean {
    let counter:number = 0;
    for(let i = 0; i < 5; i++) {
      if(this.markedValues[i][value]) {
        counter++;
      }
    }
    return (counter >= 5);
  }
  
  validateDiagonalPositive():boolean {
    let counter:number = 0;
    for(let i = 0; i < 5; i++) {
      if(this.markedValues[i][i]) {
        counter++;
      }
    }
    return counter >= 5;
  }
  validateDiagonalNegative():boolean {
    let counter:number = 0;
    for(let i = 0; i < 5; i++) {
      if(this.markedValues[i][4-i]) {
        counter++;
      }
    }
    return counter >= 5;
  }

  validateStar():boolean {
    let counter:number = 0;
    if(this.markedValues[0][0])
      counter ++;
    if(this.markedValues[4][0])
      counter ++;
    if(this.markedValues[0][4])
      counter ++;
    if(this.markedValues[4][4])
      counter ++;
    if(this.markedValues[2][2])
      counter ++;
    return counter >= 5;
  }

  markStar(value:number):void {
    if(this.properties.star) {
      return;
    }

    this.properties.star = true;
    this.listPieces[0][0].emitter.emit('bingo');
    this.listPieces[4][0].emitter.emit('bingo');
    this.listPieces[0][4].emitter.emit('bingo');
    this.listPieces[4][4].emitter.emit('bingo');
    this.listPieces[2][2].emitter.emit('bingo');

    GameModelData.instance.powerBingos++;
    this.playBingoSound();
  }

  markLine(value:number):void {
    if(this.properties.lines[value]) {
      return;
    }

    this.properties.lines[value] = true;
    for(let i = 0; i < 5; i++) {
      this.listPieces[value][i].emitter.emit('bingo');
    }
    GameModelData.instance.powerBingos++;
    this.playBingoSound();
  }

  playBingoSound():void {
    SoundController.instance.audio('voice').play('bingo');
  }

  markColumn(value:number) {
    if(this.properties.columns[value]) {
      return;
    }
    
    this.properties.columns[value] = true;
    
    for(let i = 0; i < 5; i++) {
      this.listPieces[i][value].emitter.emit('bingo');
    }
    GameModelData.instance.powerBingos++;
    this.playBingoSound();
  }

  markDiagonalPositive():void {
    if(this.properties.positive) {
      return;
    }
    
    this.properties.positive = true;

    for(let i = 0; i < 5; i++) {
      if(this.markedValues[i][i]) {
        this.listPieces[i][i].emitter.emit('bingo');
      }
    }
    GameModelData.instance.powerBingos++;
    this.playBingoSound();
  }

  markDiagonalNegative():void {
    if(this.properties.negative) {
      return;
    }
    
    this.properties.negative = true;
    
    for(let i = 0; i < 5; i++) {
      if(this.markedValues[i][4-i]) {
        this.listPieces[i][4-i].emitter.emit('bingo');
      }
    }
    GameModelData.instance.powerBingos++;
    this.playBingoSound();
  }

  addExtraBehaviorToFreePiece(behavior:PieceKeyBehavior):void {

    const item:ContainerComponent = this.getRandomFreePiece();
    item.addBehavior(behavior);

  }

  getRandomFreePiece():ContainerComponent {
    let items:ContainerComponent[] = [];
    for(let i = 0; i < 5; i++) {
      for(let j = 0; j < 5; j++) {
        if(!this.markedValues[i][j] && this.listPieces[i][j].totalBehaviors === 1) {
          items.push(this.listPieces[i][j]);
        }
      }
    }
    return items.sort(() => Math.random() - 0.5)[0];
  }

}
