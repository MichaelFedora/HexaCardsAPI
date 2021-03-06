import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as moment from 'moment';

import { User, Rejection } from '../data';
import { Database } from '../db';
import { Logger } from '../util';

export class AuthService {

  static getSalt(): string {
    return crypto.randomBytes(8).toString('hex').slice(0, 16);
  }

  static hashPasswordAsync(password: string, salt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      crypto.pbkdf2(password, salt, 10000, 512, 'sha512', (err, key) => {
        if(err) { reject(err); return; }
        resolve(key.toString('hex'));
      })
    });
  }

  static hashPassword(password: string, salt: string): string {
      return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  }

  static async auth(request: Request): Promise<string> {

    const auth = request.header('Authorization');
    if(!auth) return Promise.reject(new Rejection('No Authorization Header', 401));

    const tokenMatch = /^Bearer (.+)$/.exec(auth);
    if(tokenMatch == null || tokenMatch[1] == null)
      return Promise.reject(new Rejection('Token Parse Error: Use "Bearer <token>"!', 401));

    const body = jwt.decode(tokenMatch[1]);

    try {
      const u = await Database.users.get(body.sub).run(Database.connection);
      jwt.verify(tokenMatch[1], User.fromDBO(u).tokenSecret);
    } catch(e) {
      Logger.error('Could not verify token', e);
      return Promise.reject(new Rejection('Could not verify token', 401));
    }

    return body.sub;
  }

  static async login(request: Request): Promise<string> {

    const auth = request.header('Authorization');
    if(!auth) return Promise.reject(new Rejection('No Authorization Header', 400));

    const authMatch = /^Basic (\w+):([a-zA-Z0-9!@#$%^&_]+)$/.exec(auth);
    if(authMatch == null || authMatch[1] == null || authMatch[2] == null)
      return Promise.reject(new Rejection('Header Parse Error: Use "Basic <username>:<password>"!', 400));

    const username = authMatch[1];
    const password = authMatch[2];

    let u: User;
    try {
      await Database.users.filter({ username: username }).run(Database.connection)
        .then(cursor => cursor.toArray().then(arr => {
          if(arr.length > 1) {
            Logger.error('Multiple users exist with the same username: ' + username, new Error());
            return Promise.reject('Multiple users exist with the same username: ' + username);
          }
          return Promise.resolve(u = arr[0] as User);
      }));
    } catch(e) {
      return Promise.reject(new Rejection('Bad username / password!', 400)); // :U
    }

    const hashedPass = this.hashPassword(password, u.salt);

    if(hashedPass !== u.password)
      return Promise.reject(new Rejection('Bad username / password!', 400)); // :u

    u.tokenSecret = crypto.randomBytes(16).toString('hex').slice(0, 32);
    const exp = moment().add(1, 'w');
    u.tokenExp = exp.toDate();

    const token = jwt.sign({
      sub: u.id,
      exp: exp.unix()
    }, u.tokenSecret);

    try {
      jwt.verify(token, u.tokenSecret);
      await Database.users.update(u).run(Database.connection);
    } catch(e) {
      Logger.error('Couldn\'t update database', e);
      return Promise.reject(new Rejection('Couldn\'t update database', 500));
    }

    return token;
  }
}
