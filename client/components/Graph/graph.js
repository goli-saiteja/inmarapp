import React from 'react';
import { Tree, treeUtil } from 'react-d3-tree';
import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import './graph.scss';

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: undefined, zoom: true, translate:{x:500, y:200}};
  }
  componentWillMount() {

    axios.get('api/gettreedata', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem('apitoken')
      }
    })
    .then(function (data) {
      var newdata = data.data.children;
      this.setState({ data: newdata })
      this.render();
    }.bind(this))
    .catch(function (error) {
      console.log(error);
    }.bind(this));
  }
  componentDidMount() {
    var treeele = document.getElementById('treeWrapper');
    // debugger;treeele.offsetHeight
    this.setState({ translate: {x: treeele.offsetHeight/2, y: treeele.offsetWidth/2}})
    this.render();
  }
  render() {
    return (
      <div id="treeWrapper" style={{width: '100em', height: '50em'}}  >
      {this.state.data &&(
        <Tree data={this.state.data} translate={{x:100, y:400}} initialDepth={2}  scaleExtent={{min: 0.1, max: 0.5}}/>
      )}
      </div>
    );
  }
}
export default Graph;
