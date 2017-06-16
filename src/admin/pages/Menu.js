import React from 'react';
import Query from '../query';
import _ from 'lodash';
import Notification from 'react-notification-system';
import {swalert, riques, errorCallback, setValue, getValue, disableForm} from '../../utils';

var Menu = React.createClass({
  getInitialState: function(){
      require ('../pages/Posts.css');

      return {
        name:"",
        selectedMenuName:"",
        newMenuName:"",
        postId:"",
        tagId:"",
        dt: null,
        errorMsg: null,
        loadingMsg: null,
        deleteMode: false,activeStatus: "All",
        pageList: null,
        allPageList: null,
        allPostList: null,
        categoryList: null,
        coba: null,
      }
  },
  handleMenu: function(event){
    this.setState({menu: document.querySelector('#menuSelect').value});
    var postId = event.target.value.split("-")[0];
	var selectedMenuName = event.target.value.split("-")[1];
	setValue("selectedMenuName", selectedMenuName); 
	this.setState({postId:postId});
  },
  disableForm: function(state){
    disableForm(state, this.notif)
  },
  addToMenu: function(event){
    var menuFiltered = _.filter(document.getElementsByName("itemsChecked[]"), function(item){
      		return item.checked
    	});
	var menuValues = [];
	_.map(menuFiltered, function(item){
	  menuValues.push((
		<div className="box box-default collapsed-box box-solid" 
		key={item.id} value={item.value} id={item.id} name="menuLoadedList[]">
		  <div className="box-header with-border">
			<h3 className="box-title">{item.value}</h3>
			  <div className="box-tools pull-right">
				<button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-plus"></i>
				</button>
			  </div>
			</div>
			<div className="box-body pad">
			  <div>
				Bismillah
			  </div>
			<div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
			  <div className="box-tools pull-right">
				<button className="btn btn-flat btn-default">Add to Menu</button>
			</div>
		  </div>
		</div>
	  ))
	})
    this.setState({storeMenu: menuValues});
    debugger;
  },
  resetForm: function(){
    document.getElementById("menu").reset();
    document.getElementById("menuName").reset();
    this.setState({newMenuName:""});
    this.setState({selectedMenuName:""});
    this.handleNameChange();
    this.handleNewChange();
    window.history.pushState("", "", '/admin/menu');
  },
  handleNewChange: function(event){
    var newMenuName = getValue("newMenuName");
    this.setState({newMenuName: newMenuName})
  },
  handleNameChange: function(event){
    var selectedMenuName = getValue("selectedMenuName");
    this.setState({selectedMenuName: selectedMenuName})
  },
  handleSubmit: function(event){
    event.preventDefault();
    var me = this;
    var newMenuName = getValue("newMenuName");
    this.disableForm(true);
    var qry = Query.createMenu(newMenuName);
    var noticeTxt = "Menu Saved";

    riques(qry, 
      function(error, response, body) { 
        if (!error && !body.errors && response.statusCode === 200) {
          me.notif.addNotification({
                  message: noticeTxt,
                  level: 'success',
                  position: 'tr',
                  autoDismiss: 2
          });
          me.resetForm();
          var here = me;
          var cb = function(){here.disableForm(false)}
          me.componentWillMount("All", cb);
        } else {
          errorCallback(error, body.errors?body.errors[0].message:null);
        }
        me.disableForm(false);
      });
  },
  componentDidMount: function(){
    this.notif = this.refs.notificationSystem;
  },
  handleSubmitChange: function(event){
    event.preventDefault();
    var me = this;
    var name = getValue("selectedMenuName");
    var postId = this.state.postId;
    this.disableForm(true);
    var qry = Query.updateMenu(postId, name);
    var noticeTxt = "Menu Updated";

    riques(qry, 
      function(error, response, body) { 
        if (!error && !body.errors && response.statusCode === 200) {
          me.notif.addNotification({
                  message: noticeTxt,
                  level: 'success',
                  position: 'tr',
                  autoDismiss: 2
          });
          var here = me;
          var cb = function(){here.disableForm(false)}
          me.componentWillMount("All", cb);
        } else {
          errorCallback(error, body.errors?body.errors[0].message:null);
        }
        me.disableForm(false);
      });
  },
  componentWillMount: function(){
    var me = this;
      riques(Query.getAllMenu, 
        function(error, response, body) {
          if (!error) {
            var pageList = [(<option key="0" value="">--select menu--</option>)];
            _.forEach(body.data.viewer.allMenus.edges, function(item){
              pageList.push((<option key={item.node.id} value={item.node.id+"-"+item.node.name}>{item.node.name}</option>));
            })
            me.setState({pageList: pageList});
          }
        }
      );
      riques(Query.getAllPage, 
        function(error, response, body) {
          if (!error) {
            var allPageList = [];
            _.forEach(body.data.viewer.allPosts.edges, function(item){
              allPageList.push((<div key={item.node.id}><input class="pageMenu" id={item.node.id}
              name="itemsChecked[]" type="checkbox" value={item.node.title} /> {item.node.title}</div>));
            })
            me.setState({allPageList: allPageList});
          }
        }
      );
      riques(Query.getAllPost, 
        function(error, response, body) {
          if (!error) {
            var allPostList = [];
            _.forEach(body.data.viewer.allPosts.edges, function(item){
              allPostList.push((<div key={item.node.id}><input id={item.node.id}
              name="itemsChecked[]" type="checkbox" value={item.node.title} /> {item.node.title}</div>));
            })
            me.setState({allPostList: allPostList});
          }
        }
      );
      riques(Query.getAllCategory, 
        function(error, response, body) {
          if (!error) {
            var categoryList = [];
            _.forEach(body.data.viewer.allCategories.edges, function(item){
              categoryList.push((<div key={item.node.id}><input id={item.node.id}
              name="itemsChecked[]" type="checkbox" value={item.node.name} /> {item.node.name}</div>));
            })
            me.setState({categoryList: categoryList});
          }
        }
      );
    },
  handleDelete: function(event){
    var me = this;
    var idList = this.state.postId;
    swalert('warning','Sure want to delete permanently?','You might lost some data forever!',
      function () {
      me.disableForm(true);
      riques(Query.deleteMenuQry(idList), 
        function(error, response, body) {
          if (!error && !body.errors && response.statusCode === 200) {
            me.resetForm();
	        var here = me;
	        var cb = function(){here.disableForm(false)}
	        me.componentWillMount("All", cb);
          } else {
            errorCallback(error, body.errors?body.errors[0].message:null);
          }
          me.disableForm(false);
        }
      );
  	})
  },
  
	render: function(){
		return (
			<div className="content-wrapper">
        	  <div className="container-fluid">
				<section className="content-header">
			      <h1>
            		Menus
          		  </h1>
          		  <ol className="breadcrumb">
            		<li><a href="#"><i className="fa fa-dashboard"></i>Home</a></li>
            		<li className="active">Menus</li>
          		  </ol>
          		  <div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
			    </section>
		        <Notification ref="notificationSystem" />     
			    	<div className="row">
				     	<div className="col-md-3">
				     	  <form onSubmit={this.handleSubmit} id="menu" method="get">
					     	  <div className="box box-default">
								<div className="box-header with-border attachment-block clearfix">
									<div className="form-group">
										<h4>Create A New Menu :</h4>
									</div>
									<div>
										<input type="text" name="newMenuName" id="newMenuName" className="form-control" onChange={this.handleNewChange}/>
									</div>
									<div className="pull-right" style={{marginTop: 10}}>
										<button type="submit" id="submit" disabled={this.state.newMenuName===""} className="btn btn-flat btn-success">Create Menu</button>
									</div>
								</div>
							  </div>
						  </form>
							<div className="box box-default collapsed-box box-solid">
								<div className="box-header with-border">
									<h3 className="box-title">Pages</h3>
									<div className="box-tools pull-right">
									    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-plus"></i>
									    </button>
									</div>
								</div>
								<div className="box-body pad">
									<div id="IDpageList">
								  		{this.state.allPageList}
								  	</div>
								  	<div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
								  	<div className="box-tools pull-right">
								  		<button className="btn btn-flat btn-default" type="button" onClick={this.addToMenu} 
                              			style={{marginRight: 10}} data-target="#IDpageList">Add to Menu</button>
								  	</div>
								</div>
							</div>
							<div className="box box-default collapsed-box box-solid">
								<div className="box-header with-border">
									<h3 className="box-title">Posts</h3>
									<div className="box-tools pull-right">
									    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-plus"></i>
									    </button>
									</div>
								</div>
								<div className="box-body pad">
									<div id="IDpostList">
								  		{this.state.allPostList}
								  	</div>
								  	<div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
								  	<div className="box-tools pull-right">
								  		<button className="btn btn-flat btn-default" type="button" onClick={this.addToMenu} 
                              			style={{marginRight: 10}} data-target="#IDpostList">Add to Menu</button>
								  	</div>
								</div>
							</div>
							<div className="box box-default collapsed-box box-solid">
								<div className="box-header with-border">
									<h3 className="box-title">Custom Links</h3>
									<div className="box-tools pull-right">
									    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-plus"></i>
									    </button>
									</div>
								</div>
								<div className="box-body pad">
									<div>
								  		.................
								  	</div>
								  	<div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
								  	<div className="box-tools pull-right">
								  		<button className="btn btn-flat btn-default">Add to Menu</button>
								  	</div>
								</div>
							</div>
							<div className="box box-default collapsed-box box-solid">
								<div className="box-header with-border">
									<h3 className="box-title">Categories</h3>
									<div className="box-tools pull-right">
									    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-plus"></i>
									    </button>
									</div>
								</div>
								<div className="box-body pad">
									<div id="IDcategorytList">
								  		{this.state.categoryList}
								  	</div>
								  	<div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10, marginBottom: 10}}></div>
								  	<div className="box-tools pull-right">
								  		<button className="btn btn-flat btn-default" type="button" onClick={this.addToMenu} 
                              			style={{marginRight: 10}} data-target="#IDcategorytList">Add to Menu</button>
								  	</div>
								</div>
							</div>
						</div>
		                <div className="col-md-9">
		                  <div className="box box-default">
				              <div className="box-header with-border attachment-block clearfix">
				                <div className="container-fluid">
				                  <div className="row">
				                    <div className="col-xs-12">
				                      <div className="row">
				                    	<div className="col-xs-3">
				                    		<h5><b>Select a menu to edit :</b></h5>
				                    	</div>
				                    	<div className="col-md-7">
										  <div className="form-group">
										    <select id="menuSelect" onClick={this.handleMenu} name="menuSelect" className="form-control btn select" >
											  {this.state.pageList}
											</select>
										  </div>
										</div>
				                  	  </div>
				                    </div>
				                  </div>
					    		</div>
					    	  </div>
					      </div>
					      <div className="box box-default">
							<div className="box-header with-border attachment-block clearfix">
								<form onSubmit={this.handleSubmitChange} id="menuName" method="get">
								  <div className="form-group">
									<div className="col-md-2">
										<h4>Menu Name :</h4>
									</div>
									  <div className="col-md-6">
										<input type="text" name="selectedMenuName" id="selectedMenuName" className="form-control" required="true" onChange={this.handleNameChange}/>
									  </div>
									<div className="col-md-4">
										<div className="box-tools pull-right">
										<button type="submit" id="submit" name="submit" className="btn btn-flat btn-primary" disabled={this.state.selectedMenuName===""}>Save Menu</button>
										</div>
									</div>
								  </div>
								</form>
							</div>
								<div class="box-body">
									<section className="content">
										<h4>Menu Structure</h4>
										<p>Drag each item into the order you prefer. Click the arrow on the right of the item to reveal additional configuration options.</p>
										<div className="row">
									        <div className="col-md-6">
									          
									              
								                        {this.state.storeMenu}
									            
									        </div>
									    </div>
									    <div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 5, marginBottom: 20}}></div>
										<h4>Menu Settings</h4>
										<div className="row">
											<div className="col-md-3">
												<i>Auto add pages</i>
											</div>
											<div className="col-md-9">
												<div className="checkbox">
								                    <label>
								                      <input type="checkbox"/>
								                      Automatically add new top-level pages to this menu
								                    </label>
								                </div>
											</div>
										</div>
										<div className="row">
											<div className="col-md-3">
												<i>Display location</i>
											</div>
											<div className="col-md-9">
												<div className="checkbox">
								                    <label>
								                      <input type="checkbox"/>
								                      Top Menu
								                    </label>
								                </div>
								                <div className="checkbox">
								                    <label>
								                      <input type="checkbox"/>
								                      Social Links Menu
								                    </label>
								                </div>
											</div>
										</div>
									</section>
								</div>
							<div className="box-header with-border attachment-block clearfix">
								<div className="form-group">
									<div className="col-md-6">
										<button className="btn btn-flat btn-danger" id="deleteBtn" onClick={this.handleDelete}>Delete Menu</button>
									</div>
									<div className="col-md-6">
									  <div className="box-tools pull-right">
										<button className="btn btn-flat btn-primary">Save Menu</button>
									  </div>
									</div>
								</div>
							</div>
						  </div>
		                </div>
		            </div>
          	  </div>
		    </div>
		)
	}
});

export default Menu;