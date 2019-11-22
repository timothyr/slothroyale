export class LocalUUIDGenerator {

  private static _instance: LocalUUIDGenerator = new LocalUUIDGenerator();

  private _currentNum: number = 0;

  constructor() {
      if(LocalUUIDGenerator._instance){
          throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
      }
      LocalUUIDGenerator._instance = this;
  }

  public static getInstance(): LocalUUIDGenerator
  {
      return LocalUUIDGenerator._instance;
  }

  public getNextUUID(): number
  {
    this._currentNum += 1;
    return this._currentNum;
  }
}