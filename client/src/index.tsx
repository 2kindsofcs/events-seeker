import React from 'react';
import reactDom from 'react-dom';

class App extends React.Component {
    public render() {
        return <>
            <h2>로그인을 하셨군요!</h2>
            <a id="login" href="/loginWithLine">라인으로 로그인하기</a>
        
            <h1>키워드를 등록해보자.</h1>
            <p>아래에 키워드를 쓰렴.</p>
            <input type="text" id="keywords" />
            <input type="submit" id="submit" value="확인" />
            <button id="button">테스트</button>
            <br/>
            <h3 id="eventList">이벤트 목록</h3>
        </>;
    }
}

reactDom.render(<App /> ,document.querySelector('#app'));
