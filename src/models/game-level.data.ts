import { Point } from "pixi.js";

// import { EventEmitter } from "events";


export type GameLevelProps = {
    money:number,
    data:LevelProps[]
}

export type LevelProps = {
    unlocked:boolean,
    required: number,
    position: Point,
}


export class GameLevelData {

    private static _instance:GameLevelData;
    private properties:GameLevelProps;

    private constructor(props?:GameLevelProps) {
        this.properties = props;
    }

    static get instance():GameLevelData {
        if(!GameLevelData._instance) {
            GameLevelData._instance = new GameLevelData(
                {
                    money: 0, data: []
                }
            );
        }
        return GameLevelData._instance;
    }

    get props():GameLevelProps {
        return this.properties;
    }
}