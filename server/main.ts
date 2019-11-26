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


import app from './webserver';
import router from './line_chatbot_add_friend';
app.use('/chatbot', router);
app.listen(80);

