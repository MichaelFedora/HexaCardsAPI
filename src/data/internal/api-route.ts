import { RequestHandler } from 'express';

export class ApiRoute {
  type: string;
  route: string;
  reqHandler: RequestHandler;

  constructor(route: string, type: string, reqHandler: RequestHandler) {
    this.type = type;
    this.route = route ? (route === '/' ? '' : route) : '';
    this.reqHandler = reqHandler;
  }
}
