import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Logger } from './util';
import { Database } from './db';

import { Routes } from './api';

Database.init().then(() => {
  Logger.init();

  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  const port = process.env.PORT || 8079;

  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ message: 'hello world!' });
  });

  app.use((req, res, next) => {
    console.log('Time to log!');
    next();
  });

  Routes.bootstrap(router);

  app.use('/api', router);

  app.listen(port);
  console.log('API started on port ' + port);

}, err => {

  console.error('ERROR: Failed to startup due to database issues; ', err);
  process.exit(1);
});
