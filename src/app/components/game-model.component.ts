// import { EventManager } from "@app/game";
// import GameEvents from "@models/gameEvents.data";

export class GameModel {

  private static instance:GameModel;

  private _winning:number = 0;
  private _balance:number = 0;
  private _bet:number = 0;
  private _gameResult:number[];
  private _winningSymbols:boolean[];
  
  constructor() {
    this.addEvents();
  }
  public initialize():void {
    this.Winning = 0;
    this.Balance = 0;
    this.Bet = 0;
  }
  private addEvents():void {
    // EventManager.Instance.on(GameEvents.SET_BALANCE, (value:number) => this.Balance = value);
    // EventManager.Instance.on(GameEvents.SET_WIN, (value:number) => this.Winning = value);
    // EventManager.Instance.on(GameEvents.SET_BET, (value:number) => this.Bet = value);
    // EventManager.Instance.on(GameEvents.SET_WINNING_SYMBOLS, (value:boolean[]) => this.WinningSymbols = value);
  }

  public static get Instance():GameModel {
    if(this.instance == null) {
      this.instance = new GameModel();
    }
    return this.instance;
  }

  public set Winning(value:number) {
    this._winning = value;
  }
  public get Winning():number {
    return this._winning;
  }
  public set Bet(value:number) {
    this._bet = value;
  }
  public get Bet():number {
    return this._bet;
  }
  public set Balance(value:number) {
    this._balance = value;
  }
  public get Balance():number {
    return this._balance;
  }
  public set GameResult(value:number[]) {
    this._gameResult = value;
  }
  public get GameResult():number[] {
    return this._gameResult;
  }
  public set WinningSymbols(value:boolean[]) {
    this._winningSymbols = value;
  }
  public get WinningSymbols():boolean[] {
    return this._winningSymbols;
  }

}