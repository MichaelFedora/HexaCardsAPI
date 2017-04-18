import { Db, Table, Connection } from 'rethinkdb';
import * as rethinkdb from 'rethinkdb';
import { series } from 'async';

export class Database {

  private static _connection: Connection;
  public static get connection() { return this._connection; }

  public static get dbName(): string { return 'test'; } /// @todo: adjust via env

  public static _r: typeof rethinkdb = rethinkdb
  public static get r(): typeof rethinkdb { return this._r; }

  public static get db(): Db { return this.r.db(this.dbName); }

  public static get teams(): Table { return this.db.table('teams'); }
  public static get users(): Table { return this.db.table('users'); }
  public static get log(): Table { return this.db.table('log'); }

  public static init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.r.connect({
        host: '127.0.0.1',
        port: 28015
      }).then(conn => {
        conn.use(this.dbName);
        this._connection = conn;
        Promise.all([
          this.initTeams()
        ]).then(() => resolve());
      }).catch(err => { reject(err); return; });
    });
  }

  private static initTeams(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(result => {

        if(result.findIndex(t => t === 'teams') < 0) {
          this.db.tableCreate('teams').run(this.connection)
              .then(table => resolve()); // or put in sample data

        } else resolve(); // or put in sample data

      }).catch(err => reject(err));
    });
  }

  private static initUsers(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(tableList => {

        if(tableList.findIndex(t => t === 'users') >= 0) { // table exists

          this.users.indexList().run(this.connection).then(indexList => {

            if(indexList.findIndex(t => t === 'username') < 0) { // if index doesn't exist
              this.users.indexCreate('username').run(this.connection)
                  .then(index => resolve());
            } else resolve();
          });

        } else { // table doesn't exist, so create it
          this.db.tableCreate('users').run(this.connection).then(table => {

            // if table didn't exist, neither did the index; create it!
            this.users.indexCreate('username').run(this.connection)
                .then(index => resolve());
          });
        }
      }).catch(err => reject(err));
    });
  }

  private static initLog(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(list => {

        if(list.findIndex(t => t === 'log') < 0) {
          this.db.tableCreate('log').run(this.connection).then(table => {
            (this.log as any).indexCreate('tags', { multi: true }).run()
              .then(result => resolve());
          });
        } else resolve();
      }).catch(err => reject(err));
    });
  }
}
