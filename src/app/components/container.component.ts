import { 
  ComponentBase, 
  ComponentType
} from "@app/game";
import { Container } from "pixi.js";


export class ContainerComponent extends ComponentBase<Container> {
  
  constructor(props?:ComponentType<Container>) {
    super(props);
  }

  protected create():void {
    this._element = new Container();
    Object.assign(this.element, this.properties.element);
  }
  
  onAddToParent(value:Container):void {
    value.addChild(this.element);
  }

  onPostCreate():void {
    
  }
 
}