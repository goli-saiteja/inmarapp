import React, { Component }from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Redirect, withRouter} from 'react-router-dom';
import { browserHistory } from 'react-router'
import {NotificationContainer, NotificationManager} from 'react-notifications';

import Sidebar from '../Sidebar/sidebar';
import Footer from '../Footer/footer';
import Home from '../Home/home';
import SKU from '../Sku/sku';
import Signin from '../Signin/signin';
import Graph from '../Graph/graph';
import Notfound from '../Notfound/404';
import 'react-notifications/lib/notifications.css';

import '../../styles/style.scss';
import './app.scss';
//HashRouter Provides a Bang for the routing and also support for routing when page refreshed
class App extends Component {
    constructor(props) {
      super(props);
      console.log('comp did updated');
      this.authenticate();
    }
    authenticate() {
      var exempted_urls = ['/signup', '/signin'];
      if(window.localStorage.getItem('apitoken') != undefined && window.localStorage.getItem('apitoken') != '' && exempted_urls.indexOf(this.props.location.pathname) != -1) {
        this.props.history.push('/');
      } else if(window.localStorage.getItem('apitoken') == undefined && window.localStorage.getItem('apitoken') == '' && exempted_urls.indexOf(this.props.location.pathname) == -1) {
        this.props.history.push('/signin');
      } else if ( exempted_urls.indexOf(this.props.location.pathname) == -1) {
        var payload = {
            "token": window.localStorage.getItem('apitoken')
        };
        fetch('/api/istokenvalid',{
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token':window.localStorage.getItem('apitoken')
            },
        })
        .then((resp) => resp.json())
        .then(function(data) {
            if(data.type == "error") {
              NotificationManager.error(data.message);
              this.props.history.push('/signin');
            } else {
              this.props.history.push(this.props.location.pathname);
            }
        }.bind(this)).catch(function(err) {
            NotificationManager.error(data.message);
            this.props.history.push('/signin');
        }.bind(this));
      }
    }
    componentDidUpdate(prevProps) {
      if (this.props.location.pathname !== prevProps.location.pathname) {
        this.authenticate();
      }
    }
    render () {
        return(
            <div>
                <div className="main">
                    <NotificationContainer/>
                    <Sidebar />
                    <div className="content">
                        <Switch>
                            <Route path="/signin" component={Signin} />
                            <Route path="/signup" component={Signin} />
                            <Route path="/graph-view" component={Graph} />
                            <Route path="/" component={SKU} />

                        </Switch>
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(App);
