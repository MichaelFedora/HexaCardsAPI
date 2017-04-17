import { Connection, Db, Table } from 'rethinkdb';
import * as r from 'rethinkdb';

import { User } from '../data';

export class UsersDb {

  private connection: Connection;
  private dbName: string;
  private get db(): Db { return r.db(this.dbName); }
  private get table(): Table { return this.db.table('users'); }

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
            name: 'asdf asdf',
            password: 'asdf'
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
        if(result.findIndex(t => t === 'users') >= 0) { this.postInit(resolve, reject); return; }
        this.db.tableCreate('users').run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          this.postInit(resolve, reject);
        });
      });
    });
  }

  getAll(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.table.run(this.connection, (err, cursor) => {
        if(err) { reject(err); return; }
        cursor.toArray((err, result) => {
          if(err) { reject(err); return; }
          resolve(result.map(o => User.fromDBO(o)));
        });
      });
    });
  }

  create(user: User): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const data = user.toDBO();
      delete data.id;
      this.table.insert(data).run(this.connection, (err, result) => {
          if(err) { reject(err); return; }
          data.id = result.generated_keys[0];
          resolve(User.fromDBO(data));
        });
    });
  }

  update(user: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(user.id).update(user).run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(result.skipped > 0) { reject(404); return; }
        resolve();
      });
    });
  }

  get(id: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.table.get(id).run(this.connection, (err, result) => {
        if(err) { reject(err); return; }
        if(!result) { reject(404); return; }
        resolve(User.fromDBO(result));
      });
    });
  }

  getByUsername(username: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.table.getAll(username, { index: 'username' }).run(this.connection, (err, cursor) => {
        if(err) { reject(err); return; }
        if(!cursor) { reject(404); return; }
        cursor.next((err, result) => {
          if(err) { reject(err); return; }
          if(!result) { reject(404); return; }
          if(cursor.hasNext()) { reject(500); return; }
          resolve(User.fromDBO(result));
        })
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
