// import { BehaviorBase } from "../game";
import { ComponentBase } from "./component.core";
import { Container } from "pixi.js";

export type EntityType = {
  parent: Container,
  children?: EntityBase[]
  components?: ComponentBase[]
}


export abstract class EntityBase<T={}, TProp = Partial<T> & EntityType> {
  
  private properties:TProp & EntityType;

  constructor(props:TProp & EntityType) {
    this.properties = props;

    this.properties.components.forEach( (value:ComponentBase) => value.onAddToParent(this.properties.parent));

  }

  addChild(value:EntityBase):EntityBase {
    this.properties.children.push(value);
    return value;
  }
  
  addComponent(value:ComponentBase):ComponentBase {
    this.properties.components.push(value);
    value.onAddToParent(this.properties.parent);
    return value;
  }

  // addBehavior(value:BehaviorBase):BehaviorBase {
  //   this.properties.behaviors.push(value);
  //   value.addEntity(this);
  //   return value;
  // } 
  
  get children():EntityBase[] {
    return this.properties.children;
  }
  
  // get behaviors():BehaviorBase[] {
  //   return this.properties.behaviors;
  // }

  get components():ComponentBase[] {
    return this.properties.components;
  }

  get props():TProp {
    return this.properties;
  }

  abstract get self():EntityBase;
  
}