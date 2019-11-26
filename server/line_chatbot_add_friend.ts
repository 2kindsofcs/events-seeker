import { middleware as LineMiddleWare, FollowEvent } from '@line/bot-sdk';
import express from 'express';
import config from 'config';
import { eventFilter, pushMessage } from './line_chatbot_push';
import keywords from './models/keywords';
import eventData from './models/eventData';

const router = express.Router();

router.post('/line', LineMiddleWare(config.get('botConfig')), (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});


async function handleEvent(event: FollowEvent) {
  if (event.type != 'follow') {
    return
  } else {
    const id: string = event.source.userId!;
    const keywordList = (await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: id}
    })).map(instance => instance.keyword);
    if (keywordList.length == 0) {
      return
    } else {
      const data = await eventData.findAll();
      const eventDic = await eventFilter(data, keywordList);
      pushMessage([[id, keywordList]], eventDic);
    }
  }
}

export default router;