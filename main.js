const fetch = require('node-fetch');

const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/client', express.static(__dirname + '/client'));


app.get('/', function(req, res) {
  res.redirect('/client/main.html');
});

const keywordList = [];

app.post('/addKeywords', function(req, res) {
  keywordList.push(req.body.keywords);
  res.end();
});

app.get('/getEventsData', function (req, res) {
  const result = [];
  fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false')
    .then(response => response.json())
    .then(response => {
      const eventIdList = [];
      const eventList = response.rows;
      eventList.forEach(event => {
        keywordList.forEach(keyword => {
          if (event.name.includes(keyword)) {
            eventIdList.push(event.eventId);
          }
        })
      })
      eventIdList.forEach(element => {
        result.push((`https://festa.io/events/${element}`));
      })
    })
    .then(() => {
      res.json(result);
    });
})

app.listen(3100, () => console.log('listening on 3100'));

