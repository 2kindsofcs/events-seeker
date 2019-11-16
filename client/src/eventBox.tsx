import React from "react";

export interface eventProps extends React.HTMLAttributes<HTMLDivElement> {
    eventName: string;
    eventLinkList: string[];
}

export default class EventBox extends React.Component<eventProps> {
    public showEventLinks(eventLinkList: string[]) {
        if (eventLinkList.length > 1 ) {
            return eventLinkList.map((event: string, index: number) => {
                return <div key={index} className="eventLink">{event}</div>
            })
        } else {
            return <div>앗, 해당 키워드가 들어간 이벤트가 없습니다!</div>
        }
    }
    
    public render() {
        return (
            <div className="eventBox">
                <div className="eventName">
                    {this.props.eventName}
                </div> 
                    {this.showEventLinks(this.props.eventLinkList)}
            </div>
        );
    }
}