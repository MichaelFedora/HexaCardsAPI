import { Router } from 'express';
import { User } from '../data';
import { Authenticator, Logger } from '../util';
import { Database } from '../db';

/**
 * @todo
 * - add try-catch block to most of this stuff so that we can a: catch database errors
 * and b: check for authentication errors
 *
 */

export function bootstrap(router: Router) {

  router.route('/users/register')
    .post((req, res) => {

      const user = User.fromDTOWithPass(req.body);
      user.salt = Authenticator.getSalt();
      user.password = Authenticator.hashPassword(user.password, user.salt);

      Database.users.create(user).then(
        value => res.json(value.toDTO()),
        err => {
          res.sendStatus(500);
          Logger.error('POST: /users/register', err);
        });
    });

  router.route('/users/login')
    .post((req, res) => {
      Authenticator.login(req).then(
        token => res.send(200, token),
        err => {
          res.sendStatus(500); // todo, send back better error returns :T
          Logger.error('POST: /users/register', err);
      });
    });

  router.route('/users/self')
    .get((req, res) => { // check auth
      Authenticator.auth(req).then(userId => {
        Database.users.get(userId).then(
          value => res.json(value.toDTO()),
          err => {
            res.sendStatus(500);
            Logger.error('GET: /users/self', err);
        });
      }, err => {
        res.send(402, { message: err.message });
        Logger.error('PUT: /users/self', err);
      });
    })
    .put((req, res) => { // check auth
      Authenticator.auth(req).then(userId => {
        const user = User.fromDTO(req.body);
        user.id = userId;
        Database.users.update(user).then(
          value => res.sendStatus(204),
          err => {
            if(err === 404) {
              res.sendStatus(404);
              return;
            }
            res.sendStatus(500);
            Logger.error('PUT: /users/self', err);
        });
      }, err => {
        res.send(402, { message: err.message });
        Logger.error('PUT: /users/self', err);
      });
    })
    .delete((req, res) => { // check auth
      Authenticator.auth(req).then(userId => {
        Database.users.delete(userId).then(
          () => res.sendStatus(204),
          err => {
            if(err === 404) {
              res.sendStatus(404);
              return;
            }
            res.sendStatus(500);
            Logger.error('DELETE: /users/self', err);
        });
      }, err => {
        res.send(402, { message: err.message });
        Logger.error('PUT: /users/self', err);
      });
    });

  router.route('/users/:id')
    .get((req, res) => {
      Authenticator.auth(req);
      Database.users.get(req.params.id).then(
        value => res.json(value.toDTO()),
        err => {
          if(err === 404) {
            res.sendStatus(404);
            return;
          }
          res.sendStatus(500);
          Logger.error('GET: /users/' + req.params.id, err);
        });
    });
}
