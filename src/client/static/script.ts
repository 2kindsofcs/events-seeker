/* eslint-disable require-jsdoc */
const submit = document.getElementById('submit')! as HTMLInputElement;
const keywordsInput = document.getElementById('keywords')! as HTMLInputElement;
const eventHead = document.getElementById('eventList') as HTMLHeadingElement;

submit.addEventListener('click', updateKeywords);
function updateKeywords() {
  const data = {
    keywords: keywordsInput.value
  };
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
const button = document.getElementById('button') as HTMLButtonElement;
button.addEventListener('click', getEventsData);

function getEventsData() {
  fetch('/getEventsData')
      .then((res) => res.json())
      .then((eventList: string[]) => {
        eventList.forEach((event) => {
          const element = document.createElement('p');
          element.innerText = event;
          eventHead.appendChild(element);
        });
      });
}
const loginB = document.getElementById('login') as HTMLAnchorElement;
loginB.addEventListener('click', loginWithLine);

function loginWithLine() {
  fetch('/loginWithLine');
}
