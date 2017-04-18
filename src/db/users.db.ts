import { Connection, Db, Table } from 'rethinkdb';

import { User, Rejection } from '../data';

export class UsersDb {

  private connection: Connection;
  private dbName: string;
  get db(): Db { return this.r.db(this.dbName); }
  get table(): Table { return this.db.table('users'); }

  private _r: any;
  private get r(): any { return this._r; }

  constructor(connection: Connection, dbName: string, r: any) {
    this.connection = connection;
    this.dbName = dbName;
    this._r = r;
  }

  postInit(resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void): void {
    this.table.count().eq(0).run(this.connection).then(eq0 => {
      /*if(eq0) {
        this.table.insert([
          new User('', 'asdf', '').toDBO()
        ]).run(this.connection).then(result => resolve());
      } else resolve();*/

      resolve();
    }).catch(err => reject(new Rejection(err)));
  }

  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.tableList().run(this.connection).then(tableList => {

        if(tableList.findIndex(t => t === 'users') >= 0) { // table exists

          this.table.indexList().run(this.connection).then(indexList => {

            if(indexList.findIndex(t => t === 'username') >= 0) { // index Exists
              this.postInit(resolve, reject);

            } else { // else, create it
              this.table.indexCreate('username').run(this.connection)
                  .then(index => this.postInit(resolve, reject));
            }
          });

        } else { // table doesn't exist, so create it
          this.db.tableCreate('users').run(this.connection).then(table => {

            // if table didn't exist, neither did the index; create it!
            this.table.indexCreate('username').run(this.connection).then(index => {
              this.postInit(resolve, reject);
            });
          });
        }
      }).catch(err => reject(new Rejection(err)));
    });
  }

  getAll(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.table.run(this.connection)
          .then(cursor => cursor.toArray()
              .then(result => resolve(result.map(o => User.fromDBO(o))))
      ).catch(err => reject(new Rejection(err)));
    });
  }

  create(user: User): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const data = user.toDBO();
      delete data.id;

      this.table.getAll(user.username, { index: 'username' }).isEmpty().run(this.connection).then(empty => {
        if(empty) {
          this.table.insert(data).run(this.connection).then(result => {
            if(!result) { reject(new Rejection('Could not create user', 500)); return; }
            data.id = result.generated_keys[0];
            resolve(User.fromDBO(data));
          });
        } else reject(new Rejection('Username is already in use', 400))
      }).catch(err => reject(new Rejection(err)));
    });
  }

  update(userDTO: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(userDTO.id).run(this.connection).then(cursor => {

        if(!cursor) { reject(new Rejection('User not found with id ' + userDTO.id, 404)); return; }

        const user = User.fromDBO(cursor);
        user.updateFromDTO(userDTO);

        this.table.get(userDTO.id).update(user).run(this.connection).then(result => {
          if(result.skipped > 0) { reject(new Rejection('Skipped (User not found on update)')); return; }
          resolve();
        });
      }).catch(err => reject(new Rejection(err)));
    });
  }

  get(id: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.table.get(id).run(this.connection).then(result => {
        if(!result) { reject(new Rejection('User not found with id ' + id, 404)); return; }
        resolve(User.fromDBO(result));
      }).catch(err => reject(new Rejection(err)));
    });
  }

  getByUsername(username: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.table.getAll(username, { index: 'username' }).run(this.connection).then(cursor => {
        if(!cursor) { reject(new Rejection('User not found with username ' + username, 404)); return; }

        cursor.toArray().then(arr => {
          if(arr.length === 0) { reject(new Rejection('User not found with username ' + username, 404)); return; }
          if(arr.length > 1) { reject(new Rejection('More than one user with the same username ' + username + ' (!?)', 500)); return; }

          resolve(User.fromDBO(arr[0]));
        });
      }).catch(err => reject(new Rejection(err)));
    });
  }

  delete(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(id).delete().run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('User not found with id ' + id, 404)); return; }
        resolve();
      }).catch(err => reject(new Rejection(err)));
    });
  }
}
