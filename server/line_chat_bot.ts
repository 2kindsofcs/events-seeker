import config from 'config'; // cmd에서는 set NODE_ENV=something
import sequelize from './models';
import Sequelize from 'sequelize';
import user from './models/user';
import keywords from './models/keywords'
import { Client, middleware as LineMiddleWare, FollowEvent, TextMessage } from '@line/bot-sdk';

sequelize.sync();
const client = new Client(config.get('botConfig'));


async function pushEventMessage() {
  // 기왕 async 쓸거면 then이랑 섞어쓰지 말자 
  const users = await user.findAll();
  const userIdList: string[] = users.map((instance) => {
    return instance.userId
  });
  const keywordList = (await keywords.aggregate<keywords, {DISTINCT: string}[]>(
    'keyword', 'DISTINCT', { plain: false }
  )).map(o => o.DISTINCT);
  const rawData = await fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false');
  const response = await rawData.json();
  const eventInfo: {
    name: string;
    eventId: string;
  }[] = response.rows;
  const eventDic: {[key: string]: string[]} = {}; // { "AI": ["주소1", "주소2"] } 형태 
  for (const event of eventInfo) {
    for (const keyword of keywordList) {
      if (event.name.includes(keyword)) {
        if (!eventDic.hasOwnProperty(keyword)) {
          eventDic[keyword] = [`https://festa.io/events/${event.eventId}`];
        } else {
          eventDic[keyword].push(`https://festa.io/events/${event.eventId}`);
        }
      }
    }
  }
  for (const id of userIdList) {
    const keywordData = (await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: id}
    })).map(instance => instance.keyword);
    const userEventData: string[] = [];
    for (const keyword of keywordData) {
      if (eventDic[keyword]) {
        for (const event of eventDic[keyword]) {
          if (!userEventData.includes(event)) {
            userEventData.push(event)
          }
        }
      } 
    }
    for (const event of userEventData) {
      const message: TextMessage = {
        type: 'text',
        text: event,
      };
      client.pushMessage(id, message)
      .catch(e => console.log(e));
    }
  }
}
