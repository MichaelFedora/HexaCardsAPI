import { User } from '../data';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { Database } from '../db';
import * as crypto from 'crypto';
import * as moment from 'moment';

export class Authenticator {

  static getSalt(): string {
    return crypto.randomBytes(8).toString('hex').slice(0, 16);
  }

  static hashPassword(password: string, salt: string): string {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
  }

  static async auth(request: Request): Promise<string> {

    const auth = request.header('Authentication');
    if(!auth) throw new Error('No Authentication Header');

    const tokenMatch = /^Bearer (.+)$/.exec(auth);
    if(tokenMatch[1] == null) throw new Error('Token Parse Error: Use "Bearer <token>"!');

    const body = jwt.decode(tokenMatch[1]);
    const u = await Database.users.get(body.sub);

    try {
      jwt.verify(auth, u.tokenSecret);
    } catch(e) {
      throw new Error('Could not verify token');
    }

    return u.id;
  }

  static async login(request: Request): Promise<string> {

    const auth = request.header('Authentication');
    if(!auth) throw new Error('No Authentication Header');

    const authMatch = /^Basic (\w+):([a-zA-Z0-9!@#$%^&_]+)$/.exec(auth);
    if(authMatch[1] == null || authMatch[2] == null)
      throw new Error('Token Parse Error: Use "Basic <username>:<password>"!');

    let u: User;
    try {
      u = await Database.users.getByUsername(authMatch[1]);
    } catch(e) {
      throw new Error('Bad username / password!'); // :U
    }

    const hashedPass = this.hashPassword(authMatch[2], u.salt);

    if(hashedPass !== u.password) throw new Error('Bad username / password!'); // :u

    u.tokenSecret = crypto.randomBytes(16).toString('hex').slice(0, 32);
    const exp = moment().add(1, 'w');
    u.tokenExp = exp.toDate();

    const token = jwt.sign({
      sub: u.id,
      exp: exp.unix()
    }, u.tokenSecret);

    return token;
  }
}
