import config from 'config'; // cmd에서는 set NODE_ENV=something
import sequelize from './models';
import fetch from 'node-fetch';
import Sequelize from 'sequelize';
import user from './models/user';
import keywords from './models/keywords';
import eventData from './models/eventData';
import { Client, middleware as LineMiddleWare, FollowEvent, TextMessage } from '@line/bot-sdk';
import express from 'express';

const app = express();

sequelize.sync();
const client = new Client(config.get('botConfig'));

app.post('/webhook', LineMiddleWare(config.get('botConfig')), (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});


async function handleEvent(event: FollowEvent) {
  if (event.type != 'follow') {
    return
  } else {
    const id: string = event.source.userId!;
    const keywordData = (await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: id}
    })).map(instance => instance.keyword);
    if (keywordData.length == 0) {
      return
    } else {
      const eventData = await getEventDataAll();
      const eventDic = await eventFilter(eventData, keywordData);
      pushMessage({id: keywordData}, eventDic);
    }
  }
}


async function eventDelivery() {
  const users = await user.findAll();
  const userIdList: string[] = users.map((instance) => {
    return instance.userId
  });
  const rawData = await eventData.findAll();
  let oldEventData;
  if (rawData.length == 0) {
    oldEventData = await getEventDataAll();
  } else {
    oldEventData = JSON.parse(rawData[0].eventList);
  }
  const latestEventData = await getEventDataAll();
  const newEventData = await getNewEventData(oldEventData, latestEventData);
  const keywordList = (await keywords.aggregate<keywords, {DISTINCT: string}[]>(
    'keyword', 'DISTINCT', { plain: false }
  )).map(o => o.DISTINCT);
  const eventDic = await eventFilter(newEventData, keywordList);
  const userInfo: {[userId: string]: string[]} = {};
  for (const id of userIdList) {
    const keywordData = (await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: id}
    })).map(instance => instance.keyword);
    userInfo[id] = keywordData;
  }
  pushMessage(userInfo, eventDic);
}

async function getEventDataAll() {
  const rawData = await fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false');
  const response = await rawData.json();
  const eventInfo: {
    name: string;
    eventId: string;
  }[] = response.rows;
  return eventInfo;
}

async function getNewEventData(oldData: any, latestData: any) {
  let result = [];
  for (const event of latestData) {
    if (!oldData.includes(event)) {
      result.push(event);
    }
  }
  return result 
}

async function eventFilter(eventData: {name: string; eventId: string;}[], keywords: string[]) {
  const eventDic: {[key: string]: string[]} = {}; // { "AI": ["주소1", "주소2"] } 형태 
  for (const event of eventData) {
    for (const keyword of keywords) {
      if (event.name.includes(keyword)) {
        if (!eventDic.hasOwnProperty(keyword)) {
          eventDic[keyword] = [`https://festa.io/events/${event.eventId}`];
        } else {
          eventDic[keyword].push(`https://festa.io/events/${event.eventId}`);
        }
      }
    }
  }
  return eventDic  
}

function pushMessage(userInfo: {[userId: string]: string[]}, eventDic: {[key: string]: string[]}) {
  for (const userId of Object.keys(userInfo)) {
    const userEventData: string[] = [];
    for (const keyword of userInfo[userId]) {
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
      client.pushMessage(userId, message)
      .catch(e => console.log(e));
    }
  }
}
