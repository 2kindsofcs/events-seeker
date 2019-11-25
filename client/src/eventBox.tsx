import React from "react";

export interface eventProps extends React.HTMLAttributes<HTMLDivElement> {
    keyword: string;
    eventLinkList: string[][];
}

export default class EventBox extends React.Component<eventProps> {
    public showEventLinks(eventLinkList: string[][]) {
        if (!eventLinkList) {
            return <div>앗, 키워드가 없어서 아무런 이벤트도 없네요!</div>
        }
        if (eventLinkList.length >= 1 && eventLinkList[0].length == 2) {
            return eventLinkList.map((event: string[], index: number) => {
                return <div key={index}><a href={event[1]} target="_blank">{event[0]}</a><br/></div>
            })
        } else {
            return <div>앗, 해당 키워드가 들어간 이벤트가 없습니다!</div>
        }
    }
    
    public render() {
        return (
            <div className="eventBox">
                <div className="eventName">
                    {this.props.keyword}
                </div>
                {this.showEventLinks(this.props.eventLinkList)}
            </div>
        );
    }
}