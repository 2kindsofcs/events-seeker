import React from 'react';
import reactDom from 'react-dom';

class App extends React.Component<{}, { isSignedIn: boolean, eventList: string[], keyword: string }> {
    constructor(props: any) {
        super(props);
        this.state = {
            isSignedIn: false,
            eventList: [],
            keyword: '',
        };
    }

    public updateEventList = () => {
        fetch('/getEventsData')
            .then((res) => res.json())
            .then((eventList: string[]) => {
                const newEventList = this.state.eventList.concat(eventList);
                this.setState({
                    eventList: newEventList,
                })
            });
    }

    public updateEventData = () => {
        const data = {
            keyword: this.state.keyword,
        }
        fetch('/addKeywords', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              .then(() => {
                  this.updateEventList();
              })

      }
    
    public changeHandler = (e:any) => {
        this.setState({keyword: e.target.value});
    }

    public showEventList = ():React.ReactNode => {
        return this.state.eventList.map((event: string, index: number) => {
            return <div key={index}>{event}</div>
        })
    }

    public render() {
        return <>
            <h2>로그인을 하셨군요!</h2>
            <a id="login" href="/loginWithLine">라인으로 로그인하기</a>
        
            <h1>키워드를 등록해보자.</h1>
            <p>아래에 키워드를 쓰렴.</p>
            <input type="text" id="keywords" value={this.state.keyword} onChange={this.changeHandler} />
            <input type="submit" id="submit" value="확인" onClick={this.updateEventData}  />
            <button id="button">테스트</button>
            <br/>
            <h3 id="eventList">이벤트 목록</h3>
            <div>{this.showEventList()}</div>
        </>;
    }
}

reactDom.render(<App /> ,document.querySelector('#app'));
