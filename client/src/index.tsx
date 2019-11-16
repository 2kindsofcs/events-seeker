import React from 'react';
import reactDom from 'react-dom';
import EventBox from './eventBox';

class App extends React.Component<{}, { isSignedIn: boolean, eventDic: {[key: string]: string[]}, keyword: string }> {
    constructor(props: any) {
        super(props);
        this.state = {
            isSignedIn: false,
            eventDic: {},
            keyword: '',
        };
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
                fetch(`/getEventData?keyword=${data.keyword}`)
                .then((res) => res.json())
                .then((eventInfo) => {
                    const keyword = Object.keys(eventInfo)[0];
                    const tempEventDic = this.state.eventDic;
                    if (this.state.eventDic.hasOwnProperty(keyword)) {
                        tempEventDic[keyword] = tempEventDic[keyword].concat(eventInfo[keyword]);
                    } else {
                        tempEventDic[keyword] = eventInfo[keyword];
                    }
                    this.setState({
                        eventDic: tempEventDic,
                    })
                });
              })

      }
    
    public changeHandler = (e:any) => {
        this.setState({keyword: e.target.value});
    }

    public showEventList = ():React.ReactNode => {
        return Object.keys(this.state.eventDic).map((event: string, index: number) => {
            return <EventBox key={index} eventName={event} eventLinkList={this.state.eventDic[event]} />
        })
    }

    public signInCheck = () => {
        fetch('/isSignedInWithLine')
        .then((res) => res.json())
        .then(async (res) => {
            if (res.answer === true) {
                this.setState({isSignedIn: res.answer});
                const userEventDic = await fetch('/getEventDataAll').then((res) => res.json());
                this.setState({eventDic: userEventDic});
            }
        })
    }

    componentDidMount() {
        this.signInCheck();
      }

    public greetingHandler = () => {
        if (this.state.isSignedIn) {
            return <p>로그인 하셨습니다.</p>
        } else {
            return <a href="/loginWithLine">라인으로 로그인하기</a>
        }
    }

    public addBotFriend = () => 'line://ti/p/@193qusdw';

    public render() {
        return <>
            <div>{this.greetingHandler()}</div>
            <h1>이벤트 배달부</h1>
            <p>아래에 원하는 키워드를 입력하면, festa.io에서 해당 키워드가 들어간 이벤트를 찾아드립니다.</p>
            <input type="text" id="keywords" value={this.state.keyword} onChange={this.changeHandler} />
            <input type="submit" id="submit" value="확인" onClick={this.updateEventData}  />
            <p>봇을 친구로 추가하면 알람을 받을 수 있습니다.</p>
            <a href={this.addBotFriend()} target="_blank">친구 추가하기</a>
            <br/>
            <h3 id="eventList">이벤트 목록</h3>
            <div>{this.showEventList()}</div>
        </>;
    }
}

reactDom.render(<App /> ,document.querySelector('#app'));
