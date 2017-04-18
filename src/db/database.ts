import { Db, Connection } from 'rethinkdb';
import * as rethinkdbdash from 'rethinkdbdash';

import { TeamsDb } from './teams.db';
import { LogDb } from './log.db';
import { UsersDb } from './users.db';

export class Database {

  private static _connection: Connection;
  public static get connection() { return this._connection; }

  public static teams: TeamsDb;
  public static users: UsersDb;
  public static log: LogDb;

  public static get dbName(): string { return 'test'; }

  private static _r: rethinkdbdash;
  public static get r(): rethinkdbdash { return this._r; }

  public static init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /*r.connect({
        host: '127.0.0.1',
        port: 28015
      }, (err, conn) => {
        if(err) { reject(err); return; }
        this._connection = conn;
        this.postInit(resolve, reject);
      });*/
      this._r = rethinkdbdash();
      this.postInit(resolve, reject);
    });
  }

  private static postInit(resolve, reject): void {
    this.log = new LogDb(this.connection, this.dbName, this.r);
    this.teams = new TeamsDb(this.connection, this.dbName, this.r);
    this.users = new UsersDb(this.connection, this.dbName, this.r);

    Promise.all([
      this.log.init(),
      this.teams.init(),
      this.users.init()
    ]).then(() => resolve(), err => reject(err));
  }
}
