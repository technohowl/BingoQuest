import { EventEmitter } from "events";



export type GameModelProps = {
    lastTime:number,
    money:number,
    bingos:number,
    sessionScore:number,
    powers:GameLevePowers,
    items: PowerList[]
}
export type GameLevePowers = {
    keys:number,
    bingos:number,
    coins:number,
    daub:number,
    daub2:number,
}

export type PowerList = 'key' | 'coin' | 'instant-bingo' | 'bonus-daub' | '2-bonus-daub' | 'extra-ball'


export type GameModelPropType =  'lastTime' | 'money' | 'bingos' | 'sessionBingos' | 'items' | 'powers-keys' | 'powers-bingos' | 'powers-coins' | 'powers-daub' | 'powers-daub2';


export class GameModelData {

    private static _instance:GameModelData;
    private emitter:EventEmitter;
    private properties:GameModelProps;

    private constructor(props?:GameModelProps) {
        this.properties = props;
        this.emitter = new EventEmitter();
    }

    static get instance():GameModelData {
        if(!GameModelData._instance) {
            GameModelData._instance = new GameModelData(
                {
                    money: 0, bingos: 0,
                    lastTime: 0,
                    sessionScore:0,
                    items: [],
                    powers: {
                        bingos: 0,
                        coins: 0,
                        keys: 0,
                        daub: 0,
                        daub2: 0
                    }
                }
            );
        }
        return GameModelData._instance;
    }
    reset():void {

    }
    
    on(name:GameModelPropType, callback:(value:any)=>void) {
        this.emitter.on(name, callback);
    }
    emit<T>(name:GameModelPropType, value:T) {
        this.emitter.emit(name, value);
    }

    saveTime():void {
        this.lastTime = Date.now();
    }

    get lastTime():number {
        return this.properties.lastTime;
    }

    set lastTime(value:number) {
        this.properties.lastTime = value;
        this.emit<number>('lastTime', this.properties.lastTime);
    }

    get money():number {
        return this.properties.money;
    }
    set money(value:number) {
        this.properties.money = value;
        this.emit<number>('money', this.properties.money);
    }

    get bingos():number {
        return this.properties.bingos;
    }
    set bingos(value:number) {
        this.properties.bingos = value;
        this.emit<number>('bingos', this.properties.bingos);
    }

    get sessionBingos():number {
        return this.properties.sessionScore;
    }
    set sessionBingos(value:number) {
        this.properties.sessionScore = value;
        this.emit<number>('sessionBingos', this.properties.sessionScore);
    }

    get items():PowerList[] {
        return this.properties.items;
    }
    set items(value:PowerList[]) {
        this.properties.items = value;
        this.emit<PowerList[]>('items', this.properties.items);
    }

    get powerBingos():number {
        return this.properties.powers.bingos;
    }
    set powerBingos(value:number) {
        this.properties.powers.bingos = value;
        this.emit<number>('powers-bingos', this.properties.powers.bingos);
    }

    get powerCoins():number {
        return this.properties.powers.coins;
    }
    set powerCoins(value:number) {
        this.properties.powers.coins = value;
        this.emit<number>('powers-coins', this.properties.powers.coins);
    }

    get powerKeys():number {
        return this.properties.powers.keys;
    }
    set powerKeys(value:number) {
        this.properties.powers.keys = value;
        this.emit<number>('powers-keys', this.properties.powers.keys);
    }

    get powerDaub():number {
        return this.properties.powers.daub;
    }
    set powerDaub(value:number) {
        this.properties.powers.daub = value;
        this.emit<number>('powers-daub', this.properties.powers.daub);
    }
    
    get powerDaub2():number {
        return this.properties.powers.daub;
    }
    set powerDaub2(value:number) {
        this.properties.powers.daub2 = value;
        this.emit<number>('powers-daub2', this.properties.powers.daub2);
    }
    
    get props():GameModelProps {
        return this.properties;
    }

    set props(value:GameModelProps) {
        // this.properties = value;
        Object.assign(this.properties, value);
    }
    
 
}
