import React from 'react';
import ReactDOM from 'react-dom';
import { Route, HashRouter,Redirect, DefaultRoute, Router, Switch,BrowserRouter} from 'react-router-dom';

import App from './components/App/App';

//HashRouter Provides a Bang for the routing and also support for routing when page refreshed
ReactDOM.render(<BrowserRouter>
        <App></App>
</BrowserRouter>, document.getElementById('app'));


if(module.hot) {
	module.hot.accept();
}
