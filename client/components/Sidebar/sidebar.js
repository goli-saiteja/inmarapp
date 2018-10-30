import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { NavLink, Link, withRouter} from "react-router-dom";

import './sidebar.scss';
//class component for MenuBar
class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuitems : {
              "unauthorised" : [
                {"name": "Login","url": "/signin"},
                {"name": "Signup","url": "/signup"}
              ],
              "authorised": [
                {"name": "SKU", "url": "/sku"},
                {"name": "Graph View","url": "/graph-view"},
              ]
            },
            username: '',
            isLoggedIn: false,
            currentmenu: []
        };
        this.onLogout = this.onLogout.bind(this);
    }
    onLogout () {
      window.localStorage.removeItem('apitoken');
      this.props.history.push('/signin');
    }
    componentDidUpdate(prevProps) {
      if (this.props.location.pathname !== prevProps.location.pathname) {
        this.resetMenu()
      }
    }
    resetMenu() {
      if(['/signin', '/signup'].indexOf(window.location.pathname) != -1) {
        this.setState((state, props) => ({
          "currentmenu": state.menuitems.unauthorised, "isLoggedIn": false
        }));
      } else if (['/', '/sku', '/graph-view', '/users', '/upload-data'].indexOf(window.location.pathname) != -1) {
        this.setState((state, props) => ({
          "currentmenu": state.menuitems.authorised, "isLoggedIn": true, "username": window.localStorage.getItem('username')
        }));
      }
    }
    componentDidMount() {
      this.resetMenu();
    }
    render () {
        return(
            <div className="sidebar-container">
              <div className="sidebar-brand">
                 INMAR
              </div>
              {this.state.isLoggedIn &&
                <div className="user-profile-container">
                    <h6 className="welcome-text">Welcome</h6>
                    <h4 className="username-text">{this.state.username}</h4>
                    <div>
                      <button className="btn sm" onClick={this.onLogout}>
                        Logout
                      </button>
                    </div>
                </div>
              }
              <div className="sidebar-nav-container">
                <ul className="nav-block">
                  {this.state.currentmenu.map(function(menuobj, index){
                    return <li key={ index } className="navitem"><NavLink to={menuobj.url} className="navlink">{menuobj.name}</ NavLink></li>
                  })}
                </ul>
              </div>
            </div>
        )
    }

}
export default withRouter(Sidebar);
