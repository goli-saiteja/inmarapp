import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import {NotificationManager} from 'react-notifications';

import './signin.scss';
import 'react-notifications/lib/notifications.css';
//Class Component for Footer
class Signin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            email: "",
            password: "",
            confirm: "",
            formErrors: {username: "",email: "", password: "",  confirm: ""},
            usernameValid: false,
            emailValid: false,
            passwordValid: false,
            confirmValid: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.onSignin = this.onSignin.bind(this);
        this.onSignup = this.onSignup.bind(this);
        this.onEnterPress = this.onEnterPress.bind(this);

    }
    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        this.resetState();
      }
    }
    resetState() {
      var stateobj = {
          username: "",
          email: "",
          password: "",
          confirm: "",
          formErrors: {username: "",email: "", password: "",  confirm: ""},
          usernameValid: false,
          emailValid: false,
          passwordValid: false,
          confirmValid: false
      };
      this.setState(stateobj);
    }
    onSignin() {
        if(this.state.email.length == 0 || this.state.password.length == 0) {
            let formErrors =  {email: '', password: ''};
            let emailValid = this.state.email.length == 0 ? false : true;
            let passwordValid = this.state.password.length == 0 ? false : true;
            if(this.state.email.length == 0) {
                formErrors.email = 'email should not be empty!';
            }
            if (this.state.password.length == 0) {
                formErrors.password = 'Password should not be empty!'
            }
            this.setState({formErrors: formErrors,
                  emailValid: emailValid,
                  passwordValid: passwordValid
            });
        } else {
            const url = '/api/gettoken';
            var payload = {
                "email": this.state.email,
                "password": this.state.password
            };
            fetch(url,
            {
                method: "POST",
                body: JSON.stringify( payload ),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then((resp) => resp.json())
            .then(function(data) {
                if(data.type == "success") {
                    NotificationManager.success(data.message);
                    window.localStorage.setItem('apitoken', data.token);
                    window.localStorage.setItem('username', data.username.charAt(0).toUpperCase() + data.username.slice(1));
                    this.props.history.push('/');
                } else if(data.type == "error"){
                    NotificationManager.error(data.message);
                }
            }.bind(this)).catch(function(err) {
                alert(err)
            }.bind(this));
        }

    }
    onSignup() {
        if(this.state.username.length == 0 || this.state.password.length == 0 || this.state.email.length == 0 || this.state.confirm.length == 0 || this.state.password != this.state.confirm) {
            let formErrors =  {username: '', password: '', email: '', confirm: ''};
            let usernameValid = this.state.username.length == 0 ? false : true;
            let passwordValid = this.state.password.length == 0 ? false : true;
            let emailValid = this.state.email.length == 0 ? false : true;
            let confirmValid = this.state.confirm.length == 0 ? false : true;
            if(this.state.username.length == 0) {
                formErrors.username = 'Username should not be empty!';
            }
            if (this.state.password.length == 0) {
                formErrors.password = 'Password should not be empty!'
            }
            if(this.state.email.length == 0) {
                formErrors.email = 'Email should not be empty!';
            }
            if (this.state.confirm.length == 0) {
                formErrors.confirm = 'Password should not be empty!'
            }
            if(this.state.password != this.state.confirm) {
                formErrors.confirm = 'Password mismatch!';
            }
            this.setState({
                  formErrors: formErrors,
                  usernameValid: usernameValid,
                  passwordValid: passwordValid,
                  emailValid: emailValid,
                  confirmValid: confirmValid
            });
        } else {
            const url = '/api/signup';
            var payload = {
                "username": this.state.username,
                "email": this.state.email,
                "password": this.state.password,
            };
            fetch(url,
            {
                method: "POST",
                body: JSON.stringify( payload ),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then((resp) => resp.json())
            .then(function(data) {
                if(data.type == "success") {
                    NotificationManager.success('Signed Up Successfully');
                    this.props.history.push('/signin');
                } else if(data.type == "warning") {
                    NotificationManager.warning('User Already Exist');
                }
            }.bind(this)).catch(function(err) {
                debugger;
                alert(err)
            }.bind(this));
        }

    }
    handleChange (event) {
        this.setState({
          [event.target.id]: event.target.value
        });
    }
    onEnterPress (e) {
      if(e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault();
        if(window.location.pathname == "/signin") {
            this.onSignin();
        } else if(window.location.pathname == "/signup") {
            this.onSignup();
        }

      }
    }
    render () {
        return(
            <div>
                <div className="signincontainer">
                    {window.location.pathname == "/signin" &&(
                      <div>
                        <h2 className="form-header">Login</h2>
                        <div className="c-12 form-group">
                            <h4 className="label">Email</h4>
                            <input type="text" id="email" name="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress} />
                            {this.state.emailValid  == false ? <h4 className="warning-label">{this.state.formErrors.email}</h4> :  null}
                        </div>
                        <div className="c-12 form-group">
                            <h4 className="label">Password</h4>
                            <input type="password" id="password"
                            name="password" value={this.state.password}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress}/>
                            {this.state.passwordValid == false ? <h4 className="warning-label">{this.state.formErrors.password}</h4> :  null}
                        </div>
                        <div className="c-12 form-group m-t-20">
                            <input type="submit" className="button" value="Signin" onClick={this.onSignin} />

                        </div>
                      </div>
                    )}
                    {window.location.pathname == "/signup" && (
                      <div>
                        <h2 className="form-header">Signup</h2>
                        <div className="c-12 form-group">
                            <h4 className="label">Username</h4>
                            <input type="text" id="username" name="username" value={this.state.username}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress}/>
                            {this.state.usernameValid == false ? <h4 className="warning-label">{this.state.formErrors.username}</h4> :  null}
                        </div>
                        <div className="c-12 form-group">
                            <h4 className="label">Email</h4>
                            <input type="text" id="email" name="email" value={this.state.email}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress}/>
                            {this.state.emailValid == false ? <h4 className="warning-label">{this.state.formErrors.email}</h4> :  null}
                        </div>
                        <div className="c-12 form-group">
                            <h4 className="label">Password</h4>
                            <input type="password" id="password"
                            name="password" value={this.state.password}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress}/>
                            {this.state.passwordValid == false ? <h4 className="warning-label">{this.state.formErrors.password}</h4> :  null}
                        </div>
                        <div className="c-12 form-group">
                            <h4 className="label">Confirm</h4>
                            <input type="password" id="confirm"
                            name="confirm" value={this.state.confirm}
                            onChange={this.handleChange}
                            onKeyDown={this.onEnterPress}/>
                            {this.state.confirmValid == false ? <h4 className="warning-label">{this.state.formErrors.confirm}</h4> :  null}
                        </div>
                        <div className="c-12 form-group m-t-20">
                            <input type="submit" className="button" value="Signup" onClick={this.onSignup} />
                        </div>
                      </div>
                    )}
                </div>
            </div>
        )
    }
}
export default Signin;
