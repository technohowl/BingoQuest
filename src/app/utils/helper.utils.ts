
export class Helper {

  
  private constructor() {
    
  }

  static numPad(value:number):string {
    return value < 10 ? `0${value}` : value.toString();
  }

  static getTimeInDays(timestamp:number):number {
    return this.getTimeInHours(timestamp) / 24;
  }
  static getTimeInHours(timestamp:number):number {
    return timestamp  / 1000 / 60 / 60;
  }

  static getPropertyIfNotNull<T>(name:string, value:T):Object {
    if(value) {
      return {[name]: value}
    }
    return null;
  }

  // const propsTypes = keyof typeof Helper.stringToType(['a', 'b', 'c']);
  static stringToType<T extends string>(obj: Array<T>): {[K in T]: K} {
    return obj.reduce((res, key:T) => {
      res[key] = key;
      return res;
    }, Object.create(null));
  }

  static DegreeToRad(value:number):number {
    return value * Math.PI / 180;
  }

  public static RandomInt(min: number, max:number):number {
    return Math.floor(Math.random() * max) + min;
  }

  public static log(...logData:any[]){
    // @ts-ignore
    window.log(...logData);
  }

}
