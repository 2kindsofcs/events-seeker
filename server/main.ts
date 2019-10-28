/* eslint-disable require-jsdoc */
import fetch from 'node-fetch';
import config from 'config'; // cmd에서는 set NODE_ENV=something
import sequelize from './models';
import Sequelize from 'sequelize';
import user from './models/user';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { Client, middleware as LineMiddleWare, FollowEvent } from '@line/bot-sdk';
import path from 'path';

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

const parser = express.json();
app.use(function(req, res, next) { // express.josn()을 그냥 쓰면 line bot sdk랑 충돌 발생
  if (req.url.indexOf('/webhook') === 0) {
    return next();
  } else {
    return parser(req, res, next);
  }
});
app.use(express.urlencoded({extended: true}));

const keywordList: string[] = [];

app.post('/addKeywords', async function(req, res) {
  if (!req.session) {
    res.status(403);
    return;
  }

  keywordList.push(req.body.keywords); 
  if (req.session.userId) {
    // create a new row 
  }
  res.send("end");
});

app.get('/loginWithLine', function(req, res) {
  const clientId = config.get('channelId');
  const redirectUri = config.get('redirectUri');
  const state = '12345abcde'; // TODO: 랜덤으로 만들어줘야 됨. 일단 테스트용 임시값 사용.
  req.session!.state = state;
  res.redirect(`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile`);
});

app.get('/callback', function(req, res) {
  if (!req.session) {
    res.status(403);
    return;
  }

  const session = req.session;

  if (session.state == req.query.state) {
    session.code = req.query.code;
    const url = 'https://api.line.me/oauth2/v2.1/token';
    const uri = config.get('redirectUri');
    const data = `grant_type=authorization_code&code=${session.code}&redirect_uri=${uri}&client_id=${config.get('channelId')}&client_secret=${config.get('channelSecret')}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data, // body data type must match "Content-Type" header
    })
        .then((response) => response.json())
        .then((info: { access_token: string, id_token: string }) => {
          session.access_token = info.access_token;
          const decodedData = jwt.decode(info.id_token, {complete: true});
          if (decodedData == null || typeof decodedData === 'string') {
            res.status(500); // internal server error 
            return;
          }
          session.userId = decodedData.payload.sub; // user's line id
          // 뭔가 이것보다 더 깔끔한 방법이 있을 것 같은데 이게 최선인가? 
          (async function isOldUser() {
            const count = await user.count({
              where: {userId: decodedData.payload.sub},
            });
            if (count === 0) {
              await user.create({userId: decodedData.payload.sub, keywords: null, isPush: null, cycle: null});
            }
          })();
          res.redirect('/');
        });
  } else {
    res.end('invalid url');
    throw new Error('how did you get to here?');
  }
});

const result: string[] = [];

// app.get('/getEventDataAll)
// 세션에 id가 있으면 db에서 해당 유저가 설정해놓은 키워드 추려서 보여줌
// id는 있는데 설정해놓은 키워드가 없으면 키워드가 없음을 클라쪽에 알려줌
// id가 없으면 id가 없음을 알려줌 

app.get('/getEventsData', function(req, res) {
  fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false')
      .then((response) => response.json())
      .then((response) => {
        const eventList: { name: string, eventId: string }[] = response.rows;
        eventList.forEach((event) => {
          keywordList.forEach((keyword) => {
            if (event.name.includes(keyword)) {
              result.push(`https://festa.io/events/${event.eventId}`);
            }
          });
        });
      })
      .then(() => {
        res.json(result);
      });
});

const client = new Client(config.get('botConfig'));

app.post('/webhook', LineMiddleWare(config.get('botConfig')), (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const userInfo = {userId: ''};
function handleEvent(event: FollowEvent) {
  if (event.type === 'follow') {
    userInfo.userId = event.source.userId!;
  }
  result.forEach((eventInfo) => {
    return client.pushMessage(userInfo.userId, {
      type: 'text',
      text: eventInfo,
    }).catch((err) => console.log(err));
  });
}

app.use('/', express.static(path.join(__dirname, '..', 'client')));

app.listen(80, () => console.log('listening on 80'));

