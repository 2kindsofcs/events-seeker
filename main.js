/* eslint-disable require-jsdoc */
const fetch = require('node-fetch');
const config = require('config'); // cmd에서는 set NODE_ENV=something

const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const parser = express.json();
app.use(function(req, res, next) {
  if (req.url.indexOf('/webhook') === 0) {
    return next();
  } else {
    return parser(req, res, next);
  }
});
app.use(express.urlencoded({extended: true}));
app.use('/client', express.static(__dirname + '/client'));


app.get('/', function(req, res) {
  res.redirect('/client/main.html');
});

const keywordList = [];

app.post('/addKeywords', function(req, res) {
  keywordList.push(req.body.keywords);
  res.end();
});

app.get('/getEventsData', function(req, res) {
  const result = [];
  fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false')
      .then((response) => response.json())
      .then((response) => {
        const eventIdList = [];
        const eventList = response.rows;
        eventList.forEach((event) => {
          keywordList.forEach((keyword) => {
            if (event.name.includes(keyword)) {
              eventIdList.push(event.eventId);
            }
          });
        });
        eventIdList.forEach((element) => {
          result.push((`https://festa.io/events/${element}`));
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

function handleEvent(event) {
  if (event.type !== 'follow' ) {
    console.log(event);
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text,
  });
}

app.listen(80, () => console.log('listening on 80'));

