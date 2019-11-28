import React from "react";

interface dataSaveWarningBoxProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default class DataSaveWarningBox extends React.Component<dataSaveWarningBoxProps> {

    public render() {
        return (
            <article className="message is-warning">
                <div className="message-header">
                    <p>주의사항</p>
                </div>
                <div className="message-body">
                    <strong>라인으로 로그인하지 않으면 키워드는 저장되지 않습니다.</strong><br/>
                    라인으로 로그인하면 키워드가 저장되며, 배달봇을 이용하여 이벤트 등록 알람도 받으실 수 있습니다.
                </div>
            </article>
        );
    }
}



