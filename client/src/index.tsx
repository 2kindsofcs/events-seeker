import './index.css';
import React from 'react';
import reactDom from 'react-dom';
import EventBox from './eventBox';

class App extends React.Component<{}, { isSignedIn: boolean, eventDic: {[key: string]: string[][]}, keyword: string, inactivateModal: boolean, keywordWarningModal: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = {
            isSignedIn: false,
            eventDic: {},
            keyword: '',
            inactivateModal: false,
            keywordWarningModal: false,    
        };
    }

    public updateEventData = () => {
        const data = {
            keyword: this.state.keyword,
        }
        if (this.state.keyword.length > 15 || this.state.keyword.length == 0) {
            this.setState({
                keywordWarningModal: true,
                keyword: ''
            });
            return
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
                .then((eventInfo: {[key: string]: string[][]}) => {
                    const tempEventDic = this.state.eventDic;
                    if (Object.keys(eventInfo).length == 0) {
                        tempEventDic[data.keyword] = [[]];
                        this.setState({
                            eventDic: tempEventDic,
                        })
                    } else {
                        const userKeyword = data.keyword
                        const key = Object.keys(eventInfo)[0];
                        if (tempEventDic.hasOwnProperty(userKeyword)) {
                            if (tempEventDic[userKeyword][0].length == 1) {
                                tempEventDic[userKeyword] = eventInfo[key]; 
                            } else {
                                tempEventDic[userKeyword].concat(eventInfo[key]);
                            }
                        } else {
                            tempEventDic[userKeyword] = eventInfo[key];
                        }
                        this.setState({
                            eventDic: tempEventDic,
                        })
                    }
                });
              })

      }
    
    public changeHandler = (e:any) => {
        this.setState({keyword: e.target.value});
    }

    public removeKeyword = async (keyword: string) => {
        let newEventDic: {[key:string]: string[][]} = {};
        const keys = Object.keys(this.state.eventDic);
        for (const key of keys) {
            if (key !== keyword) {
                newEventDic[key] = this.state.eventDic[key]
            }
        }
        this.setState({eventDic: newEventDic});
        await fetch(`/removeKeyword?keyword=${keyword}`);
        return;
    }

    public showEventList = ():React.ReactNode => {
        return Object.keys(this.state.eventDic).map((keyword: string, index: number) => {
            return <EventBox key={index} keyword={keyword} eventLinkList={this.state.eventDic[keyword]} />
        })
    }

    public showKeywordList = () => {
        return Object.keys(this.state.eventDic).map((keyword: string, index: number) => {
            return <div className="keyword" key={index} onClick={() => this.removeKeyword(keyword)}>{keyword} X</div>
        })
    }

    public showKeywordWarning = () => {
        const warned = this.state.keywordWarningModal;
        if (warned) {
            return (<div id="myModal" className="modal">
            <div className="modal-content">
              <p>키워드는 1자 이상 15자 이하만 가능합니다. (영,한 모두)</p>
              <button className="modalButton" onClick={() => this.setState({keywordWarningModal: false})}>확인</button>
            </div>
          </div>)
        }
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

    public showinactivateModal = () => {
        const inactivateClicked = this.state.inactivateModal
        if (inactivateClicked) {
            return (<div id="myModal" className="modal">
            <div className="modal-content">
              <p>아래 탈퇴하기 버튼을 누르면 라인 정보가 삭제되며,</p>
              <p>저장하신 키워드들도 전부 삭제됩니다.</p>
              <p>(정상적으로 탈퇴되면 로그아웃되고 메인페이지로 돌아갑니다! 놀라지 마세요!</p>
              <button className="modalButton" onClick={() => this.setState({inactivateModal: false})}>취소하기</button>
              <button className="modalButton" onClick={this.inactivate}>탈퇴하기</button>
            </div>
          </div>)
        } 
    }

    public inactivate = () => {
        try {
            fetch('/inactivate')
            .then(() => {
              this.logoutLine();  
            })
        } catch (e) {
            console.error(e)
        }
        
    }

    public greetingHandler = () => {
        if (this.state.isSignedIn) {
            return (<div><p>로그인 하셨습니다.  <button onClick={this.logoutLine}>로그아웃 하기</button></p>
                <button className="inactivateButton" onClick={() => this.setState({inactivateModal: true})}>서비스 탈퇴하기</button>
                {this.showinactivateModal()}
                </div>)
        } else {
            return <a href="/loginWithLine">라인으로 로그인하기</a>
        }
    }

    public logoutLine = () => {
        fetch('/logoutLine')
        .then(() => {
            const initStatus = {
                isSignedIn: false,
                eventDic: {},
                keyword: '',
                inactivateModal: false,
                keywordWarningModal: false,
            }
            this.setState(initStatus);
        })
    }

    public showAddBot = () => {
        if (this.state.isSignedIn) {
            return (<p>배달봇을 친구로 추가하면 새로운 이벤트가 festa.io에 등록되었을 때 알람을 받을 수 있습니다.<br/>
            <a href="line://ti/p/@193qusdw" target="_blank">친구 추가하기</a></p>)
        } else {
            return (<p>라인으로 로그인하시면 키워드가 저장됩니다.<br/>
            또한, 배달봇을 친구로 추가하시면 새로운 이벤트가 festa.io에 등록되었을 때 알람을 보내드립니다. </p>)
        }
        
    }

    public render() {
        return <>
            <div>{this.greetingHandler()}</div>
            <h1>이벤트 배달부 📮</h1>
            <p>아래에 원하는 키워드를 입력하면, festa.io에서 해당 키워드가 들어간 이벤트를 찾아드립니다.</p>
            <input type="text" id="keywords" value={this.state.keyword} onChange={this.changeHandler} />
            <button id="keywordButton" onClick={this.updateEventData}>추가하기</button>
            {this.showKeywordWarning()}
            <br/>
            {this.showAddBot()}
            <h3 id="keywordList">키워드 목록</h3>
            <div>{this.showKeywordList()}</div>
            <h3 id="eventList">이벤트 목록</h3>
            <div>{this.showEventList()}</div>
        </>;
    }
}

reactDom.render(<App /> ,document.querySelector('#app'));
