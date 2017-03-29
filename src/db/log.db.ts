import { Connection, Db, Table } from 'rethinkdb';
import * as r from 'rethinkdb';

import { LogEntry } from '../data';

export class LogDb {

  private connection: Connection;
  private dbName: string;
  private get db(): Db { return r.db(this.dbName); }
  private get table(): Table { return this.db.table('log'); }

  constructor(connection: Connection, dbName: string) {
    this.connection = connection;
    this.dbName = dbName;
  }

  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(result.findIndex(t => t === 'log') >= 0) { resolve(); return; }
        this.db.tableCreate('log').run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          (this.table as any).indexCreate('tags', { multi: true });
        });
      });
    });
  }

  getAll(): Promise<LogEntry[]> {
    return new Promise<LogEntry[]>((resolve, reject) => {
      this.table.run(this.connection, (err, cursor) => {
        if(err) { reject(err); return; }
        cursor.toArray((err, result) => {
          if(err) { reject(err); return; }
          resolve(result.map(o => LogEntry.fromAny(o)));
        });
      });
    });
  }

  create(logEntry: LogEntry): Promise<LogEntry> {
    return new Promise<LogEntry>((resolve, reject) => {
      const data = logEntry.toAny();
      delete data.id;
      this.table.insert(data).run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          data.id = result.generated_keys[0];
          resolve(LogEntry.fromAny(data));
        });
    });
  }
}
