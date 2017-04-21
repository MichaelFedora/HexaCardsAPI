import { Router, RequestHandler } from 'express';
import { ApiRoute } from '../data/internal';

const ApiRouteTypes = [
    'get',
    'post',
    'put',
    'delete',
    'all' // etc; there's a lot more...
];

export function Route(route?: string) {

  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor | void {
    const typeMatch = /^[a-z]+/.exec(propertyKey);

    if(!typeMatch || !ApiRouteTypes.find(a => a === typeMatch[0]))
      throw new Error(`Couldn't parse type for ${propertyKey}: ${typeMatch ? typeMatch[0] : typeMatch}!`);

    const type = typeMatch[0];
    target.__routes =  target.__routes || [];
    target.__routes.push(new ApiRoute(route, type, target[propertyKey]))
  }
}
