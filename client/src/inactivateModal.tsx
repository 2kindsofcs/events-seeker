import React from "react";

interface inactivateModalProps extends React.HTMLAttributes<HTMLDivElement> {
    closeInactivateModal: Function
    inactivateLineAccount: Function
}


export default class inactivateModal extends React.Component<inactivateModalProps> {

    public render() {
        return (<div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">서비스 탈퇴하기</p>
            <button className="delete" onClick={() => this.props.closeInactivateModal()} aria-label="close"></button>
          </header>
          <section className="modal-card-body">
            <div className="content">
            <h2>모든 정보가 삭제됩니다.</h2>
            <p>서비스를 탈퇴할 경우 라인 고유 식별자, 현재까지 저장한 키워드들이 일체 삭제됩니다.
                한번 탈퇴하면 복구가 불가능합니다. (탈퇴한 이후 동일한 라인 계정으로 로그인은 가능합니다.)
            </p>
            <h2>연동 해제하기</h2>
            <p> 서비스를 탈퇴해도 앱 연동은 유지됩니다. 즉, 탈퇴한 이후 동일한 라인 계정으로 로그인을 할 때
                고유 식별자 수집에 동의하는지 묻는 화면은 나오지 않습니다. 탈퇴시 모든 정보는 삭제되지만
                뭔가 찝찝하다고 느끼신다면 라인 메신저 --> 더보기 --> 우측 상단 톱니바퀴 --> 계정 -->
                연동 중인 앱 메뉴에서 event-seeker-login을 선택하여 연동 해제하실 수 있습니다.
            </p>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-success" onClick={() => this.props.inactivateLineAccount()}>서비스 탈퇴</button>
            <button className="button" onClick={() => this.props.closeInactivateModal()}>취소하기</button>
          </footer>
        </div>
      </div>);
    }
}