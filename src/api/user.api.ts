import { Router } from 'express';
import { User, Rejection } from '../data';
import { Logger } from '../util';
import { AuthService, UserService } from '../service';
import { Api, Route } from '../deco';

@Api('users')
export class UserApi {

  constructor(router: Router) { }

  @Route('register')
  postRegister(req, res) {

    const user = User.fromDTOWithPass(req.body);
    user.salt = AuthService.getSalt();
    const a = user.password;
    user.password = AuthService.hashPassword(a, user.salt);

    UserService.create(user).then(
    value => res.json(value.toDTO()),
    err => {
      res.status(err.status).send(err.message);
      Logger.error('POST: /users/register', err);
    });
  }

  @Route('login')
  postLogin(req, res) {
    AuthService.login(req).then(
      token => res.status(200).send(token),
      (err: Rejection) => {
        res.status(err.status).send(err.message);
        Logger.error('POST: /users/login', err);
    });
  }

  @Route('self')
  getSelf(req, res) { // check auth
    AuthService.auth(req).then(userId => {
      UserService.get(userId)
          .then(value => res.json(value.toDTO()));
    }, err => {
      res.status(err.status).send(err.message);
      Logger.error('PUT: /users/self', err);
    });
  }

  @Route('self')
  putSelf(req, res) { // check auth
    AuthService.auth(req).then(userId => {
      const user = User.fromDTO(req.body);
      user.id = userId;
      UserService.update(user)
          .then(value => res.sendStatus(204));
    }).catch(err => {
      res.status(err.status).send(err.message);
      Logger.error('PUT: /users/self', err);
    });
  }

  @Route('self')
  deleteSelf(req, res) { // check auth
    AuthService.auth(req).then(userId => {
      UserService.delete(userId)
          .then(() => res.sendStatus(204));
    }).catch(err => {
      res.status(err.status).send(err.message);
      Logger.error('DELETE: /users/self', err);
    });
  }

  @Route(':id')
  get(req, res) {
    AuthService.auth(req).then(userId => {
      UserService.get(req.params.id)
          .then(value => res.json(value.toDTO()));
    }).catch(err => {
      res.status(err.status).send(err.message);
      Logger.error('GET: /users/' + req.params.id, err);
    });
  }
}
