import { Router } from 'express';
import { Team } from '../data';
import { Logger } from '../util';
import { TeamService, AuthService } from '../service';
import { Api, Route } from '../deco';

@Api('teams')
export class TeamApi {

  constructor(router: Router) { }

  @Route('/')
  getAll(req, res): void {
    TeamService.getAll().then(
      value => res.json(value.map(v => v.toDTO())),
      err => {
        res.status(err.status).send(err.message);
        Logger.error('GET: /teams', err);
    });
  }

  @Route()
  post(req, res): void {
    AuthService.auth(req).then(userId => {
      const team = Team.fromDTO(req.body);
      TeamService.create(team)
          .then(value => res.json(value.toDTO()));
    }, err => {
        res.sendStatus(500);
        Logger.error('POST: /teams', err);
    });
  }

  @Route()
  put(req, res) {
    AuthService.auth(req).then(userId => {
      const team = Team.fromDTO(req.body);
      TeamService.update(team)
        .then(value => res.sendStatus(204));
    }, err => {
        res.sendStatus(500);
        Logger.error('PUT: /teams', err);
    });
  }

  @Route(':id')
  get(req, res) {
    TeamService.get(req.params.id).then(
      value => res.json(value.toDTO()),
      err => {
        res.status(err.status).send(err.message);
        Logger.error('GET: /teams/' + req.params.id, err);
    });
  }

  @Route(':id')
  delete(req, res) {
    AuthService.auth(req).then(userId => {
      TeamService.delete(req.params.id)
        .then(() => res.sendStatus(204));
    }, err => {
      res.status(err.status).send(err.message);
      Logger.error('DELETE: /teams/' + req.params.id, err);
    });
  }
}
