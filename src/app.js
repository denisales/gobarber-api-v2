import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import Youch from 'youch';
import fs from 'fs';
import { format } from 'date-fns';
import { promisify } from 'util';
import 'express-async-errors';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(helmet());
    this.server.use(
      cors({
        origin: process.env.FRONT_URL,
      })
    );
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json(errors);
      }
      const pathFile = path.resolve(__dirname, '..', 'tmp', 'logs');
      const timestampFile = format(
        new Date().getTime(),
        "yyyy-MM-dd'T'HH:mm:ss:SSS"
      );

      await promisify(fs.writeFile)(
        `${pathFile}/${timestampFile}.json`,
        JSON.stringify(errors)
      );
      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
