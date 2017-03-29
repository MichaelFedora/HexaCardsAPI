import { Connection, Db, Table } from 'rethinkdb';
import * as r from 'rethinkdb';

import { Team } from '../data';

export class TeamsDb {

  private connection: Connection;
  private dbName: string;
  private get db(): Db { return r.db(this.dbName); }
  private get table(): Table { return this.db.table('teams'); }

  constructor(connection: Connection, dbName: string) {
    this.connection = connection;
    this.dbName = dbName;
  }

  postInit(resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void): void {
    this.table.count().eq(0).run(this.connection, (err, result) => {
      if(err) { reject(err); return; }
      if(result) {
        this.table.insert([
          {
            name: 'Blue Team',
            color: '#0D69AC'
          },
          {
            name: 'Red Team',
            color: '#C4281C'
          }
        ]).run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          resolve();
        });
      } else resolve();
    });
  }

  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(result.findIndex(t => t === 'teams') >= 0) { this.postInit(resolve, reject); return; }
        this.db.tableCreate('teams').run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          this.postInit(resolve, reject);
        });
      });
    });
  }

  getAll(): Promise<Team[]> {
    return new Promise<Team[]>((resolve, reject) => {
      this.table.run(this.connection, (err, cursor) => {
        if(err) { reject(err); return; }
        cursor.toArray((err, result) => {
          if(err) { reject(err); return; }
          resolve(result.map(o => Team.fromAny(o)));
        });
      });
    });
  }

  create(team: Team): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      const data = team.toAny();
      delete data.id;
      this.table.insert(data).run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          data.id = result.generated_keys[0];
          resolve(Team.fromAny(data));
        });
    });
  }

  update(team: Team): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(team.id).update(team).run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(result.skipped > 0) { reject(404); return; }
        resolve();
      });
    });
  }

  get(id: string): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      this.table.get(id).run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(!result) { reject(404); return; }
        resolve(Team.fromAny(result));
      });
    });
  }

  delete(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(id).delete().run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(result.skipped > 0) { reject(404); return; }
        resolve();
      });
    });
  }
}
