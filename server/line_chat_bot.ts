import config from 'config'; // cmd에서는 set NODE_ENV=something
import sequelize from './models';
import fetch from 'node-fetch';
import Sequelize from 'sequelize';
import {decodeHTML} from 'entities';
import user from './models/user';
import keywords from './models/keywords';
import eventData from './models/eventData';
import { Client, middleware as LineMiddleWare, FollowEvent, TextMessage } from '@line/bot-sdk';
import express from 'express';
import EventData from './models/eventData';

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
  let oldEventData = await eventData.findAll();
  if (oldEventData.length == 0) {
    const rawData = await getEventDataAll();
    const eventKeys = Object.keys(rawData).map(key => parseInt(key));
    for (const key of eventKeys) {
      await eventData.create({
        eventId: key,
        eventName: decodeHTML(rawData[key]),
      });
  }
    oldEventData = await eventData.findAll();
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
  await updateEventData(oldEventData, latestEventData);
}

async function updateEventData(oldEventData: EventData[], latestEventData: {[key: number]: string}) {
  const oldEventKeys = oldEventData.map(instance => instance.eventId);
  const newEventKeys = Object.keys(latestEventData).map(key => parseInt(key));
  for (const key of newEventKeys) {
    if (!oldEventKeys.includes(key)) {
      const name = decodeHTML(latestEventData[key]);
      const isSaved = await eventData.findAll({where: {
        eventId: key
      }});
    } 
}
  for (const instance of oldEventData) {
    if (!newEventKeys.includes(instance.eventId)) {
      await eventData.destroy({
        where: {
          eventId: instance.eventId
        }
      })
    } 
  }
}

async function getEventDataAll() {
  const rawData = await fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false');
  const response = await rawData.json();
  const eventInfo: {
    name: string;
    eventId: string;
  }[] = response.rows;
  let result: {[key: string]: string} = {};
  for (const event of eventInfo) {
    result[event.eventId] = decodeHTML(event.name);
}
  return result
}

async function getNewEventData(oldData: EventData[], latestData: {[key: string]: string}) {
  let eventData: {[key: string]: string} = {} 
  const oldEventKeys = oldData.map(instance => instance.eventId)
  const newEventKeys = Object.keys(latestData)
    .filter(key => !oldEventKeys.includes(parseInt(key)));
  for (const eventKey of newEventKeys) {
    eventData[eventKey] = latestData[eventKey];
  }
  return eventData
}

async function eventFilter(eventData: {[key:string]: string}, keywords: string[]) {
  const eventDic: {[key: string]: string[]} = {}; // { "AI": ["주소1", "주소2"] } 형태 
  const eventKeys = Object.keys(eventData);
  for (const key of eventKeys) {
    for (const keyword of keywords) {
      if (eventData[key].includes(keyword)) {
        if (!eventDic.hasOwnProperty(keyword)) {
          eventDic[keyword] = [`https://festa.io/events/${key}`];
        } else {
          eventDic[keyword].push(`https://festa.io/events/${key}`);
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
