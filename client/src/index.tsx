import './index.css';
import React from 'react';
import reactDom from 'react-dom';
import EventBox from './eventBox';
import NavBar from './navBar';
import InactivateModal from './inactivateModal';
import KeywordInputBox from './keywordInputBox';
import KeywordWarningModal from './keywordWarningModal';
import DataSaveWarningBox from './dataSaveWarningBox';
import LineBotInfoBox from './lineBotInfoBox';

class App extends React.Component<{}, { isSignedIn: boolean | undefined, eventDic: {[key: string]: string[][]}, keyword: string, inactivateModal: boolean, keywordWarningModal: boolean, burgerClicked: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = {
            isSignedIn: undefined,
            eventDic: {},
            keyword: '',
            inactivateModal: false,
            keywordWarningModal: false,
            burgerClicked: false,    
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
        const eventKeyword = e.target.value.trim();
        this.setState({keyword: eventKeyword});
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
            return <span className="tag" key={index} onClick={() => this.removeKeyword(keyword)}>{keyword} X</span>
        })
    }

    public showKeywordWarning = () => {
        const warned = this.state.keywordWarningModal;
        if (warned) {
            return (
                <KeywordWarningModal closeKeywordWarningModal={() => this.setState({keywordWarningModal: false})} />
            )
        }
    }

    public signInCheck = () => {
        fetch('/isSignedInWithLine')
        .then((res) => res.json())
        .then(async (res) => {
            this.setState({
                isSignedIn: res.answer
            });
            if (res.answer === true) {
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
            return <InactivateModal closeInactivateModal={() => this.setState({inactivateModal: false})}
             inactivateLineAccount={this.inactivate}/>
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

    public showGuide = () => {
        if (this.state.isSignedIn) {
            return <LineBotInfoBox />
        } else {
            return <DataSaveWarningBox />
        }
        
    }

    public toggleBurger = () => {
        this.setState({
            burgerClicked: !this.state.burgerClicked
        })
    }

    public render() {
        return <>
            <div className="container">
            <NavBar isSignedIn={this.state.isSignedIn} logoutLine={this.logoutLine} 
            inactivateModal={() => this.setState({inactivateModal: true})} burgerClicked={this.state.burgerClicked}
            showinactivateModal={this.showinactivateModal} burgerHandler={this.toggleBurger} />
            <div className="container contents">
            <p>아래에 원하는 키워드를 입력하면, festa.io에서 해당 키워드가 들어간 이벤트를 찾아드립니다.</p>
            <br/>
            <KeywordInputBox keyword={this.state.keyword} keywordChangeHandler={this.changeHandler}
            updateEventData={this.updateEventData} showKeywordWarning={this.showKeywordWarning} />
            {this.showKeywordWarning()}
            {this.showGuide()}
            <br/>
            <h2 id="keywordList">키워드 목록</h2>
            <div className="tags are-medium">{this.showKeywordList()}</div>
            <h2 id="eventList">이벤트 목록</h2>
            <div>{this.showEventList()}</div>
            </div>
            </div>
        </>;
    }
}

reactDom.render(<App /> ,document.querySelector('#app'));
