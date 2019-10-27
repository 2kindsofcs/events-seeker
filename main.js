/* eslint-disable require-jsdoc */
const fetch = require('node-fetch');
const config = require('config'); // cmd에서는 set NODE_ENV=something

const Sequelize = require('./models/index').Sequelize;
const sequelize = require('./models/index').sequelize;
const Op = Sequelize.Op;
const {user} = require('./models');

const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const line = require('@line/bot-sdk');

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

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const parser = express.json();
app.use(function(req, res, next) { // express.josn()을 그냥 쓰면 line bot sdk랑 충돌 발생
  if (req.url.indexOf('/webhook') === 0) {
    return next();
  } else {
    return parser(req, res, next);
  }
});
app.use(express.urlencoded({extended: true}));
app.use('/client', express.static(__dirname + '/client'));


app.get('/', function(req, res) {
  res.render('main', {
    session: req.session,
  });
});

const keywordList = [];

app.post('/addKeywords', async function(req, res) {
  keywordList.push(req.body.keywords);
  // 키워드 받으면 키워드만 update. 
  // UPDATE user SET keywords = CONCAT(keywords, ", ML") WHERE id = 1
  if (req.session.userId) {
    await user.update({
      keywords: sequelize.fn('CONCAT', sequelize.col('keywords'), req.body.keywords),
    },
    {
      where: {userId: req.session.userId},
    });
  }
  res.send("end");
});

app.get('/loginWithLine', function(req, res) {
  const clientId = config.get('channelId');
  const redirectUri = config.get('redirectUri');
  const state = '12345abcde'; // TODO: 랜덤으로 만들어줘야 됨. 일단 테스트용 임시값 사용.
  req.session.state = state;
  res.redirect(`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile`);
});

app.get('/callback', function(req, res) {
  if (req.session.state == req.query.state) {
    req.session.code = req.query.code;
    const url = 'https://api.line.me/oauth2/v2.1/token';
    const uri = config.get('redirectUri');
    const data = `grant_type=authorization_code&code=${req.session.code}&redirect_uri=${uri}&client_id=${config.get('channelId')}&client_secret=${config.get('channelSecret')}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data, // body data type must match "Content-Type" header
    })
        .then((response) => response.json())
        .then((info) => {
          req.session.access_token = info.access_token;
          const decodedData = jwt.decode(info.id_token, {complete: true});
          req.session.userId = decodedData.payload.sub; // user's line id
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

const result = [];
// 챗봇 --> 하루 세번 이벤트를 받아와서 "쏴줌"
// 웹사이트 --> 로그인했거나, 새로고침하거나, 키워드 더하면 그에 해당하는 정보를 줌 

// app.get('/getEventDataAll)
// 세션에 id가 있으면 db에서 해당 유저가 설정해놓은 키워드 추려서 보여줌
// id는 있는데 설정해놓은 키워드가 없으면 키워드가 없음을 클라쪽에 알려줌
// id가 없으면 id가 없음을 알려줌 

app.get('/getEventsData', function(req, res) {
  fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false')
      .then((response) => response.json())
      .then((response) => {
        const eventList = response.rows;
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


client = new line.Client(config.get('botConfig'));

app.post('/webhook', line.middleware(config.get('botConfig')), (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const userInfo = {userId: ''};
function handleEvent(event) {
  if (event.type === 'follow') {
    userInfo.userId = event.source.userId;
  }
  result.forEach((eventInfo) => {
    return client.pushMessage(userInfo.userId, {
      type: 'text',
      text: eventInfo,
    }).catch((err) => console.log(err));
  });
}

app.listen(80, () => console.log('listening on 80'));

