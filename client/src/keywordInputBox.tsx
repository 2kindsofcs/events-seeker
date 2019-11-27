import React from "react";

interface keywordInputBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    keywordChangeHandler: Function
    updateEventData: Function
    showKeywordWarning: Function
    keyword: string
}

export default class KeywordInputBox extends React.Component<keywordInputBoxProps> {

    public render() {
        return (
            <div className="columns">
                <div className="column">
                    <input value={this.props.keyword} onChange={(e) => this.props.keywordChangeHandler(e)} className="input is-primary is-normal" type="text" placeholder="여기에 키워드를 입력하세요" />
                </div>
                <div className="column">
                    <button className="button is-primary" onClick={() => this.props.updateEventData()}>
                        <span className="icon is-small">
                            <i className="fas fa-check"></i>
                        </span>
                        <span>추가하기</span>
                    </button>
                </div>
                {this.props.showKeywordWarning()}
            </div>
        );
    }
}
