import { Router } from 'express';
import { Team } from '../data';
import { Logger } from '../util';
import { Database } from '../db';

export function bootstrap(router: Router) {
  router.route('/teams')
    .get((req, res) => {
      Database.teams.getAll().then(
        value => res.json(value.map(v => v.toAny())),
        err => {
          res.send(500);
          Logger.log('GET: /teams', err);
        });
    })
    .post((req, res) => {
      const team = Team.fromAny(req.body);
      Database.teams.create(team).then(
        value => res.json(value.toAny()),
        err => {
          res.send(500);
          Logger.log('POST: /teams', err);
        });
    });
}
