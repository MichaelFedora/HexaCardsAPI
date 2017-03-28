import { Router } from 'express';

import { bootstrap as teamsBootstrap } from './teams.routes';

export class Routes {
  public static bootstrap(router: Router): void {
    teamsBootstrap(router);
  }
}
