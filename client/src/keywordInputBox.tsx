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
            <div className="field has-addons">
                <div className="control">
                <input value={this.props.keyword} onChange={(e) => this.props.keywordChangeHandler(e)} className="input is-normal" type="text" placeholder="키워드를 입력하세요" />
                </div>
                <div className="control">
                <button className="button addButton" onClick={() => this.props.updateEventData()}>
                    <span className="icon is-small">
                        <i className="fas fa-check"></i>
                    </span>
                    <span><strong>추가하기</strong></span>
                </button>
                </div>
            </div>
        );
    }
}
