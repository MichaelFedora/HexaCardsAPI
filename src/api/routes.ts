import { Router } from 'express';

import { bootstrap as teamsBootstrap } from './teams.routes';
import { bootstrap as usersBootstrap } from './users.routes';

export class Routes {
  public static bootstrap(router: Router): void {
    teamsBootstrap(router);
    usersBootstrap(router);
  }
}
