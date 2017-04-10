import React from 'react';
import _ from 'lodash';
import { default as swal } from 'sweetalert2';
import TimezonePicker from 'react-bootstrap-timezone-picker';
import Notification from 'react-notification-system';

import Query from '../query';
import Config from '../../config'
import {riques, getValue, setValue, errorCallback, getFormData, disableForm} from '../../utils';

const Field = React.createClass({
	render: function(){
		return (
			<div className="form-inline" >
				<input type="text" value={this.props.name} className="form-control" disabled/> 
				<input type="text" value={this.props.type} className="form-control" disabled/> 
				<input type="button" value="Remove" data={this.props.name} 
					className="form-control btn" onClick={this.props.onDelete} disabled={!this.props.deletable}/> 
			</div>
		)
	}
});

var Settings = React.createClass({
	defaultFields: [
		{id:"title", label: "Title", type: "link", deletable: false},
		{id:"slug", label: "Slug", type: "text", deletable: false}
	],
	getInitialState: function(){
		var p = JSON.parse(localStorage.getItem("profile"));
		var dateOfBirth = "";
		if (p.dateOfBirth && p.dateOfBirth!=="") 
			dateOfBirth = new Date(p.dateOfBirth)

		return {
			mode: this.props.postId?"update":"create",
			fields: this.defaultFields
		}
	},
	loadData: function(){
		if (!this.props.postId) return;
		var me = this;
		var qry = Query.getContentQry(this.props.postId);
		riques(qry, 
			function(error, response, body){
				if(!error && !body.errors) {
					var data = body.data.getContent; 
					setValue("name", data.name);
					setValue("slug", data.slug);
					me.setState({fields: data.fields})
				} else {
					errorCallback(error, body.errors?body.errors[0].message:null);
				}
			}
		);
	},
	disableForm: function(state){
    disableForm(state, this.notification);
  },
	handleSubmitBtn: function(event){
		event.preventDefault();
		var me = this;
		var _objData = {
			name: getValue('name'),
			slug: getValue('slug'),
			fields: this.state.fields
		};
		this.disableForm(true);

		var qry = Query.createContentMtn(_objData);
		
		riques(qry, 
			function(error, response, body){
				if(!error && !body.errors) {
					me.disableForm(false);
					me.resetForm();
				} else {
					errorCallback(error, body.errors?body.errors[0].message:null);
				}
			}
		);
	}, 
	handleAddField: function(event){
		event.preventDefault();
		var fields = this.state.fields;
		var name = getValue("field-name");
		var type = getValue("field-type");
		var width = getValue("field-width");
		var align = getValue("field-align");

		if (!name) {
			swal('Invalid value', "Field name can't be  empty!",'error')
			return;
		}
		if (!type){
			swal('Invalid value', "Field type can't be  empty!",'error');
			return;
		}

		fields.push(
			{
				id: name.toLowerCase(), 
				label: name, 
				type: type?type:"text", 
				width: width?width:400, 
				align:align?align:"left"
			});
		this.setState({fields: fields})
	},
	handleFieldDelete: function(event){
		event.preventDefault();
		var name = event.target.getAttribute("data");
		var fields = this.state.fields;
		
		var record = _.find(fields, {label: name});
		_.pull(fields, record);
		this.setState({fields: fields});
	},
	handleAddNewBtn: function(event) {
    this.resetForm();
  },
	resetForm: function(){
		document.getElementById("contentForm").reset();
		window.history.pushState("", "", '/admin/content/new');
		this.setState({mode: "create", fields: this.defaultFields})
	},
	componentDidMount: function(){
		this.notification = this.refs.notificationSystem;
		this.loadData();
	},
	render: function(){
		return (
			<div className="content-wrapper">
				<div className="container-fluid">
				<section className="content-header">
			      <h1>{this.state.mode==="update"?"Edit Content Type":"Add New Content Type"}
              { this.state.mode==="update" &&
                <small style={{marginLeft: 5}}>
                  <button className="btn btn-default btn-primary add-new-post-btn" onClick={this.handleAddNewBtn}>Add new</button>
                </small>
              }
            </h1>
			      <ol className="breadcrumb">
			        <li><a href="#"><i className="fa fa-dashboard"></i> Home</a></li>
			        <li className="active">Content Type</li>
			      </ol>
			      <div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10}}></div>
			    </section>
			    <Notification ref="notificationSystem" />

			    <section className="content">
			    	<div className="row">
					  	<div className="col-md-8">
					  	<section className="content">
			    			<form onSubmit={this.handleSubmitBtn} id="contentForm" className="form-horizontal">
			    			
					  		<div className="form-group">
								 	<label htmlFor="name" className="col-md-3">Name</label>
								 	<div className="col-md-9">
										<input type="text" name="name" id="name" className="form-control rdt-input-form" required/>
									</div>
								</div>

								<div className="form-group">
								 	<label htmlFor="slug" className="col-md-3">Slug</label>
							  	<div className="col-md-9">
										<input type="text" name="slug" id="slug" className="form-control rdt-input-form" required/>
									</div>
								</div>

								<div className="form-group">
								 	<label htmlFor="fields" className="col-md-3">Fields</label>
							  	<div className="col-md-9">
							  		<div className="form-inline" >
											<input type="text" id="field-name" placeholder="Field name" className="form-control"/> 
											<select id="field-type" className="form-control select">
												<option value="text">String</option>
												<option value="text">Number</option>
												<option value="date">Date</option>
												<option value="link">Link</option>
												<option value="image">Image</option>
											</select> 
											<input type="text" id="field-width" placeholder="Width" className="form-control"/> 
											<select id="field-align" className="form-control select">
												<option value="left">Left</option>
												<option value="right">Right</option>
												<option value="center">Center</option>
											</select> 
											<input type="button" value="Add" className="form-control btn" onClick={this.handleAddField}/> 
										</div>
										<h4>Current fields</h4>
										{
											this.state.fields.map(function(item){
												return <Field 
																name={item.label} 
																type={item.type} 
																onDelete={this.handleFieldDelete}
																deletable={item.deletable==false?false:true}
																/>
											}.bind(this))
										}
									</div>
								</div>
								
								<div className="form-group">
										<div className="col-md-9">
											<div className="btn-group">
												<input type="submit" value={this.state.mode==="update"?"Update":"Add"} className="btn btn-primary btn-sm" />
											</div>
										</div>
									</div>
							</form>
						</section>
					</div>
				</div>
			 </section>
			</div>
		</div>
		)
	}
});

export default Settings;