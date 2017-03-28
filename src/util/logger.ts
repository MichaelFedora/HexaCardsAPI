//import { Db } from '../db';

export class Logger {

  public static init(): void {

  }

  public static log(what: string, error: any): void {
    console.log(what, error);
  }

  public static error(what: string, error: any): void {
    console.error(what, error);
  }

  private constructor() { }

}
