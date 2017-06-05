import React from 'react';
import AdminConfig from '../admin/AdminConfig';
window.config = AdminConfig;
import NotFound from '../admin/NotFound';
import Query from '../admin/query';
import Config from '../config';

import {riques, errorCallback, toHTMLObject} from '../utils';
import 'jquery-ui/ui/core';
import 'bootstrap/dist/css/bootstrap.css';
import Loading from '../admin/Loading';
import {latestPosts} from './hooks';
import _ from 'lodash';

const InvalidTheme = React.createClass({
	componentDidMount: function(){
		require ('../../public/css/AdminLTE.css');
		require ('../../public/css/skins/_all-skins.css');	
		require ('font-awesome/css/font-awesome.css');
		require ('../../public/css/ionicons.min.css');
	},
	render: function() {
		return (
			<div className="content-wrapper" style={{minHeight: 1126}}>
			    <section className="content-header">
			      <h1>Error Page</h1>
			    </section>

			    <section className="content">
			      <div className="error-page">
			        <div className="error-content">
			          <h3><i className="fa fa-warning text-red"></i> Oops! Something went wrong.</h3>
			          <p>We will work on fixing that right away.</p>
			        </div>
			      </div>
			    </section>
			  </div>
		)
	}
});

function getTemplateComponent(type){
	var c = window.config.theme;
	
	if (c.name==null || c.path==null) {
		return InvalidTheme;
	}

	try {
		let Component = require('../theme/'+c.path+'/layouts/Home.js').default;
		if (type==="home") {
			// pass
		} else if (type==="blog") {
			Component = require('../theme/'+c.path+'/layouts/Blog.js').default;			
		} else if (type==="single") {
			Component = require('../theme/'+c.path+'/layouts/Single.js').default;			
		}

		return Component;
	} catch(e) {
		return InvalidTheme;
	}
}

const ThemeHome = React.createClass({
	getInitialState: function(){
		return {
			loadDone: false,
			isSlugExist: false,
			slug: this.props.location.pathname.replace("/",""),
			latestPosts: []
		}
	},
	componentWillMount: function(){
		var me = this;

		riques(Query.checkSlugQry(this.state.slug), 
			(error, response, body) => {
	      if (!error && !body.errors && response.statusCode === 200) {
	        var slugCount = body.data.viewer.allPosts.edges.length;
	        if (slugCount > 0) {
	        	me.setState({isSlugExist: true});
	        }
	      } else {
	        me.setState({errorMsg: "error when checking slug"});
	      }

	      riques(Query.getPostListQry("Full"), 
		      function(error, response, body) { 
		        if (!error && !body.errors && response.statusCode === 200) {
		          var _postArr = [];
		          _.forEach(body.data.viewer.allPosts.edges, function(item){
		            _postArr.push(item.node);
		          });
		          me.setState({latestPosts: _postArr});
		        } else {
		          errorCallback(error, body.errors?body.errors[0].message:null);
		        }
		        me.setState({loadDone: true});
		      }
		    );
	    }
		);
	},
	componentDidMount: function(){
		var c = window.config.theme;
		require ('bootstrap/dist/css/bootstrap.css');
		require('../theme/'+c.path+'/css/style.css');
		require('../theme/'+c.path+'/functions.js');
	},
	render: function() {
		if (!this.state.loadDone && this.state.slug) {
			return <Loading/>
		} else {
			if (this.state.slug){
				let Single = getTemplateComponent('single');
				if (this.state.isSlugExist)
					return <Single slug={this.state.slug}/>
				else 
					return <NotFound/>
			} else {
				let Home = getTemplateComponent('home');
				return <Home latestPosts={this.state.latestPosts}/>
			}
		}
	}
});

const ThemeBlog = React.createClass({
	componentDidMount: function(){
		var c = window.config.theme;
		require ('bootstrap/dist/css/bootstrap.css');
		require('../theme/'+c.path+'/css/style.css');
		require('../theme/'+c.path+'/functions.js');
	},
	render: function() {
		let Blog = getTemplateComponent('blog');
		return <Blog/>;
	}
});

const ThemeSingle = React.createClass({
	getInitialState: function(){
		return {
			loadDone: false,
			postData: false
		}
	},
	componentWillMount: function() {
		var me = this;
		riques(Query.getPostQry(this.props.params.postId), 
      function(error, response, body) { 
        if (!error && !body.errors && response.statusCode === 200) {
          var data = body.data.getPost;
          //data.content = toHTMLObject(data.content);
          me.setState({postData: data});
        } else {
          errorCallback(error, body.errors?body.errors[0].message:null);
        }
        me.setState({loadDone: true});
      }
    );
	},
	componentDidMount: function(){
		var c = window.config.theme;
		require ('bootstrap/dist/css/bootstrap.css');
		require('../theme/'+c.path+'/css/style.css');
		require('../theme/'+c.path+'/functions.js');
	},
	render: function() {
		if (!this.state.loadDone) {
			return <Loading/>
		} else {
			if (this.props.params.postId){
				let Single = getTemplateComponent('single');
				return <Single postId={this.props.params.postId} postData={this.state.postData}/>;
			} else if (this.params.postId){
				let Single = getTemplateComponent('single');
				return <Single postId={this.props.params.postId} postData={this.state.postData}/>;
			} else {
				return <NotFound/>
			}
		}
	}
});

const getTemplates = function(){
	var template = [{
			id: "default",
			name: "Default Template"
		}];
	//var c = window.config.theme;
	try {
		//let Component = require('../theme/'+c.path+'/layouts/Template.js').default;
		template = [{
			id: "default",
			name: "Default Template"
		}]
	} catch(e) {
		
	}
	return template;
}

module.exports = {
	ThemeHome: ThemeHome,
	ThemeSingle: ThemeSingle,
	ThemeBlog: ThemeBlog,
	getTemplates: getTemplates
}
