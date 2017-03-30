import React from 'react';
import $ from 'jquery';
window.jQuery = $;
import _ from 'lodash';
import Notification from 'react-notification-system';
import Query from '../query';
import Fn from '../lib/functions';
import {riques, hasRole, errorCallback} from '../../utils';
import { default as swal } from 'sweetalert2';
import Config from '../../config';
import {Table, SearchBox, DeleteButtons} from '../lib/Table';

const Pages = React.createClass({
  getInitialState: function(){
    require ('./Pages.css');

    return {
      dt: null,
      monthList: [],
      deleteMode: false,
      statusList: ["All", "Published", "Draft", "Pending Review", "Deleted"],
      dynamicStateBtnList: ["deleteBtn", "recoverBtn", "deletePermanentBtn"],
      activeStatus: "All",
      itemSelected: false
    }
  },
  loadData: function(type, callback) {
    var me = this;
    var qry = Query.getPageListQry(type);
    
    riques(qry, 
      function(error, response, body) {
        if (body.data) {
          var monthList = ["all"];
          var _dataArr = [];
          _.forEach(body.data.viewer.allPosts.edges, function(item){
            var dt = new Date(item.node.createdAt);

            _dataArr.push({
              "postId": item.node.id,
              "title": item.node.title,
              "slug": item.node.slug?item.node.slug:"",
              "author": item.node.author?item.node.author.username:"",
              "status": item.node.status?item.node.status:"",
              "comments": item.node.comments.edges.length,
              "published": dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate()
            })

            var sMonth = dt.getFullYear() + "/" + (dt.getMonth() + 1);
            if (monthList.indexOf(sMonth)<0) monthList.push(sMonth);
          });

          var bEdit = hasRole('modify-page');
          me.table.loadData(_dataArr, bEdit);
          me.setState({monthList: monthList});
          
          if (callback) callback.call();
        } else {
          errorCallback(error, body.errors?body.errors[0].message:null);
        }
      }
    );
  },
  disableForm: function(state){
    var me = this;
    _.forEach(document.getElementsByTagName('input'), function(el){ el.disabled = state;})
    _.forEach(document.getElementsByTagName('button'), function(el){ 
      if (_.indexOf(me.state.dynamicStateBtnList, el.id) < 0)
        el.disabled = state;
    })
    _.forEach(document.getElementsByTagName('select'), function(el){ el.disabled = state;})
    this.notif.addNotification({message: 'Processing...', level: 'warning',position: 'tr'});
    if (!state) {
      this.checkDynamicButtonState();
    }
  },
  checkDynamicButtonState: function(){
    var checkedRow = $("input.pageListCb:checked");
    this.setState({itemSelected: checkedRow.length>0})
  },
  handleDeleteBtn: function(event){
    var me = this;
    var checkedRow = $("input.pageListCb:checked");
    var idList =checkedRow.map(function(index, item){ return item.id.split("-")[1]});
    swal(_.merge({
      title: 'Sure want to delete?',
      text: "You might lost some data!",
      type: 'warning',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    },Config.defaultSwalStyling)).then(function () {
      me.disableForm(true);
      riques(Query.deletePostQry(idList), 
        function(error, response, body) {
          if (!error && !body.errors && response.statusCode === 200) {
            var here = me;
            var cb = function(){here.disableForm(false)}
            me.loadData("All", cb);
          } else {
            errorCallback(error, body.errors?body.errors[0].message:null);
            me.disableForm(false);
          }
        }
      );
    })},
  handleDeletePermanent: function(event){
    var checkedRow = $("input.pageListCb:checked");
    var me = this;
    var idList =checkedRow.map(function(index, item){ return item.id.split("-")[1]});
    swal(_.merge({
      title: 'Sure want to delete permanently?',
      text: "You might lost some data forever!",
      type: 'warning',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    },Config.defaultSwalStyling)).then(function () {
      me.disableForm(true);
      riques(Query.deletePostPermanentQry(idList), 
        function(error, response, body) {
          if (!error && !body.errors && response.statusCode === 200) {
            var here = me;
            var cb = function(){here.disableForm(false)}
            me.loadData("Deleted", cb);
          } else {
            errorCallback(error, body.errors?body.errors[0].message:null);
            me.disableForm(false);
          }
        }
      );
    })
  },
  handleEmptyTrash: function(event){
    var checkedRow = $("input.pageListCb");
    var me = this;
    var idList =checkedRow.map(function(index, item){ return item.id.split("-")[1]});
    swal(_.merge({
      title: 'Sure want to empty trash?',
      text: "You might lost some data forever!",
      type: 'warning',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    }, Config.defaultSwalStyling)).then(function () {
      me.disableForm(true);
      riques(Query.deletePostPermanentQry(idList), 
        function(error, response, body) {
          if (!error && !body.errors && response.statusCode === 200) {
            var here = me;
            var cb = function(){here.disableForm(false)}
            me.loadData("Deleted", cb);
          } else {
            errorCallback(error, body.errors?body.errors[0].message:null);
            me.disableForm(false);
          }
        }
      );
    })
  },
  handleRecover: function(event){
    var checkedRow = $("input.pageListCb:checked");
    var me = this;
    var idList =checkedRow.map(function(index, item){ return item.id.split("-")[1]});
    swal(_.merge({
      title: 'Sure want to recover?',
      text: "Please look carefully!",
      type: 'warning',
      confirmButtonText: 'Yes, recover it!',
      cancelButtonText: 'No, cancel!',
    },Config.defaultSwalStyling)).then(function () {
      me.disableForm(true);
      riques(Query.recoverPostQry(idList), 
        function(error, response, body) {
          if (!error && !body.errors && response.statusCode === 200) {
            console.log(JSON.stringify(body, null, 2));
            var here = me;
            var cb = function(){here.disableForm(false)}
            me.loadData("Deleted", cb);
          } else {
            errorCallback(error, body.errors?body.errors[0].message:null);
            me.disableForm(false);
          }
        }
      );
    })},
  handleAddNewBtn: function(event) {
    this.props.handleNav('pages','new');
  },
  handleStatusFilter: function(event){
    this.disableForm(true);
    var status = event.target.text;
    this.setState({activeStatus: status});
    if (status==='Deleted'){
      var me = this;
      this.loadData("Deleted", function(){
        me.setState({deleteMode: true});
        me.disableForm(false);
      });
    }else{
      var re = this;
      this.loadData(status, function(){
        re.setState({deleteMode: false});
        re.disableForm(false);
      })
    } ;
  },
  handleDateFilter: function(event){
    this.disableForm(true);
    var status = this.state.activeStatus;
    if (status==='Deleted'){
      var me = this;
      this.loadData("Deleted", function(){
        me.setState({deleteMode: true});
        me.disableForm(false);
      });
    }else{
      var date = $("#dateFilter").val();
      var searchValue = { 6: date };
      var te = this;
      this.loadData(status, function(){
        te.setState({deleteMode: false});
        te.state.dt.columns([6]).every( function () {
          this.search( searchValue[this.index()] ).draw();
          return null;
        })
        te.disableForm(false);
      })
    } ;
  },
  handleViewPage: function(postId){
    this.props.handleNav('pages','edit', postId);
  },
  onAfterTableLoad: function(){
    var me = this;
    $(".titleText").click(function(event){
      event.preventDefault();
      var postId = this.id.split("-")[1];
      me.handleViewPage(postId);
    });
  },
  componentDidMount: function(){
    this.notif = this.refs.notificationSystem;
    this.table = this.refs.rendactTable;
    var datatable = this.table.datatable;
    this.refs.rendactSearchBox.bindToTable(datatable);
    this.setState({dt: datatable});
    this.loadData("All");
  },
  render: function(){
    return (
      <div className="content-wrapper">
        <div className="container-fluid">
          <section className="content-header" style={{marginBottom:20}}>
            <h1>
              Page List
              { hasRole('modify-page') &&
              (<small style={{marginLeft: 5}}>
                <button className="btn btn-default btn-primary add-new-post-btn" onClick={this.handleAddNewBtn}>Add new</button>
              </small>)
              }
            </h1>
            <ol className="breadcrumb">
              <li><a href="#"><i className="fa fa-dashboard"></i> Home</a></li>
              <li className="active">Page List</li>
            </ol>
          </section>
          <Notification ref="notificationSystem" /> 
          <section className="content">
            <div className="box box-default">
              <div className="box-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-xs-12">
                      <div style={{marginTop: 10, marginBottom: 20}}>
                          <select className="btn select" id="dateFilter" onChange={this.handleDateFilter} style={{marginRight:10,height:35}}>
                            {this.state.monthList.map(function(item){
                              if (item==="all")
                                return (<option key="0" value="">Show all months</option>);
                              var s = item.split("/");
                              var monthList = Fn.getMonthList();
                              var month = monthList[parseInt(s[1],10)-1];
                              var year = s[0];
                              return <option key={item} value={item}>{month+" "+year}</option>
                            })}
                          </select>      
                          <DeleteButtons 
                            deleteMode={this.state.deleteMode}
                            itemSelected={this.state.itemSelected}
                            onDelete={this.handleDeleteBtn}
                            onRecover={this.handleRecover}
                            onDeletePermanent={this.handleDeletePermanent}
                            onEmptyTrash={this.handleEmptyTrash}
                          />
                        <div className="box-tools pull-right">
                          <SearchBox datatable={this.table} ref="rendactSearchBox"/>
                        </div>
                        <div className="box-tools" style={{marginTop: 10}}>
                          <b>Status:</b> {this.state.statusList.map(function(item, index, array){
                            var last = (index===(array.length-1));
                            var border = last?"":"1px solid";
                            var color = item===this.state.activeStatus?{color: "black", fontWeight: "bold"}:{};
                            return <span key={index} style={{paddingRight: 7, paddingLeft: 7, borderRight: border}}>
                                    <a href="#" onClick={this.handleStatusFilter} style={color}>{item}</a>
                                   </span>
                          }.bind(this))}
                        </div>
                      </div>
                      <Table 
                        id="pageList"
                        columns={[
                          {id: 'title', label: "Title", width: 400, type: "link", target: "", cssClass:"titleText"},
                          {id: 'slug', label: "Slug", textAlign:"center"},
                          {id: 'author', label: "Author", textAlign:"center"},
                          {id: 'status', label: "Status", textAlign:"center"},
                          {id: 'comments', label: "Comments", width: 30, textAlign:"center"},
                          {id: 'published', label: "Published", textAlign:"center"}
                        ]}
                        checkBoxAtFirstColumn="true"
                        ref="rendactTable"
                        onSelectAll={this.checkDynamicButtonState}
                        onCheckBoxClick={this.checkDynamicButtonState}
                        onAfterLoad={this.onAfterTableLoad}
                      />
                  </div>
                </div>
              </div>
             </div>
            </div>
          </section>
        </div>
      </div>
    )},
});

export default Pages;