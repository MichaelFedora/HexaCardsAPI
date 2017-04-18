import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as https from 'https';
import * as cors from 'cors'; /// https://github.com/expressjs/cors
import * as fs from 'fs';
import { Logger } from './util';
import { Database } from './db';

import { Routes } from './api';

console.log('Initializing database...');
Database.init().then(() => {
  // Logger.init(); -- unused
  console.log('Database Initialized');

  const app = express();

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  const port = process.env.PORT || 8079;

  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ message: 'hello world!' });
  });

  app.use((req, res, next) => {
    Logger.log('HTTP', req.method + ': ' + req.originalUrl, ['http', req.method, req.baseUrl + '/' +  req.path], req.ip);
    next();
  });

  Routes.bootstrap(router);

  app.use('/api', router);

  /*https.createServer({
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('cert.pem')
  }, app).listen(port); /// https://github.com/ebekker/ACMESharp/wiki/Quick-Start */

  app.listen(port);
  console.log('API started on port ' + port);

}, err => {

  Logger.error('Failed to start up due to database issues', err, ['error', 'startup']);
  process.exit(1);
});
