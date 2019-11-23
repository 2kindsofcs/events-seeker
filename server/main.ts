/* eslint-disable require-jsdoc */
import config from 'config'; // cmd에서는 set NODE_ENV=something
import { init as initDB } from './models';

import cron from 'node-cron';

initDB(config.get('db'));

import { deliverEvent } from './line_chatbot_push';
// 오전 9시부터 오후 10시까지 30분 간격으로 동작
cron.schedule('*/30 9-22 * * *', () => 
  deliverEvent()
);


import start from './webserver';
start(80);