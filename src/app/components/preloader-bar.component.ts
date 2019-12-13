import { RendererController } from '@app/game'
import { Sprite, Rectangle, Texture, Container, Graphics } from 'pixi.js'

export class PreloaderBar extends Container {

  imageMask:Graphics;

  constructor(colorLoader:number, useImage = false) {
    
    super()


    if(useImage) {
      const logo = Sprite.fromImage('logo.png')
      this.addChild( logo )
      logo.anchor.set(0.5)
    }

    const texture = Texture.fromImage('assets/preloader.png')

    const loaderBg = this.createImage( texture, new Rectangle( 1, 40, 765, 31 ) )
    loaderBg.tint = 0x333333;

    const loaderFront = this.createImage( texture, new Rectangle( 1, 1, 771, 37 ) )
    loaderFront.tint = colorLoader // 0xff9a00 // color front

    // const loaderDot = this.createImage( texture, new Rectangle( 774, 1, 92, 42 ) )
    // loaderDot.tint = colorDot // 0xffca00 // color dot


    this.imageMask = this.createMask(1, 1, 771, 37)
    this.imageMask.scale.set(0.1, 1)

    loaderBg.position.y = loaderFront.position.y = this.imageMask.position.y = RendererController.Instance.screen.height * 0.3

    loaderFront.mask = this.imageMask
    // loaderDot.mask = this.imageMask

    // loaderDot.position.x = -loaderFront.width * 0.5

    // TweenMax.to(loaderDot, 0.9, { x: loaderFront.width * 0.5, repeat: -1 });
  }

  createMask( x:number, y:number, w:number, h:number):Graphics {

    const imageMask = new Graphics()
    imageMask.beginFill(0xff0000)
    imageMask.drawRect( x, y - h * 0.5, w, h )
    imageMask.endFill()
    imageMask.position.x = -w * 0.5

    this.addChild( imageMask )

    return imageMask
  }

  createImage(texture:Texture, rect:Rectangle):Sprite {

    const text = new Texture( texture.baseTexture, rect )
    const img = new Sprite(text)
    img.anchor.set(0.5)
    this.addChild( img )

    return img
  }

  setProgress(value:number):void {
    
    const scale = Math.min(value*0.01, 1);
    this.imageMask.scale.x = scale;

  }

}
