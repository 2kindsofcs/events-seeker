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

app.get('/isSignedInWithLine', function (req, res) {
  if (!req.session) {
    res.json({answer: false});
  } else if (req.session.userId) {
    res.json({answer: true});
  }
})

app.post('/addKeywords', async function(req, res) {
  if (!req.session || !req.session.userId) {
    res.json('');
    return;
  }
  const keywordLower = req.body.keyword.toLowerCase();
  const isOverlapped: number = await keywords.count({
    where: {
      userId: req.session.userId,
      keyword: keywordLower,
    }
  });
  if (req.session.userId && !isOverlapped) {
    await keywords.create({userId: req.session.userId, keyword: keywordLower});
  }
  res.json("end");
});

app.get('/removeKeyword', async function(req, res) {
  if (!req.session || !req.session.userId) {
    res.send('');
    return;
  }
  const keywordLower = req.body.keyword.toLowerCase();
  const isPresent: number = await keywords.count({
    where: {
      userId: req.session.userId,
      keyword: keywordLower,
    }
  });
  if (req.session.userId && isPresent) {
    await keywords.destroy({
      where: {
        userId: req.session.userId, 
        keyword: keywordLower
      }
    });
  }
  res.send('removed');
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

app.get('/getEventDataAll', async function(req, res) {
  if (!req.session) {
    res.end('no session. can\'t get eventdata')
  } else if (req.session.userId) try {
    const keywordData = await keywords.findAll({
      attributes: ['keyword'],
      where: {userId: req.session.userId}
    })
    const keywordList = keywordData.map((instance) => {
      return instance.keyword;
    })
    if (!keywordList) {
      res.json([]);
    }
    getEventDataFesta(keywordList)
    .then((result) => {
      res.json(result);
    });
  } catch(e) {
    console.error(e);
    res.end(e);
  }
})


app.get('/getEventData', function(req, res) {
  getEventDataFesta([req.query.keyword])
  .then((result) => res.json(result));
});

async function getEventDataFesta(keywordList: string[]) {
  const rawData = await fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false');
  const response = await rawData.json();
  const eventInfo: {
    name: string;
    eventId: string;
  }[] = response.rows;
  const eventDic: {[key: string]: string[][]}  = {}; 
  for (const event of eventInfo) {
    for (const keyword of keywordList) {
      const keywordLower = keyword.toLowerCase()
      if (event.name.toLowerCase().includes(keywordLower)) { // TODO: 주소만 주는게 아니라 키워드랑 이벤트 이름도 주자.
        if (!eventDic.hasOwnProperty(keywordLower)) {
          eventDic[keywordLower] = [[decodeHTML(event.name), `https://festa.io/events/${event.eventId}`]];
        } else {
          eventDic[keywordLower].push([decodeHTML(event.name),`https://festa.io/events/${event.eventId}`]);
        }
      }
    }
  }
  if (Object.keys(eventDic).length >= 1) {
  return eventDic;
  } else {
    return {};
  }
}


app.use('/', express.static(path.join(__dirname, '..', 'client')));

app.listen(80, () => console.log('listening on 80'));

