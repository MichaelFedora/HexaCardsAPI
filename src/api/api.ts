import { Router } from 'express';
import { TeamApi } from './team.api';
import { UserApi } from './user.api';

export class Api {

  private _router: Router = Router();
  public get router(): Router { return this._router; }

  private _team: TeamApi;
  public get team(): TeamApi { return this._team; }

  private _user: UserApi;
  public get user(): UserApi { return this._user; }

  constructor() {
    this._team = new TeamApi(this.router);
    this._user = new UserApi(this.router);
  }
}
