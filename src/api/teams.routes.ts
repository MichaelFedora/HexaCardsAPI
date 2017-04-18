import { Router } from 'express';
import { Team } from '../data';
import { Logger } from '../util';
import { TeamService, AuthService } from '../service';

export function bootstrap(router: Router) {
  router.route('/teams')
    .get((req, res) => {
      TeamService.getAll().then(
        value => res.json(value.map(v => v.toDTO())),
        err => {
          res.status(err.status).send(err.message);
          Logger.error('GET: /teams', err);
      });
    })
    .post((req, res) => {
      AuthService.auth(req).then(userId => {
        const team = Team.fromDTO(req.body);
        TeamService.create(team)
            .then(value => res.json(value.toDTO()));
      }, err => {
          res.sendStatus(500);
          Logger.error('POST: /teams', err);
      });
    })
    .put((req, res) => { // check auth
      AuthService.auth(req).then(userId => {
        const team = Team.fromDTO(req.body);
        TeamService.update(team)
          .then(value => res.sendStatus(204));
      }, err => {
          res.sendStatus(500);
          Logger.error('PUT: /teams', err);
      });
    });

  router.route('/teams/:id')
    .get((req, res) => {
      TeamService.get(req.params.id).then(
        value => res.json(value.toDTO()),
        err => {
          res.status(err.status).send(err.message);
          Logger.error('GET: /teams/' + req.params.id, err);
      });
    })
    .delete((req, res) => { // check auth
      AuthService.auth(req).then(userId => {
        TeamService.delete(req.params.id)
          .then(() => res.sendStatus(204));
      }, err => {
        res.status(err.status).send(err.message);
        Logger.error('DELETE: /teams/' + req.params.id, err);
      });
    });
}
