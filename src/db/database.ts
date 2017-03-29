import { Db, Connection } from 'rethinkdb';
import * as r from 'rethinkdb';

import { TeamsDb } from './teams.db';
import { LogDb } from './log.db';

export class Database {

  private static connection: Connection;

  public static teams: TeamsDb;
  public static log: LogDb;

  public static get db(): string { return 'test'; }

  public static init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      r.connect({
        host: '127.0.0.1',
        port: 28015
      }, (err, conn) => {
        if(err) { reject(err); return; }
        this.connection = conn;
        this.postInit(resolve, reject);
      });
    });
  }

  private static postInit(resolve, reject): void {
    this.teams = new TeamsDb(this.connection, this.db);
    this.log = new LogDb(this.connection, this.db);
    this.teams.init().then(() =>
      this.log.init().then(() =>
        resolve(),
        err => reject(err)),
     err => reject(err));
  }

  // public static users: UsersDb;
}
