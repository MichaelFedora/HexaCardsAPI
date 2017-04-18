import { Connection, Db, Table } from 'rethinkdb';
import { Database } from '../db';

import { User, Rejection } from '../data';

export class UserService {

  public static get connection(): Connection { return Database.connection; }
  public static get table(): Table { return Database.users; }

  public static getAll(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.table.run(this.connection)
          .then(cursor => cursor.toArray()
              .then(result => resolve(result.map(o => User.fromDBO(o))))
      ).catch(err => reject(new Rejection(err)));
    });
  }

  public static create(user: User): Promise<User> {
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

  public static update(userDTO: User): Promise<void> {
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

  public static get(id: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.table.get(id).run(this.connection).then(result => {
        if(!result) { reject(new Rejection('User not found with id ' + id, 404)); return; }
        resolve(User.fromDBO(result));
      }).catch(err => reject(new Rejection(err)));
    });
  }

  public static getByUsername(username: string): Promise<User> {
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

  public static delete(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.table.get(id).delete().run(this.connection).then(result => {
        if(result.skipped > 0) { reject(new Rejection('User not found with id ' + id, 404)); return; }
        resolve();
      }).catch(err => reject(new Rejection(err)));
    });
  }
}
