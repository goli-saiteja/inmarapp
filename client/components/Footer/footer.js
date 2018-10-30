import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './footer.scss';
//Class Component for Footer
class Footer extends Component {
    render () {
        return(
            <footer>
                <div className="footer-content">© 2018 All rights reserved.</div>
            </footer>
        )
    }
}
export default Footer;
