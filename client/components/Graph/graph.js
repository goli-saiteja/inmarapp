import React from 'react';
import { Tree, treeUtil } from 'react-d3-tree';
import axios from 'axios';
import {NotificationManager} from 'react-notifications';
var myTreeData = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        children: [
          {name: 'sai'},
          {name: 'teja'}
        ]

      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: undefined,};

  }
  componentWillMount() {
    axios.post('api/gettreedata', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem('apitoken')
      }
    })
    .then(function (data) {
      var newdata = data.data.children;
      this.setState({ data: newdata })
      //this.render();
    }.bind(this))
    .catch(function (error) {
      console.log(error);
    }.bind(this));
  }
  render() {
    return (
      <div id="treeWrapper" style={{width: '100em', height: '100em'}}>
      {this.state.data &&(
        <Tree data={this.state.data} />
      )}
      </div>
    );
  }
}
export default Graph;
