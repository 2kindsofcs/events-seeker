import React from "react";

interface lineBotInfoBoxProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default class LineBotInfoBox extends React.Component<lineBotInfoBoxProps> {
    
    public render() {
        return (
            <article className="message is-info">
                <div className="message-body">
                    <strong>이벤트 배달봇을 친구로 추가하면 새로운 이벤트가 festa.io에 등록되었을 때 알람을 받을 수 있습니다.</strong>
                    <span>  </span>
                    <a href="line://ti/p/@193qusdw" target="_blank" className="button is-primary">배달봇 친구 추가하기</a>
                </div>
            </article>
        );
    }
}
