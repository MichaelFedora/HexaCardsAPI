import { Connection, Db, Table } from 'rethinkdb';
import { LogEntry, Rejection } from '../data';

export class LogDb {

  private connection: Connection;
  private dbName: string;

  get db(): Db { return this.r.db(this.dbName); }
  get table(): Table { return this.db.table('log'); }

  private _r: any;
  private get r(): any { return this._r; }

  constructor(connection: Connection, dbName: string, r: any) {
    this.connection = connection;
    this.dbName = dbName;
    this._r = r;
  }

  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(list => {

        if(list.findIndex(t => t === 'log') < 0) {
          this.db.tableCreate('log').run(this.connection).then(table => {
            (this.table as any).indexCreate('tags', { multi: true }).run()
              .then(result => resolve());
          });
        } else resolve();
      }).catch(err => reject(new Rejection(err)));
    });
  }

  getAll(): Promise<LogEntry[]> {
    return new Promise<LogEntry[]>((resolve, reject) => {
      this.table.run(this.connection)
          .then(cursor => cursor.toArray()
              .then(result => resolve(result.map(o => LogEntry.fromAny(o))))
      ).catch(err => reject(new Rejection(err)));
    });
  }

  create(logEntry: LogEntry): Promise<LogEntry> {
    return new Promise<LogEntry>((resolve, reject) => {
      const data = logEntry.toAny();
      delete data.id;

      this.table.insert(data).run(this.connection).then(result => {
          data.id = result.generated_keys[0];
          resolve(LogEntry.fromAny(data));
        }, err => reject(new Rejection(err)));
    });
  }
}
