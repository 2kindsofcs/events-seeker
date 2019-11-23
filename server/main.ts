/* eslint-disable require-jsdoc */
import fetch from 'node-fetch';
import config from 'config'; // cmd에서는 set NODE_ENV=something
import sequelize from './models';
import Sequelize from 'sequelize';
import user from './models/user';
import keywords from './models/keywords';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import {decodeHTML} from 'entities';
import path from 'path';
import EventData from './models/eventData';

const Op = Sequelize.Op;
sequelize.sync();

const sessionStore = new session.MemoryStore();
const sessionHandler = session({
  secret: config.get('secret'),
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
});
const app = express();
app.use(sessionHandler);

import { deliverEvent } from './line_chatbot_push';
// 오전 9시부터 오후 10시까지 30분 간격으로 동작
cron.schedule('*/30 9-22 * * *', () => 
  deliverEvent()
);


import start from './webserver';
start(80);