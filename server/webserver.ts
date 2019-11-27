import { decodeHTML } from "entities";
import EventData from "./models/eventData";
import session from "express-session";
import config from "config";
import express from "express";
import fetch from 'node-fetch';
import user from './models/user';
import keywords from './models/keywords';
import jwt from 'jsonwebtoken';
import path from 'path';
import cryptoRandomString  from 'crypto-random-string';

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
  if (keywordLower.length > 15) {
    res.send("too long keyword").status(400);
    return;
  }
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
  const keywordLower = req.query.keyword.toLowerCase();
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
  const state = cryptoRandomString({length: 10});
  req.session!.state = state;
  res.redirect(`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid`);
});

app.get('/logoutLine', function(req, res) {
  if (req.session && req.session.userId) {
    req.session.userId = undefined;
  }
  res.send('logout');
})


app.get('/inactivate', async function (req, res) {
  if (!req.session || !req.session.access_token) {
    res.status(400);
    res.send('no session or access_token')
    return;
  }
  let err = false;
  const url = 'https://api.line.me/oauth2/v2.1/revoke';
  const data = `client_id=${config.get('channelId')}&client_secret=${config.get('channelSecret')}&access_token=${req.session.access_token}`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data, 
  }).catch(e => {
    console.error(e)
    err = true; 
  })
  if (err) {
    res.send("failed delete access token").status(500)
    return
  }
  const id = req.session.userId;
  await user.destroy({
    where: {
      userId: id,
    }
  })
  await keywords.destroy({
    where: {
      userId: id,
    }
  })
  res.send("deleted").status(200);
  return;
})


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
  const eventData = await EventData.findAll();
  const eventDic: {[key: string]: string[][]}  = {}; 
  for (const event of eventData) {
    for (const keyword of keywordList) {
      const keywordLower = keyword.toLowerCase()
      if (event.eventName.toLowerCase().includes(keywordLower)) { // TODO: 주소만 주는게 아니라 키워드랑 이벤트 이름도 주자.
        if (!eventDic.hasOwnProperty(keywordLower)) {
          eventDic[keywordLower] = [[decodeHTML(event.eventName), `https://festa.io/events/${event.eventId}`]];
        } else {
          eventDic[keywordLower].push([decodeHTML(event.eventName),`https://festa.io/events/${event.eventId}`]);
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

export default app;
