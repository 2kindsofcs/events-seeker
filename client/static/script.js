/* eslint-disable require-jsdoc */
const submit = document.getElementById('submit');
submit.addEventListener('click', updateKeywords);
function updateKeywords() {
  const data = {keywords: document.getElementById('keywords').value};
  fetch('/addKeywords', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
      .then(() => {
        getEventsData();
      });
}
const events = document.createElement('p');
events.id = 'eventData';
submit.appendChild(events);
const button = document.getElementById('button');
button.addEventListener('click', getEventsData);

function getEventsData() {
  fetch('/getEventsData')
      .then((res) => res.json())
      .then((eventList) => {
        const eventHead = document.getElementById('eventList');
        eventList.forEach((event) => {
          const element = document.createElement('p');
          element.innerText = event;
          eventHead.appendChild(element);
        });
      });
}
const loginB = document.getElementById('login');
loginB.addEventListener('click', loginWithLine);

function loginWithLine() {
  fetch('/loginWithLine');
}
