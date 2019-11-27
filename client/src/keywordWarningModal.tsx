import React from "react";

interface keywordWarningModalProps extends React.HTMLAttributes<HTMLDivElement> {
    closeKeywordWarningModal: Function
}

export default class keywordWarningModal extends React.Component<keywordWarningModalProps> {

    public render() {
        return (<div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
                <article className="message is-danger">
                    <div className="message-header">
                        <p>키워드 오류</p>
                        <button onClick={() => this.props.closeKeywordWarningModal()} className="delete" aria-label="delete"></button>
                    </div>
                    <div className="message-body">
                        키워드는 <strong>1자 이상 15자 이하</strong>만 가능합니다. (알파벳,한글 모두)
                    </div>
                </article>
                <button className="button" onClick={() => this.props.closeKeywordWarningModal()}>확인</button>
            </div>
        </div>);
    }
}