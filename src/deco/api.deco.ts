import { Router } from 'express';
import { ApiRoute } from '../data/internal';

export function Api(baseRoute?: string) {

  if(baseRoute) {
    if(baseRoute[0] !== '/')
      baseRoute = '/' + baseRoute;
    if(baseRoute[baseRoute.length - 1] !== '/')
      baseRoute += '/';
  } else baseRoute = '/';

  return function<T extends {new(...args: any[]): {}}>(constructor: T) {

    return class extends constructor {

      private __routes: ApiRoute[];

      constructor(...args: any[]);
      constructor(router: Router, ...args: any[]) {
        if(typeof router !== typeof Router) throw new Error('No router was passed!');
        super(args);
        // const router = Router();
        this.__routes.forEach(route => {
          try {
            router[route.type](baseRoute + route.route, route.reqHandler);
          } catch(e) {
              throw new Error(`Couldn't bootstrap route ${baseRoute + route.route}: `
                      + `Either type '${route.type}' is unknown or no router (${router}) was passed`);
          }
        });
      }

    }
  }
}
