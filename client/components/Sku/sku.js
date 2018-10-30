import React, { Component } from 'react';
import cx from 'classnames';
import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import './sku.scss';
//functional component for rendering homepage
class SKU extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'skudata': [],
      'searchparams': {
        'sku': '',
        'location': '',
        'department': '',
        'category': '',
        'subcategory': ''
      },
      'filter':'',
      'pagesize': 10,
      'refresh': false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.getSKUData = this.getSKUData.bind(this);
    this.filterData = this.filterData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.addData = this.addData.bind(this);
    this.genRestUrl = this.genRestUrl.bind(this);
  }
  componentDidMount() {
    this.getSKUData();
  }
  handleChange (event) {
    var searchobj = {}; searchobj[event.target.id] =  event.target.value;
    this.setState(prevState => ({
        searchparams: {
            ...prevState.searchparams,
            ...searchobj
        }
    }))
  }
  genRestUrl(obj) {
    Object.keys(obj).forEach(function(key){
      if (obj[key] == '' || obj[key] == undefined) {
          NotificationManager.error("Insufficient Data");
          return;
      }
    })
    return `api/items/location/${obj.location}/department/${obj.department}/category/${obj.category}/subcategory/${obj.subcategory}/sku/${obj.sku}`;
  }
  addData () {
    var url = this.genRestUrl(this.state.searchparams);
    debugger;
    axios.post(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem('apitoken')
      }
    })
    .then(function (data) {
      this.setState({'refresh': false});
      if(data.data.type == "success") {
        NotificationManager.success("Row Added Successfully");
        this.getSKUData ();
      } else {
        NotificationManager.error("Error in  Adding row");
      }
    }.bind(this))
    .catch(function (error) {
      this.setState({'refresh': false});
      NotificationManager.error("Error in  Adding row");
      console.log(error);
    }.bind(this));
  }
  deleteData(id) {
    var _delobj = {};
    this.setState({'refresh': true});
    for (var i = 0; i < this.state.skudata.length; i++) {
      if(this.state.skudata[i]._id == id) {
        _delobj = this.state.skudata[i];
        break;
      }
    }
    var url = this.genRestUrl(_delobj);
    axios.delete(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem('apitoken')
      }
    })
    .then(function (data) {
      this.setState({'refresh': false});
      if(data.data.type == "success") {
        NotificationManager.success("Row Deleted Successfully");
        this.getSKUData ();
      } else {
        NotificationManager.error("Error in  Deletion of row");
      }
    }.bind(this))
    .catch(function (error) {
      this.setState({'refresh': false});
      NotificationManager.error("Error in  Deletion of row");
      console.log(error);
    }.bind(this));
  }
  filterData (filterval) {
    this.setState(prevState => ({
        filter: this.state.filter == filterval ? '-' + filterval : filterval
    }))
    this.getSKUData();
  }
  getSKUData () {
    this.setState({'refresh': true})
    var payload = {
        "search": this.state.searchparams,
        "filter": this.state.filter,
        'pagesize': this.state.pagesize
    };
    // axios({ method: 'POST', url: 'you http api here', headers: {autorizacion: localStorage.token}, data: { user: 'name' } })
    axios.get('api/items', {
      params: payload,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem('apitoken')
      }
    })
    .then(function (data) {
      this.setState({'refresh': false});
      this.setState({"skudata": data.data});
    }.bind(this))
    .catch(function (error) {
      this.setState({'refresh': false});
      console.log(error);
    }.bind(this));
  }

  render () {
    var deleteData = this.deleteData;
    return (
      <div>
        <div className="searchform">
          <div className="formgroup">
            <label>Name</label>
            <input type="text" value={this.state.searchparams.name} id="sku" onChange={this.handleChange}/>
          </div>
          <div className="formgroup">
            <label>Location</label>
            <input type="text" value={this.state.searchparams.location} id="location" onChange={this.handleChange}/>
          </div>
          <div className="formgroup">
            <label>Department</label>
            <input type="text" value={this.state.searchparams.department} id="department" onChange={this.handleChange}/>
          </div>
          <div className="formgroup">
            <label>Category</label>
            <input type="text" value={this.state.searchparams.category} id="category" onChange={this.handleChange}/>
          </div>
          <div className="formgroup">
            <label>Subcateogry</label>
            <input type="text"value={this.state.searchparams.subcategory} id="subcategory" onChange={this.handleChange}/>
          </div>
          <div className="formgroup">
            <button className="btn primary md" onClick={this.getSKUData}>Search</button>
          </div>
          <div className="formgroup">
            <button className="btn primary md" onClick={this.addData}>Add</button>
          </div>
        </div>
        <div className="grid">
          <div className="table-header">
            <table>
              <thead>
                <tr>
                  <th onClick={() => this.filterData('sku')}>Name<i className={cx('fas ', {"fa-exchange-alt": this.state.filter != 'sku' && this.state.filter != '-sku' ,"fa-sort-amount-down": this.state.filter == 'sku', "fa-sort-amount-up":this.state.filter == '-sku'})}></i></th>
                  <th onClick={() => this.filterData('location')}>Location <i className={cx('fas ', {"fa-exchange-alt": this.state.filter != 'location' && this.state.filter != '-location' ,"fa-sort-amount-down": this.state.filter == 'location', "fa-sort-amount-up":this.state.filter == '-location'})}></i></th>
                  <th onClick={() => this.filterData('department')}>Department <i className={cx('fas ', {"fa-exchange-alt": this.state.filter != 'department' && this.state.filter != '-department' ,"fa-sort-amount-down": this.state.filter == 'department', "fa-sort-amount-up":this.state.filter == '-department'})}></i></th>
                  <th onClick={() => this.filterData('category')}>Category <i className={cx('fas ', {"fa-exchange-alt": this.state.filter != 'category' && this.state.filter != '-category' ,"fa-sort-amount-down": this.state.filter == 'category', "fa-sort-amount-up":this.state.filter == '-category'})} ></i></th>
                  <th onClick={() => this.filterData('subcategory')}>Subcategory <i className={cx('fas ', {"fa-exchange-alt": this.state.filter != 'subcategory' && this.state.filter != '-subcategory' ,"fa-sort-amount-down": this.state.filter == 'subcategory', "fa-sort-amount-up":this.state.filter == '-subcategory'})}></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-content">
            {this.state.refresh &&(
              <div className="refresh">
                <i className="fas fa-sync fa-spin"></i>
              </div>
            )}
            <table>
              <tbody>
              {this.state.skudata.map(function(item, index){
                return (
                  <tr key={ item._id }>
                    <td><div>{item.sku}</div></td>
                    <td><div>{item.location}</div></td>
                    <td><div>{item.department}</div></td>
                    <td><div>{item.category}</div></td>
                    <td><div>{item.subcategory}</div></td>
                    <td onClick={() => deleteData(item._id)}>
                      <div className="actions">
                        <i className="far fa-trash-alt"></i>
                      </div>
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default SKU;
