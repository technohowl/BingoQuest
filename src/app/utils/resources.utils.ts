import { Texture, loader } from 'pixi.js';

export class Resources {

  
  constructor() {
    
  }

  public static getConfig():any {
    return loader.resources['config'].data;
  }

  public static getTexture(image:string, spritesheet:string=null):Texture {

    if(spritesheet == null) {
        return loader.resources[image].texture;
    }

    return loader.resources[spritesheet].textures[image];
  }

}