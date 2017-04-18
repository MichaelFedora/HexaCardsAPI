import { Connection, Db, Table } from 'rethinkdb';
import { Database } from '../db';

import { Team, Rejection } from '../data';

export class TeamService {

  public static get connection(): Connection { return Database.connection; }
  public static get table(): Table { return Database.users; }

  /*makeSampleData(resolve, reject): void {
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
  }*/

  public static getAll(): Promise<Team[]> {
    return new Promise<Team[]>((resolve, reject) => {
      this.table.run(this.connection).then(cursor => {
        cursor.toArray().then(arr => {
          resolve(arr.map(o => Team.fromDBO(o)));
        });
      }).catch(err => reject(new Rejection(err)));
    });
  }

  public static create(team: Team): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      const data = team.toDBO();
      delete data.id;
      this.table.insert(data).run(this.connection).then(result => {
        data.id = result.generated_keys[0];
        resolve(Team.fromDBO(data));
      }, err => reject(new Rejection(err)));
    });
  }

  public static update(team: Team): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(team.id).update(team).run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('Team not found with id ' + team.id, 404)); return; }
        resolve();
      }, err => reject(new Rejection(err)));
    });
  }

  public static get(id: string): Promise<Team> {
    return new Promise<Team>((resolve, reject) => {
      this.table.get(id).run(this.connection).then(result => {
        if(!result) { reject(new Rejection('Team not found with id ' + id, 404)); return; }
        resolve(Team.fromDBO(result));
      }, err => reject(new Rejection(err)));
    });
  }

  public static delete(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(id).delete().run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('Team not found with id ' + id, 404)); return; }
        resolve();
      }, err => reject(new Rejection(err)));
    });
  }
}
