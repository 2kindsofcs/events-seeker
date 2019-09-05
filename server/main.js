const fetch = require('node-fetch');

function getData() {
    fetch('https://festa.io/api/v1/events?page=1&pageSize=24&order=startDate&excludeExternalEvents=false')
        .then(response => response.json())
        .then(response => {
            const eventIdList = [];
            const eventList = response.rows;
            eventList.forEach(element => {
                if (element.name.includes('AI')) {
                    eventIdList.push(element.eventId);
                }
            })
            eventIdList.forEach(element => {
                console.log(`https://festa.io/events/${element}`);
            })
        });
}
getData();