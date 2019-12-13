import { Container, Sprite, Text, loader, Point } from 'pixi.js';
import { TweenMax } from 'gsap';

export class TextDisplay extends Container {

  private textField:Text;
  private background:Sprite;
  private currentValue:number = 0;

  constructor(image:string, text:number = 0) {
    super();
    this.currentValue = text;
    this.createBackground(image);
    this.createText();
  }
  
  private createBackground(image:string):void {
    this.background = new Sprite(loader.resources['keypad'].textures[image]);
    this.addChild(this.background);
  }

  private createText():void {
    this.textField = new Text(this.formatNumber());
    this.textField.anchor.set(0.5);
    this.textField.style.fill = 0xffffff;
    this.textField.style.align = 'center';
    this.textField.style.fontWeight = 'bold';
    this.textField.style.fontSize = 30;
    this.addChild(this.textField);
  }
  public setStyle(value:Point):void {
    this.textField.position = value;
  }
  private formatNumber():string {
    if(!this.currentValue) {
      return '0';
    }
    return this.currentValue.toFixed(2);
  }

  public updateText(text:number):void {
    new TweenMax(this, 0.2, {currentValue: text, onUpdate: () => this.onUpdateText(), onComplete: () => this.onUpdateText()});
  }
  private onUpdateText():void {
    this.textField.text = this.formatNumber();
  }

}