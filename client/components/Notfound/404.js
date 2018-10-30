import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from "react-router-dom";
import { browserHistory } from 'react-router';
//class component for MenuBar
class Notfound extends Component {
    constructor(props) {
        super(props);
        var that = this;
        setTimeout(function(){
            that.props.history.push(`/home`)
        },1500)

    }
    render () {
        return(
            <div>
                <div className="banner cream notfound">
                    <div>
                        <div className="banner-header card">404 not found</div>
                        <div className="banner-content card"><NavLink to="/home" activeClassName="active">Go Home</NavLink></div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Notfound;
