import React from "react";

interface navBarProps extends React.HTMLAttributes<HTMLDivElement> {
    isSignedIn: undefined | boolean
    logoutLine: Function
    inactivateModal: Function
    showinactivateModal: Function
}


export default class NavBar extends React.Component<navBarProps> {
    public showNavbarWithButton(isSignedIn: undefined | boolean) {
        if (isSignedIn) {
            return (<div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <p className="button is-primary is-light" onClick={() => this.props.logoutLine()}>
                  <strong>로그아웃하기</strong>
                </p>
                <p className="button is-primary is-danger" onClick={() => this.props.inactivateModal()}>
                  <strong>탈퇴하기</strong>
                </p>
                {this.props.showinactivateModal()}
              </div>
            </div>
          </div>)
        } else if (isSignedIn == false) {
            return (<div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-success" href="/loginWithLine">
                  <strong>라인으로 로그인하기</strong>
                </a>
              </div>
            </div>
          </div>)
        }
    }
    
    public render() {
        return (
            <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
              <a className="navbar-item title" href="https://events-seeker.2kindsofcs.xyz">
                이벤트 배달부 📮
              </a>
      
              <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false"
                data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </a>
            </div>
      
            <div id="navbarBasicExample" className="navbar-menu">
              <div className="navbar-start">
                <a className="navbar-item">
                  About
                </a>
      
              </div>
            {this.showNavbarWithButton(this.props.isSignedIn)}
            </div>
          </nav>
        );
    }
}