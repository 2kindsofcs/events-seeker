import config from 'config'; // cmd에서는 set NODE_ENV=something
import fetch from 'node-fetch';
import {decodeHTML} from 'entities';
import user from './models/user';
import keywords from './models/keywords';
import eventData from './models/eventData';
import { Client, TextMessage } from '@line/bot-sdk';
import EventData from './models/eventData';

const client = new Client(config.get('botConfig'));

export {
  cronJob,
  updateEventData,
  getNewEventData,
  eventFilter,
  pushMessage,
}

async function cronJob() {
  let standard: number;
  const lastEventId: number = await eventData.max('eventId');
  if (isNaN(lastEventId)) {
    standard = 0;
  } else {
    standard = lastEventId;
  }
  const newEventData = await getNewEventData(standard);
  const updatedEvents = await updateEventData(newEventData);
  const userInfo = await getUserIdWithKeywords();
  const keywordList: string[] = [];
  for (const info of userInfo) {
    const keywords = info[1]
    for (const keyword of keywords) {
      if (!keywordList.includes(keyword)) {
        keywordList.push(keyword)
      }
    }
  }
  const eventDic = eventFilter(updatedEvents, keywordList)
  pushMessage(userInfo, eventDic);
}


async function getUserIdWithKeywords() {
  const result: [string, string[]][] = [];
  const users = await user.findAll();
  const userIdList: string[] = users.map((instance) => {
    return instance.userId
  });
  for (const id of userIdList) {
    const keywordData = (await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: id}
    })).map(instance => instance.keyword);
    result.push([id, keywordData]);
  }
  return result;
}

async function updateEventData(newEventData: [number, string][]) {
  const dataToUpdate = [];
  for (const eventInfo of newEventData) {
    const element = {
      eventId: eventInfo[0],
      eventName: eventInfo[1]
    }
    dataToUpdate.push(element);
  }
  const result = await eventData.bulkCreate(dataToUpdate);
  return result;
}

import { RootObject as FestaIO } from "./festa_io_interface"

async function getNewEventData(standard: number) {
  // 일단은 1page만 조사(이벤트 체크 텀이 길면 2페이지 이상도 조사해야 할 수도 있음)
  // 순차적인 접근밖에 안할건데 굳이 딕셔너리를 쓸 필요는 없다. 튜플 배열을 쓰자.
  const result: [number, string][] = [];
  const festaUrl: string = config.get('festaAPI');
  let flag = true
  let pageNum = 1;
  while (flag) {
    let requestUrl = festaUrl.slice(0,36) + pageNum + festaUrl.slice(37);
    let rawData = await fetch(requestUrl);
    const response: FestaIO = await rawData.json();
    const eventData = response.rows;
    for (const event of eventData) {
      if (Date.parse(event.startDate) <= Date.now()) {
        flag = false;
        break
      }
      if (event.eventId > standard) {
        result.push([event.eventId, decodeHTML(event.name)]);
      }
    }
    pageNum = pageNum + 1
  }
  return result
}


function eventFilter(eventData: EventData[], keywords: string[]) {
  const eventDic: {[key: string]: string[]} = {}; // { "AI": ["주소1", "주소2"] } 형태 
  for (const keyword of keywords) {
    for (const instance of eventData) {
      if (instance.eventName.includes(keyword)) {
        if (!eventDic.hasOwnProperty(keyword)) {
          eventDic[keyword] = [`https://festa.io/events/${instance.eventId}`];
        } else {
          eventDic[keyword].push(`https://festa.io/events/${instance.eventId}`);
        }
      }
    }
  }
  return eventDic;
}

function pushMessage(userInfoList: [string, string[]][], eventDic: {[key: string]: string[]}) {
  for (const userInfo of userInfoList) {
    const userEventData: string[] = [];
    for (const keyword of userInfo[1]) {
      if (eventDic[keyword]) {
        for (const event of eventDic[keyword]) {
          if (!userEventData.includes(event)) {
            userEventData.push(event + "\n")
          }
        }
      } 
    }
    let eventMessage = ""
    for (const link of userEventData) {
      eventMessage = eventMessage + link;
    }
    if (eventMessage.length < 1) {
      return
    }
    const message: TextMessage = {
      type: 'text',
      text: eventMessage,
    };
    client.pushMessage(userInfo[0], message)
    .catch(e => console.log(e));
  }
}