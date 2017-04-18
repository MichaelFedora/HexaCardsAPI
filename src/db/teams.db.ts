import { Connection, Db, Table } from 'rethinkdb';

import { Team, Rejection } from '../data';

export class TeamsDb {

  private connection: Connection;
  private dbName: string;
  get db(): Db { return this.r.db(this.dbName); }
  get table(): Table { return this.db.table('teams'); }

  private _r: any;
  private get r(): any { return this._r; }

  constructor(connection: Connection, dbName: string, r: any) {
    this.connection = connection;
    this.dbName = dbName;
    this._r = r;
  }

  postInit(resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void): void {
    this.table.count().eq(0).run(this.connection).then(eq0 => {
      if(eq0) {
        this.table.insert([
          {
            name: 'Blue Team',
            color: '#0D69AC'
          },
          {
            name: 'Red Team',
            color: '#C4281C'
          }
        ]).run(this.connection).then(result => resolve());
      } else resolve();
    }).catch(err => reject(new Rejection(err)));
  }

  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(result => {

        if(result.findIndex(t => t === 'teams') >= 0) {
          this.postInit(resolve, reject);

        } else {
          this.db.tableCreate('teams').run(this.connection)
              .then(table => this.postInit(resolve, reject));
        }
      }).catch(err => reject(new Rejection(err)));
    });
  }

  getAll(): Promise<Team[]> {
    return new Promise<Team[]>((resolve, reject) => {
      this.table.run(this.connection).then(cursor => {
        cursor.toArray().then(arr => {
          resolve(arr.map(o => Team.fromDBO(o)));
        });
      }).catch(err => reject(new Rejection(err)));
    });
  }

  create(team: Team): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      const data = team.toDBO();
      delete data.id;
      this.table.insert(data).run(this.connection).then(result => {
        data.id = result.generated_keys[0];
        resolve(Team.fromDBO(data));
      }, err => reject(new Rejection(err)));
    });
  }

  update(team: Team): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(team.id).update(team).run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('Team not found with id ' + team.id, 404)); return; }
        resolve();
      }, err => reject(new Rejection(err)));
    });
  }

  get(id: string): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      this.table.get(id).run(this.connection).then(result => {
        if(!result) { reject(new Rejection('Team not found with id ' + id, 404)); return; }
        resolve(Team.fromDBO(result));
      }, err => reject(new Rejection(err)));
    });
  }

  delete(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(id).delete().run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('Team not found with id ' + id, 404)); return; }
        resolve();
      }, err => reject(new Rejection(err)));
    });
  }
}
