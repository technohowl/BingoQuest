import { utils, loaders, loader }  from 'pixi.js'
import { Howler, Howl } from 'howler';



export class SoundController extends utils.EventEmitter {

  private listAudioExtensions:string[];
  private _audios:Map<string,Howl>;
  private _sounds:Map<string,any>;
  private _mute:boolean;

  private static _instance:SoundController;

  private constructor() {
    super();
  }

  static get instance():SoundController {
    if(!SoundController._instance) {
      SoundController._instance = new SoundController();
    }
    return SoundController._instance;
  }

  init() {

    this.listAudioExtensions = ['wav', 'mp3', 'ogg', 'ac3', 'm4a', 'webm']

    for(const ext of this.listAudioExtensions) {
      loaders.Resource.setExtensionLoadType( ext, loaders.Resource.LOAD_TYPE.AUDIO )
    }

    loader.use( this.middlewhere() )
    loader.pre( this.preMiddlewhere() )

    this._audios = new Map()
    this._sounds = new Map()
  }

  set mute(value) {

    this._mute = value
    Howler.mute( this._mute )

  }
  get mute() {
    return this._mute
  }

  muteAudio(sound:string, value:boolean) {
    this.audio(sound).mute(value)
  }
  isAudioMuted(sound:string):boolean {
    return this.audio(sound).mute();
  }

  play(name:string):Howl {
    const howl:Howl = new Howl({
      src: `assets/audio/${name}.m4a`,
      autoplay: true
    })

    return howl;
  }

  audio( value:string ):Howl {
    return this._audios.get( value )
  }

  setSound( name:string, id:any ) {
    this._sounds.set(name, id)
  }

  getSound( name:string ) {
    return this._sounds.get(name)
  }

  preMiddlewhere() {
    const self = this;

    return function(resource:any, next:any) {

      if(resource.loadType === loaders.Resource.LOAD_TYPE.AUDIO) {
        const ext = self.getExtension(resource.url)
        if(ext === '*') {
          resource.isComplete = true
          resource.type = loaders.Resource.TYPE.AUDIO
        }
      }

      next()
    }
  }

  middlewhere() {

    const self = this

    return function(resource:any, next:any) {

      if ( resource && resource.type === loaders.Resource.TYPE.JSON && resource.data && resource.data.resources ) {
        
        const path = self.getPath(resource.url)

        const spritename = self.setupAudiosprite( resource.data.spritemap )

        const audioFiles = resource.data.resources.map( (sound:string) => { return `${path}/${sound}` } )

        resource.data = new Howl({
          src: audioFiles,
          preload: true,
          sprite: spritename
        })

        self._audios.set( resource.name, resource.data )

        resource.data.once( 'load', next )

      } else if(resource && resource.type === loaders.Resource.TYPE.AUDIO) {

        let audioFiles = [ resource.url ]
        const path = self.removePathExtension(resource.url)

        if(self.getExtension(resource.url) === '*') {
          audioFiles = resource.metadata.extension.map( (ext:string) => { return `${path}.${ext}` } )
        } else {

          if(resource.metadata.fallback) {
            audioFiles = audioFiles.concat(resource.metadata.fallback.map( (ext:string) => { return `${path}.${ext}` } ))
          }

        }
  
        resource.data = new Howl({
          src: audioFiles,
          preload: true
        })

        self._audios.set( resource.name, resource.data )

        resource.data.once( 'load', next )

      } else {
        next()
      }
    }
  }

  getPath(urlPath:string):string {
    const index = urlPath.lastIndexOf('/')
    const path = urlPath.substr(0, index)

    return path
  }
  removePathExtension(urlPath:string):string {
    const index = urlPath.lastIndexOf('.')
    const path = urlPath.substr(0, index)

    return path
  }

  getExtension( urlPath:string ):string {
    const index = urlPath.lastIndexOf('.')
    const ext = urlPath.substr( index + 1 )

    return ext
  }


  setupAudiosprite( spritemap:any ) {
    
    let howlerSprite:any = {}
    
    for(let key of Object.keys( spritemap )) {
      howlerSprite[ key ] = this.AudiospriteToHowler( spritemap[ key ] )
    }

    return howlerSprite
  }


  AudiospriteToHowler(data:any) {
    return [
      data.start * 1000, (data.end - data.start) * 1000, data.loop
    ];
  } 
}