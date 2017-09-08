import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import Query from '../query';
import {riques, disableForm, errorCallback, 
        getConfig, defaultHalogenStyle, getFormData} from '../../utils';
import {getTemplates} from '../../includes/theme';
import DatePicker from 'react-bootstrap-date-picker';
import Notification from 'react-notification-system';
import Halogen from 'halogen';
import { default as swal } from 'sweetalert2';
import ReactSelect from 'react-select';
import 'react-select/dist/react-select.css';
import {connect} from 'react-redux';
import {maskArea, setSlug, togglePermalinkProcessState, setPostStatus, resetPostEditor,
        setCategoryList, setTagList, setImageGalleryList, setConnectionValue, 
        toggleSaveImmediatelyMode, togglePermalinkEditingState,
        setPostContent, updateTitleTagLeftCharacter,
        updateMetaDescriptionLeftCharacter, setPostPublishDate, setFeaturedImage,
        setEditorMode, toggleImageGalleyBinded, setPageList, setAllCategoryList, setPostId,
        setOptions, setTagMap, loadFormData} from '../../actions'
import {reduxForm, Field, formValueSelector} from 'redux-form';
import {graphql, withApollo} from 'react-apollo';
import gql from 'graphql-tag';


class CkeditorField extends React.Component{

  componentWillReceiveProps(props){
    if (props.content !== this.props.content){
      if(window.CKEDITOR) window.CKEDITOR.instances['content'].setData(props.content);
    }

  }

  componentDidMount(){
    let me = this;
    $.getScript("https://cdn.ckeditor.com/4.6.2/standard/ckeditor.js", function(data, status, xhr){
      window.CKEDITOR.replace('content', {
        height: 400,
        title: false
      });
      for (var i in window.CKEDITOR.instances) {
        if (window.CKEDITOR.instances.hasOwnProperty(i))
          window.CKEDITOR.instances[i].on('change', me.props.handleContentChange);
      }
    });
  }
  render(){
    return <Field id="content" name="content" rows="25" component="textarea" wrap="hard" type="textarea" className="form-control" />
  }
}

let ImageGalleryWidget = (props) => (
<div className="box box-info" style={{marginTop:20}}>
  <div className="box-header with-border">
    <h3 className="box-title">Image Gallery</h3>         
    <div className="pull-right box-tools">
      <button type="button" className="btn btn-box-tool" data-widget="collapse" title="Collapse">
      <i className="fa fa-minus"></i></button>
    </div>
  </div>
  <div className="box-body pad">
    <div>
      <input type="file" id="imageGallery" name="imageGallery" onChange={props.imageGalleryChange}/>
      {
        _.map(props.imageGallery, function(item, index){
          return <div key={index} >
            {item.value && <div className="margin" style={{width: 150, float: "left", position: "relative"}}>
          <a href="" onClick={props.handleImageClick}><img src={item.value} className="margin" style={{width: 150, height: 150, borderWidth: "medium", borderStyle: "solid", borderColor: "cadetblue", opacity: item.id === "customid" || item.toDelete ? 0.5 : 1}} alt={"gallery"+index}/></a>
          <button id={item.id+"-"+index} onClick={props.handleImageRemove} type="button" className="btn btn-info btn-sm" disabled={item.id==="customid" || item.toDelete} style={{top: 15, right: 5, position: "absolute"}}><i className="fa fa-times"></i></button>
          </div>}
          {item.message ? <p style={{color:'red', clear: 'left', position: 'absolute'}}>{item.message.toString()}</p> : null}
          </div>
        })
      }
    </div>                  
  </div>
</div>
)


let FeaturedImageWidget = (props) => (
<div className="box box-info" style={{marginTop:20}}>
  <div className="box-header with-border">
    <h3 className="box-title">Featured Image</h3>         
    <div className="pull-right box-tools">
      <button type="button" className="btn btn-box-tool" data-widget="collapse" title="Collapse">
      <i className="fa fa-minus"></i></button>
    </div>
  </div>
  <div className="box-body pad">
    <div>
      { props.featuredImage &&
        <div style={{position: "relative"}}>
          <Field id="featuredImage" name="featuredImage" component="img" src={props.featuredImage} style={{width: "100%"}} alt={props.title} />
          {/*<img src={props.featuredImage} style={{width: "100%"}} alt={props.title}/> */}
          <button onClick={props.onClick} type="button" className="btn btn-info btn-sm" style={{top: 15, right: 5, position: "absolute"}}><i className="fa fa-times"></i></button>
        </div>
      }
      { !props.featuredImage &&
        <input type="file" name="featuredImage" onChange={props.onChange}/>
      }
    </div>                  
  </div>
</div>
)


let TagWidget = (props) => (
<div className="box box-info" style={{marginTop:20}}>
  <div className="box-header with-border">
    <h3 className="box-title">Tags</h3>         
    <div className="pull-right box-tools">
      <button type="button" className="btn btn-box-tool" data-widget="collapse" title="Collapse">
      <i className="fa fa-minus"></i></button>
    </div>
  </div>
  <div className="box-body pad">
    <div className="form-group" style={{width: '100%'}}>
        <ReactSelect.Creatable
          id="tag"
          name="form-field-name"
          value={props.postTagList}
          options={props.options}
          onChange={props.onChange}
          multi={true}
        />
        <p><span className="help-block">Press enter after inputting tag</span></p>
    </div>
  </div>
</div>
)

let PageHiererachyWidget = (props) => {
  let templates = getTemplates();
  return <div className="box box-info" style={{marginTop:20}}>
    <div className="box-header with-border">
      <h3 className="box-title">Page Attributes</h3>         
      <div className="pull-right box-tools">
        <button type="button" className="btn btn-box-tool" data-widget="collapse" title="Collapse">
        <i className="fa fa-minus"></i></button>
      </div>
    </div>
    <div className="box-body pad">
      <div>
      <div className="form-group">
        <p><b>Parent</b></p>
        <Field id="parent" name="parent" component="select" disabled={props.isLoading} style={{widht: 250}}>
          {props.pageList}
        </Field>
      </div>
      <div className="form-group">
        <p><b>Page  Template</b></p>
        <Field name="pageTemplate" component="select" className="metaField" style={{width: 250}} defaultValue={templates?templates[0].item:null}>
        { templates ?
          templates.map(function(item, index){
            return (<option key={item.id}>{item.name}</option>)
          }) : ""
        }
        </Field>
      </div>
      <div className="form-group">
        <p><b>Order</b></p>
        <input type="text" id="pageOrder" placeholder="0" style={{width:50}} min="0" step="1" data-bind="value:pageOrder"/>
      </div>
      </div>                  
    </div>
  </div>
}

const allPageListQry = gql`
query 
getPages{viewer {allPosts(where: {type: {eq: "page"}}) { edges { node { 
     id,title,slug,author{username},status,comments{edges{node{id}}},createdAt}}}}}
`

PageHiererachyWidget = graphql(allPageListQry, {
  props: ({ownProps, data}) => {
    if (data.loading) {
      return {isLoading: true, pageList: [(<option key="0" value="">(no parent)</option>)]}
    } else if (data.error) {
      return {hasError: true, error: data.error}
    } else {
      var pageList = [(<option key="0" value="">(no parent)</option>)];
      _.forEach(data.viewer.allPosts.edges, function(item){
        pageList.push((<option key={item.node.id} value={item.node.id} checked={ownProps.parent===item.node.id}>
          {item.node.title}</option>));
      });
      return {isLoading: false, pageList: pageList}
    }
  }
})(PageHiererachyWidget)

let CategoryWidget = (props) => (
    <div className="box box-info" style={{marginTop:20}}>
      <div className="box-header with-border">
          <h3 className="box-title">Category</h3>         
          <div className="pull-right box-tools">
            <button type="button" className="btn btn-box-tool" data-widget="collapse" title="Collapse">
              <i className="fa fa-minus"></i></button>
            </div>
          </div>
          <div className="box-body pad">
            <div>
            <div className="form-group">
              {props.isLoading ?
                <Halogen.PulseLoader color="#4DAF7C"/>                  
                  :
                _.map(props.allCategoryList, (cat, index) => {
                  return <div key={index}> 
                    <Field name={"categories." + cat.id} component="input" type="checkbox"/>
                    {cat.name}
                  </div>
                })
              }
            </div>
          </div>                  
        </div>
      </div>
)

let categoryQuery = gql`
query getCategories ($type: String!){
    viewer {
      allCategories (where: {type: {eq: $type}}) {
        edges {
          node {
            id,
            name,
            description,
            post {
              edges {
                node{
                  id
                }
              }
            }
          }
        }
      }
    }
}
`

CategoryWidget = graphql(categoryQuery,
  { 
    options: props => ({
      variables: {
        type: props.postType
      },
    }),
      props: ({ownProps, data}) => {
        if (data.loading){
          return {isLoading: true}
        } else if (data.error){
          return {hasError: true, error: data.error}
        } else {
          let allCategoryList = _.map(data.viewer.allCategories.edges, item => item.node)
          return {
            isLoading: false,
            allCategoryList: allCategoryList
          }
        }
      }
  }
)(CategoryWidget)

const PermalinkEditor = (props) => {
  return (
    <div className="form-inline">
      { !props.permalinkEditing ? 
        ( <p>Permalink: &nbsp;
          {props.mode==="update"?(
            <a id="permalink" href={props.rootUrl+'/'+props.permalink}>{props.rootUrl}/{props.permalink}</a>
            ) : (
            <a id="permalink" href="#">{props.rootUrl}/{props.permalink}</a>
            )
          }
          <button type="button" onClick={() => {props.dispatch(togglePermalinkEditingState(true))}} id="editBtn" className="btn btn-default" style={{height:25, marginLeft: 5, padding: "2px 5px"}}>
            <span style={{fontSize: 12}}>Edit</span>
          </button> 
          { props.permalinkInProcess && <i style={{marginLeft:5}} className="fa fa-spin fa-refresh"></i>}
          </p>
        ) : (
          <p>Permalink: 
          <div className="form-group" id="permalinkcontent">
            <a id="permalink" href="#">{props.rootUrl}/</a>
            <input id="slugcontent" defaultValue={props.permalink} type="text" className="form-control" />
            <button type="button" className="btn btn-default" onClick={()=>{props.onCheckSlug(props.permalink)}}>OK</button>
          </div>
          { props.permalinkInProcess && <i style={{marginLeft:5}} className="fa fa-spin fa-refresh"></i>}
          </p>
        )
      }
    </div>
  )
}

let NewContentTypeNoPostId = React.createClass({
  propTypes: {
    urlParams: React.PropTypes.object,
    isProcessing: React.PropTypes.bool.isRequired,
    opacity: React.PropTypes.number.isRequired,
    errorMsg: React.PropTypes.string,
    loadingMsg: React.PropTypes.string,
    title: React.PropTypes.string,
    permalink: React.PropTypes.string,
    content: React.PropTypes.string,
    category: React.PropTypes.string,
    summary: React.PropTypes.string,
    status: React.PropTypes.string,
    immediately: React.PropTypes.string,
    immediatelyStatus: React.PropTypes.bool,
    visibilityTxt: React.PropTypes.string,
    permalinkEditing: React.PropTypes.bool,
    mode: React.PropTypes.string,
    pageList: React.PropTypes.array,
    allCategoryList: React.PropTypes.array,
    postCategoryList: React.PropTypes.array,
    postTagListInit: React.PropTypes.array,
    postTagList: React.PropTypes.array,
    titleTagLeftCharacter: React.PropTypes.number,
    metaDescriptionLeftCharacter: React.PropTypes.number,
    publishDate: React.PropTypes.instanceOf(Date),
    publishDateReset: React.PropTypes.instanceOf(Date),
    titleTag: React.PropTypes.string,
    metaKeyword: React.PropTypes.string,
    metaDescription: React.PropTypes.string,
    permalinkInProcess: React.PropTypes.bool,
    featuredImage: React.PropTypes.string,
    imageGallery: React.PropTypes.array,
    tagMap: React.PropTypes.object,
    connectionValue: React.PropTypes.object,
    data: React.PropTypes.object,
    parent: React.PropTypes.string,
  },
  getDefaultProps: function() {
    return {
      urlParams: {},
      isProcessing: false,
      opacity: 1,
      title: "",
      content: "",
      status:"Published",
      immediatelyStatus:true,
      visibilityTxt:"Public",
      permalinkEditing: false,
      mode: "create",
      postCategoryList: [],
      postTagListInit: [],
      postTagList: [],
      titleTagLeftCharacter: 65,
      metaDescriptionLeftCharacter: 160,
      publishDate: new Date(),
      publishDateReset: new Date(),
      permalinkInProcess: false,
      imageGallery: [],
      tagMap: {},
      connectionValue: {},
      data: {},
      parent: "",
    }
  },
  isWidgetActive: function(name){
    return _.indexOf(this.props.widgets, name) > -1;
  },
  checkSlug: function(permalink){
    var me = this;
    if (permalink===this.props.permalink) return;
    this.props.dispatch(togglePermalinkProcessState(true));
    this.props.client.query({
      query: gql`${Query.checkSlugQry(permalink).query}`,
    }).then(data => {
      let slugCount = data.data.viewer.allPosts.edges.length;
      if (slugCount > 0) me.props.dispatch(setSlug(permalink+"-"+slugCount, false));
      else me.props.dispatch(setSlug(permalink, false));
      this.props.dispatch(togglePermalinkProcessState(false));
    }).catch(({error}) => errorCallback(error, error, "Check Slug"))
      
  },
  saveImmediately: function(event){
    var hours = this.props.hours;
    var minute = this.props.minutes;
    var time = this.props.publishDate + hours + minute;
    this.props.dispatch(toggleSaveImmediatelyMode(false, time));
  },

  disableForm: function(isFormDisabled){
    disableForm(isFormDisabled, this.notification);
    this.props.dispatch(maskArea(isFormDisabled));
  },

  componentWillReceiveProps: function(props){
    console.log(props)
    if (props.data !== this.props.data){
      props.initialize(props.initialValues)
      props.dispatch(setImageGalleryList(props.imageGallery))
      props.dispatch(setTagList(props.postTagList, props.postTagList))
      props.dispatch(setPostStatus(props.data.status))
      
      props.titleTag && props.dispatch(updateTitleTagLeftCharacter(65-(props.titleTag.length)));
      props.metaDescription && props.dispatch(updateMetaDescriptionLeftCharacter(160-(props.metaDescription.length)));
    } else if (this.props.loading && !props.loading){
      this.disableForm(false)
    }
    if (!this.props.permalink && props.permalinkFromDb){
      props.dispatch(setSlug(props.permalinkFromDb, false))
    }

  /*
  if (props.urlParams.postId !== this.props.postId){
      props.dispatch(setPostId(props.urlParams.postId))
      props.destroy()
      console.log("hello")
    }*/
    if(!props.postId && this.props.postId){
      props.dispatch(resetPostEditor());
      props.destroy()
    }
},
  resetForm: function(){
    this.props.handleNav(this.props.slug, "new")
    this.props.dispatch(setPostId(""))
    $(".menu-item").removeClass("active");
    $("#menu-posts-new").addClass("active");
  },
  getMetaFormValues: function(v){
    var out = getFormData("metaField");

    _.forEach(this.props.connectionValue, function(item, key){
      out.push({
        item: "conn~"+key,
        value: item.value
      });
    });

    return out;
  },
  setFormValues: function(v){
    let metaValues = {};
    let meta = [];
    // dont delete this function first
    // still confuse with this behaviour

    // set additional field values to state
    var _connectionValue = this.props.connectionValue;
    _.forEach(meta, function(item){
      metaValues[item.item] = item.value;
      var el = document.getElementsByName(item.item);
      if (el && el.length>0) {
        el[0].id = item.id
      }
      var isConnItem = item.item.split("~");
      if (isConnItem.length > 1) {
        _connectionValue[isConnItem[1]] = item.value; 
      }
    });
  },
  formatDate: function(date){
    var min = date.getMinutes();
    if (min.length<2) min = "0"+min;
    return date.getDate()+"/"+(1+date.getMonth())+"/"+date.getFullYear()+" "+date.getHours()+":"+min;
  },
  notifyUnsavedData: function(state){
    if (this.props.handleUnsavedData){
      this.props.handleUnsavedData(state)
    }
  },
  handleTitleChange: function(event){
    this.notifyUnsavedData(true);
  },

  handleContentChange: function(event){
    var content = window.CKEDITOR.instances['content'].getData();
    //  this.props.dispatch(setPostContent(content));
    this.props.change('content', content)
    this.notifyUnsavedData(true);
  },

  handleTitleTagChange: function(event){
    var titleTag = event.currentTarget.value;
    this.props.dispatch(updateTitleTagLeftCharacter(65-(titleTag.length)));
    this.notifyUnsavedData(true);
  },
  handleMetaDescriptionChange: function(event){
    var metaDescription = event.currentTarget.value;
    this.props.dispatch(updateMetaDescriptionLeftCharacter(160-(metaDescription.length)));
    this.notifyUnsavedData(true);
  },
  handleDateChange: function(date){
    this.props.dispatch(setPostPublishDate(new Date(date), false));
    this.notifyUnsavedData(true);
  },
  handleTimeChange: function(event){
    var hours = this.props.hours;
    var minutes = this.props.minutes;
    var d = this.props.publishDate;
    d.setHours(parseInt(hours, 10));
    d.setMinutes(parseInt(minutes, 10));
    this.props.dispatch(setPostPublishDate(d, false));
    this.notifyUnsavedData(true);
  },
  handlePublishDateCancel: function(event){
    var resetDate = this.props.publishDateReset;
    this.props.dispatch(setPostPublishDate(resetDate, false));
  },
  featuredImageChange: function(e){
    var me = this;
    var reader = new FileReader();
    reader.onload = function(){
      me.props.dispatch(setFeaturedImage(reader.result));
      me.props.change("featuredImage", reader.result)
    };
    reader.readAsDataURL(e.target.files[0]);
  },
  _emulateDataForSaving: function(v){
    var output = {};
    var fields = ["id","title","type","content","order","deleteData",
    "featuredImage","slug","status","publishDate","passwordPage","parent","summary","visibility","authorId"];
    _.forEach(fields, function(item){
      if (v[item]) output[item] = v[item];
    });
    
    output["type"] = this.props.postType;
    output["authorId"] = localStorage.getItem('userId');
    output["slug"] = this.props.permalink;
    return output;
  },
  onSubmit: function(v, status) {
    if (status) {
      this.props.dispatch(setPostStatus(status))
      v.status = status
    }
    var me = this;
    if (v.status === "Published" || v.status === "Draft" || v.status === "Reviewing") {
      if (v.title === null || v.title.length<=3) {
        this._errorNotif('Title is too short');
        return;
      }
    }

    if (v.metaDescription && v.metaDescription.length > 160){
      this._errorNotif('Meta Description is too long...!!')
      return;
    }
    var _objData = this._emulateDataForSaving(v);
    var qry = "", noticeTxt = "";
    let mutate;
    if (this.props.mode==="create"){
      qry = this.props.createQuery(_objData);
      noticeTxt = this.props.name+' Published!';
      mutate = this.props.createPostQuery

    }else{
      _objData["id"] = this.props.urlParams.postId;
      qry = this.props.updateQuery(_objData);
      noticeTxt = this.props.name+' Updated!';
      mutate = this.props.updatePostQuery
    }
    var metaDataList = me.getMetaFormValues();
    this.disableForm(true)

    mutate({
      variables: {
        input: _objData
      },
    }).then(data => {
      let postId ;
      
      if (me.props.mode==="create"){
        postId = data.data.createPost.changedPost.id;
      } else {
        postId = data.data.updatePost.changedPost.id;
      }

      // prosess metadata

      const processMetadata = () => {

        if (metaDataList.length > 0) {
          return this.props.client.mutate({
            mutation: gql`${Query.createUpdatePostMetaMtn(postId, metaDataList).query}`
          })
        }
      }

      const processCategory = () => {
        if (me.isWidgetActive("category")) {
          // process categories
          let categToSave = []

          _.forEach(_.keys(v.categories), key => {
            if (v.categories[key]) categToSave.push(key)
          })

          //let currentCat = _.keys(me.props.postCategoryList)
          let currentCat = me.props.postCategoryList

          var catQry = Query.createUpdateCategoryOfPostMtn(postId, currentCat, categToSave);
          if (catQry) return this.props.client.mutate({
            mutation: gql`${catQry.query}`,
            variables: catQry.variables
          })
        }
      }

      const processTag = () => {

        if (me.isWidgetActive("tag")) {
          let tagMap = {}
          _.forEach(me.props.options, function(item){
              tagMap[item.name] = {id: item.id, name: item.name}
          })
          var tagQry = Query.createUpdateTagOfPostMtn(postId, me.props.postTagListInit, me.props.postTagList, tagMap);

          if (tagQry)
            return this.props.client.mutate({
              mutation: gql`${tagQry.query}`,
              variables: tagQry.variables
            })
        } 
      }

      let promise = _.reduce([processMetadata, processCategory, processTag], (prev, task) => {
        return prev.then(() =>  task()).catch(error => errorCallback(error, error, error))
      }, Promise.resolve())

      promise.then(() => {
        this.disableForm(false)
        this._successNotif(noticeTxt)
        this.notifyUnsavedData(false)
        this.props.handleNav(me.props.slug, "edit", postId)
        this.bindPostToImageGallery(postId)
        this.props.postRefetch()
      })
    })

  },
  _errorNotif: function(msg){
    this.refs.notificationSystem.addNotification({
      title: 'Error',
      message: msg,
      level: 'error',
      position: 'tr'
    });
  },
  _successNotif: function(msg){
    this.refs.notificationSystem.addNotification({
      message: msg,
      level: 'success',
      position: 'tr',
      autoDismiss: 2
    });
  },
  imageGalleryChange: function(e){
    var me = this;
    var reader = new FileReader();
    reader.onload = function(){
      if (!me.props.postId) me.props.dispatch(toggleImageGalleyBinded(true));
      me.props.addImageGallery({
        variables: {
          input: {
            type: "gallery",
            value: reader.result,
            postId: me.props.urlParams.postId,
            blobFieldName: "myBlobField"
          }
        },
        optimisticResponse: {
          __typename: 'Mutation',
          createFile: {
            __typename: 'CreateFilePayload',
            changedFile: {
              __typename: 'File',
              type: "gallery",
              value: reader.result,
              postId: me.props.urlParams.postId,
              blobFieldName: 'myBlobField',
              id: "customid",
              blobMimeType: "image/jpeg",
              blobUrl: ""
            }
          }
        },
        update: (store, data) => {
          let image = data.data.createFile.changedFile

        
          let imageGallery = _.cloneDeep(me.props.imageGallery);
          if (imageGallery.length){
            if (imageGallery[0].value === image.value){
              imageGallery.splice(0, 1, {id: image.id, value: image.value})
            } else {
              imageGallery.splice(0, 0, {id: image.id, value: image.value})
            }
          } else {
            imageGallery = []
            imageGallery.push({id: image.id, value: image.value})
          }
          me.props.dispatch(setImageGalleryList(imageGallery));
        }
      }).then(data => {
        console.log("addImageGallery mutation result", data)
        document.getElementById("imageGallery").value=null;
      }).catch(error => {
        let imageGallery = _.cloneDeep(me.props.imageGallery);

        imageGallery = _.map(imageGallery, item => {
          if (item.id === "customid"){
            item.value = ''
            item.message = error
          }
          return item
        });

        me.props.dispatch(setImageGalleryList(imageGallery));
      });
    }
    reader.readAsDataURL(e.target.files[0]);
  },
  handleImageClick: function(e){
    e.preventDefault();
    
    swal({
      imageUrl: e.target.src,
      imageWidth: "100%",
      animation: true,
      customClass: 'imageSwal',
      confirmButtonText: 'Close'
    })
  },

  bindPostToImageGallery: function(postId){
    var me = this;
    if (this.props.imageGallery.length>0 && this.props.imageGalleryUnbinded) {
      var qry = Query.bindImageGallery(this.props.imageGallery, postId);

      this.props.client.mutate({
        mutation: gql`${qry.query}`,
        variables: qry.variables,
      }).then((data) => {
        this.props.dispatch(toggleImageGalleyBinded(false))
      })
    }
  },

  handleImageRemove: function(e){
    var me = this;
    var id = e.currentTarget.id;
    var index = id.split("-")[1];
    var imageId = id.split("-")[0];

    this.props.removeImageGallery({
      variables: {
        input : {
          id: imageId
        }
      },
      optimisticResponse: {
        deleteFile: {
          changedFile: {
            id: imageId,
            type: "",
            value: "",
            blobMimeType: "",
            blobUrl: "",
            __typename: ""
          },
          __typename: ""
        }
      },
        update: (store, data) => {
          let image = data.data.deleteFile.changedFile

        
          let imageGallery = _.cloneDeep(me.props.imageGallery);
          if (imageGallery.length){
            if (!image.value){
              imageGallery = _.map(imageGallery, item => {
                if (item.id === image.id) {
                  item.toDelete = true
                }
                return item
              })
            } else {
              imageGallery = _.filter(imageGallery, item => item.id !== imageId)
            }
          }
          me.props.dispatch(setImageGalleryList(imageGallery));
        }
    }).then(data => {
      console.log("remove mutation returned data ", data)
      document.getElementById("imageGallery").value=null
      //this.props.postRefetch()
    }).catch(error => {
      console.log(error)
      let imageGallery = _.cloneDeep(me.props.imageGallery);
      imageGallery = _.map(imageGallery, item => {
        if (item.id === imageId) {
          item.toDelete = false
          item.message = error
        }
        return item
      })
      me.props.dispatch(setImageGalleryList(imageGallery));
    })
  },
  _genReactSelect: function(contentId){
    var me = this;
    var getConnectionOptions = function(input, callback) {
      me.props.client.query({
        query: gql`${Query.getContentPostListQry("All", contentId).query}`}).then(data => {
          let options = _.forEach(data.data.viewer.allPosts.edges, item => ({value: item.node.slug, label: item.node.title}));
          callback(data.error, {
            options: options,
            complete: true
          })
        })
    }

    var handleSelectConnectionChange = function(newValue) {
      var _connectionValue = me.props.connectionValue;
      _connectionValue[contentId] = newValue
      me.props.dispatch(setConnectionValue(_connectionValue));
    }

    return (
      <ReactSelect.Async
        name={contentId}
        value={this.props.connectionValue[contentId]}
        loadOptions={getConnectionOptions}
        onChange={handleSelectConnectionChange}
        connectedContent={contentId}
      />
    )
  },
  componentWillMount: function(){
    this.disableForm(true)
  },
 
  componentDidMount: function(){
    var me = this;


    if (this.props.visibilityTxt==="Public") 
      document.getElementById("public").setAttribute('checked', true);
    else
      document.getElementById("private").setAttribute('checked', true);

            me.disableForm(false);
    this.notification = this.refs.notificationSystem;
  },
  render: function(){
    var rootUrl = getConfig('rootUrl');
    var templates = getTemplates();
    
    const newPost=(
      <div className="content-wrapper">
        <div className="container-fluid">
          <section className="content-header"  style={{marginBottom:20}}>
              <h1>{this.props.mode==="update"?"Edit Current "+this.props.name:"Add New "+this.props.name}
                { this.props.mode==="update" &&
                <small style={{marginLeft: 5}}>
                  <button className="btn btn-default btn-primary add-new-post-btn" onClick={()=>{this.resetForm()}}>Add new</button>
                </small>
              }
              </h1>
                <ol className="breadcrumb">
                  <li><a href="#"><i className="fa fa-dashboard"></i> Home</a></li>
                  <li><a href="#" onClick={function(){this.props.handleNav(this.props.slug)}.bind(this)}>
                    {this.props.name}</a></li>
                  <li className="active">{this.props.mode==="update"?"Edit "+this.props.name:"Add New"}</li>
                </ol>
               <div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10}}></div>
          </section>
          <Notification ref="notificationSystem" />

          <form  id="postForm" method="get" style={{opacity: this.props.opacity}}>
          { this.props.isProcessing &&
          <div style={defaultHalogenStyle}><Halogen.PulseLoader color="#4DAF7C"/></div>                   
          }
          <div className="col-md-8">
            <div className="form-group"  style={{marginBottom:30}}>
              <div>
                <Field name="title" component="input" type="text" className="form-control"
                  placeholder="Input Title Here" onChange={this.handleTitleChange} onBlur={(e) => {this.checkSlug(e.currentTarget.value.split(" ").join("-").toLowerCase())}} style={{marginBottom: 20}}/>
                <PermalinkEditor rootUrl={rootUrl} onCheckSlug={this.checkSlug} {...this.props} />

                <CkeditorField 
                  handleContentChange={this.handleContentChange}
                  content={this.props.data.content}
                />

                <div id="trackingDiv"></div>
              </div>
            </div>
            
            <div className="box box-info" style={{marginTop:20}}>
              <div className="box-header with-border">
                <h3 className="box-title">Summary</h3>         
                <div className="pull-right box-tools">
                  <button type="button" className="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
                  <i className="fa fa-minus"></i></button>
                </div>
              </div>
              <div className="box-body pad">
              <Field id="summary" name="summary" rows="5" component="textarea" wrap="hard" style={{width: '100%'}} onChange={()=>{this.notifyUnsavedData(true)}} />
              </div>
            </div>

            <div className="box box-info" style={{marginTop:20}}>
              <div className="box-header with-border">
                <h3 className="box-title">SEO</h3>         
                <div className="pull-right box-tools">
                  <button type="button" className="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
                    <i className="fa fa-minus"></i></button>
                </div>
              </div>
              <div className="box-body pad">
                <div className="form-horizonral">
                  <div className="form-group">
                    <div className="col-md-4">Preview</div>
                    <div className="col-md-8">
                      <p><a href="#">{this.props.title===""?"No Title":this.props.title.substring(0,71)}</a></p>
                      <p>{this.props.content===""?"":this.props.content.substring(0,100).replace(/(<([^>]+)>)/ig,"")}</p>
                      <p><span className="help-block"><a style={{color: 'green'}}>{rootUrl}/{this.props.permalink}</a> - <a>Cache</a> - <a>Similar</a></span></p>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="col-md-4"><p>Title Tag</p></div>
                    <div className="col-md-8">
                      <Field id={this.props.metaIds? this.props.metaIds.titleTag: null} name="titleTag" component="input" type="text" className="form-control metaField" 
                        style={{width: '100%'}} placeholder={this.props.title} onChange={this.handleTitleTagChange} />
                      <span className="help-block" style={{color: this.props.titleTagLeftCharacter < 0? '#f74747' : ''}}>Up to 65 characters recommended<br/>
                        {this.props.titleTagLeftCharacter} characters left</span>                     
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="col-md-4"><p>Meta Description</p></div>
                    <div className="col-md-8">
                      <Field id={this.props.metaIds ? this.props.metaIds.metaDescription: null} name="metaDescription" component="textarea" type="textarea" className="form-control metaField"                         rows='2' style={{width:'100%'}} placeholder={this.props.summary} onChange={this.handleMetaDescriptionChange} />
                      <span className="help-block" style={{color: this.props.metaDescriptionLeftCharacter < 0? '#f74747' : ''}}>160 characters maximum<br/>
                      {this.props.metaDescriptionLeftCharacter} characters left</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="col-md-4"><p>Meta Keywords</p></div>
                    <div className="col-md-8">
                      <div className="form-group">
                        <Field id={this.props.metaIds ? this.props.metaIds.metaKeyword: null} name="metaKeyword" component="input" type="text" className="form-control metaField" style={{width: '100%'}} />
                        <span className="help-block"><b>News keywords </b><a>(?)</a></span>
                      </div>
                    </div>
                  </div>
                </div> 
                </div>
              </div> 
                                
            </div>

            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="row">
                <div className="col-md-12">  
                  <div className="box box-info">
                    <div className="box-header with-border">
                      <h3 className="box-title">Publish</h3>
                      <div className="pull-right box-tools">
                            <button type="button" data-widget="collapse" data-toggle="tooltip" title="Collapse" className="btn btn-box-tool ">
                              <i className="fa fa-minus"></i></button>
                          </div>         
                    </div>
                    <div className="box-body pad">
                      
                       <div className="form-group">
                          <p style={{fontSize: 14}}><span className="glyphicon glyphicon-pushpin" style={{marginRight:10}}></span>
                          Status: <b>{this.props.status} </b>
                          <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#statusOption"> Edit </button></p>
                          <div id="statusOption" className="collapse">
                            <div className="form-group">
                                <Field id="statusSelect" name="statusSelect" component="select" style={{marginRight: 10, height: 30}}>
                                  <option value="Published">Published</option>
                                  <option value="Reviewing">Reviewing</option>
                                </Field>
                                <button type="button" onClick={ ()=> this.props.dispatch(setPostStatus(this.props.statusSelect))} className="btn btn-flat btn-xs btn-primary" 
                                style={{marginRight: 10}} data-toggle="collapse" data-target="#statusOption">OK</button>
                                <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#statusOption">Cancel</button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <p style={{fontSize: 14}}><span className="glyphicon glyphicon-sunglasses" style={{marginRight:10}}></span>Visibility: <b>{this.props.data.visibility} </b>
                          <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#visibilityOption"> Edit </button></p>
                          <div id="visibilityOption" className="collapse">
                            <div className="radio">
                              <label>
                                <Field id="public" name="visibility" component="input" type="radio" value="Public" />
                                Public
                              </label>
                            </div>
                            <div className="radio">
                              <label>
                                <Field id="private" name="visibility" component="input" type="radio" value="Private" />
                                Private
                              </label>
                            </div>
                            <div className="form-inline" style={{marginTop: 10}}>
                              <button type="button" onClick={this.saveVisibility} className="btn btn-flat btn-xs btn-primary" 
                              style={{marginRight: 10}} data-toggle="collapse" data-target="#visibilityOption">OK</button>
                              <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#visibilityOption">Cancel</button>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <p><span className="glyphicon glyphicon-calendar" style={{marginRight: 10}}></span>{this.props.immediatelyStatus===true?
                            (<span>Publish <b>Immediately </b></span>):<span>Published at <b>{this.formatDate(this.props.publishDate)}</b> </span>} 
                          <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#scheduleOption"> Edit </button></p>

                          <div id="scheduleOption" className="collapse">
                            <div className="form-group">
                              <div className="row">
                                <div className="col-md-6">
                                  <DatePicker id="datepicker" style={{width: "100%", padddingRight: 0, textAlign: "center"}} value={this.props.publishDate.toISOString()} onChange={this.handleDateChange}/>
                                </div>
                                <div className="col-md-6">
                                  <Field name="hours" component="input" type="text" className="form-control" style={{width: 30, height: 34, textAlign: "center"}} defaultValue={new Date().getHours()} onChange={this.handleTimeChange} />
                                  <Field name="minutes" component="input" type="text" className="form-control" style={{width: 30, height: 34, textAlign: "center"}} defaultValue={new Date().getMinutes()} onChange={this.handleTimeChange} />
                                </div>
                              </div>
                              <div className="form-inline" style={{marginTop: 10}}>
                                <button type="button" id="immediatelyOkBtn" onClick={this.saveImmediately} className="btn btn-flat btn-xs btn-primary" 
                                style={{marginRight: 10}} data-toggle="collapse" data-target="#scheduleOption"> OK </button>
                                <button type="button" className="btn btn-flat btn-xs btn-default" data-toggle="collapse" data-target="#scheduleOption" onClick={this.handlePublishDateCancel}>Cancel</button>
                              </div>
                            </div>
                          </div>
                      </div> 
                    </div>
                    <div className="box-footer">
                      <div className="form-group pull-right">
                        <button type="button" className="btn btn-default btn-flat disabled" style={{marginRight: 5}}>Preview</button> 
                          <div className="btn-group">
                            <button type="submit" onClick={this.props.handleSubmit(v => this.onSubmit(v, this.props.status))} id="publishBtn" className="btn btn-primary btn-flat">{this.props.mode==="update"?"Save":"Publish"}</button>
                            <button type="button" className="btn btn-primary btn-flat dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                              <span className="caret"></span>
                              <span className="sr-only">Toggle Dropdown</span>
                            </button>
                            <ul className="dropdown-menu" role="menu">
                              <li><button onClick={this.props.handleSubmit(v => this.onSubmit(v, 'Draft'))} className="btn btn-default btn-flat">{this.props.status!=="Draft"?"Save As Draft":""}</button></li>
                            </ul>
                          </div>
                      </div>        
                    </div>
                  </div>

                  { this.isWidgetActive("pageHierarchy") &&
                      <PageHiererachyWidget parent={this.props.parent}/>
                  
                  }

                  { this.isWidgetActive("category") &&
                      <CategoryWidget postType={this.props.postType}/>
                  }

                  { this.isWidgetActive("tag") &&
                      <TagWidget 
                        postTagList={this.props.postTagList} 
                        options={this.props.options} 
                        onChange={(value)=>{this.props.dispatch(setTagList(this.props.postTagListInit, value))}}
                      />
                  }

                  { this.isWidgetActive("featuredImage") &&
                      <FeaturedImageWidget
                        title={this.props.title}
                        featuredImage={this.props.data.featuredImage}
                        onClick={()=>{this.props.dispatch(setFeaturedImage(null))}}
                        onChange={this.featuredImageChange}
                      />
                  
                  }

                  { this.isWidgetActive("imageGallery") &&
                      <ImageGalleryWidget
                        imageGallery={this.props.imageGallery}
                        handleImageClick={this.handleImageClick}
                        handleImageRemove={this.handleImageRemove}
                        imageGalleryChange={this.imageGalleryChange}
                      />
                  }

                  {
                    this.props.customFields && this.props.customFields.map(function(item){
                      var form;
                      if (item.type === "text" || item.type === "number")
                        form = (<input id={item.id} name={item.id} className="metaField" type="text" style={{width: '100%'}}/>)
                      if (item.type === "date")
                        form = (<DatePicker id={item.id} name={item.id} style={{width: "100%", padddingRight: 0, textAlign: "center"}} value={this.props.publishDate.toISOString()} onChange={this.handleDateChange}/>)
                      if (item.type === "connection") {
                        form = this._genReactSelect(item.connection)
                      }
                      return <div key={item.id} className="box box-info" style={{marginTop:20}}>
                        <div className="box-header with-border">
                          <h3 className="box-title">{item.label}</h3>         
                          <div className="pull-right box-tools">
                            <button type="button" className="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
                            <i className="fa fa-minus"></i></button>
                          </div>
                        </div>
                        <div className="box-body pad">
                          {form}
                        </div>
                      </div>
                    }.bind(this))
                  }

              </div>
            </div>
          </div>
          </form>
        
        </div>
      </div>
      )
  return newPost;

}
});

let selector = formValueSelector("newContentForm")

const mapStateToProps = function(state){
  console.log(state.form)
  let ctn = state.contentTypeNew
  let customProps = {
    titleTag : selector(state, 'titleTag'),
    metaDescription: selector(state, 'metaDescription'),
    metaKeyword: selector(state, 'metaKeyword')
  }
    


  return {
    ...ctn,
    ...state.maskArea,
    ...customProps
  }

}

NewContentTypeNoPostId = _.flow([
  connect(mapStateToProps),
  graphql(gql`${Query.getUpdatePostQry().query}`, {name: 'updatePostQuery'}),
  graphql(gql`${Query.getCreatePostQry().query}`, {name: 'createPostQuery'}),
  graphql(gql`${Query.addImageGallery().query}`, {name: 'addImageGallery'}),
  graphql(gql`${Query.removeImageGallery().query}`, {name: 'removeImageGallery'}),
  withApollo,
])(NewContentTypeNoPostId)


const getAllTagQry = gql`query getTags ($type: String!){
    viewer {
      allTags (where: {type: {eq: $type}}) {
        edges {
          node {
            id,
            name,
            post {
              edges {
                node{
                  id
                }
              }
            }
          }
        }
      }
    }
  }`

NewContentTypeNoPostId = graphql(getAllTagQry, {
  options: (props) => ({
    variables: {
      type: props.postType,
    }
  }),
  props: ({ownProps, data}) => {
    if (data.loading) {
      return {isLoading: true}
    } else if (data.error) {
      return {hasError: true, error: data.error}
    } else {
      let options = _.map(data.viewer.allTags.edges, item => (
        {id: item.node.id, value: item.node.name, label: item.node.name}
      ))

      return {
        isLoading: false,
        options: options
      }
    }
  }
})(NewContentTypeNoPostId)

NewContentTypeNoPostId = reduxForm({
  form: 'newContentForm'
})(NewContentTypeNoPostId)


const NewContentTypeWithPostId = graphql(Query.getPost, {
  options : (props) => ({
    variables: {
      id: props.urlParams.postId
    }
  }),
  props: ({ownProps, data}) => {
    if (data.loading){
      return {
        isLoading: true,
        data: {},
      }
    } else if (data.error) {
      return {
        isLoading: false,
        hasError: true,
        data: {},
      }
    } else {
      let initials = {};
      let v = data.getPost

      let fields = ["id","title","type","content","order","deleteData",
      "featuredImage","slug","status","publishDate","passwordPage","parent","summary","visibility","authorId"];
      _.forEach(fields, function(item){
        if (data.getPost) initials[item] = data.getPost[item];
      });

      // setting the meta values

      let metaIds = {}

      if (data.getPost.meta.edges.length) {
        _.forEach(data.getPost.meta.edges, meta => {
          metaIds[meta.node.item] = meta.node.id
          if(meta.node.value){
            initials[meta.node.item] = meta.node.value
          }
        })
      }

      // setting content
      var pubDate = data.getPost.publishDate? new Date(data.getPost.publishDate) : new Date();
      initials["hours"] = pubDate.getHours();
      initials["minutes"] = pubDate.getMinutes();
      initials["publishDate"] = pubDate;

      // setting category
      initials.categories = {};
      let postCategoryList = []
      if (data.getPost.category.edges.length>0) {
        _.forEach(data.getPost.category.edges, cat => {
          if (cat.node.category){
            initials.categories[cat.node.category.id] = true
            postCategoryList.push([cat.node.category.id, cat.node.id]);
          }
        })
      }

      // setting tag list
      var _postTagList = [];
      if (v.tag && v.tag.edges.length>0) {
        _.forEach(v.tag.edges, function(i){
          if (i.node.tag){
            _postTagList.push({
              id: i.node.tag.id,
              value: i.node.tag.name,
              name: i.node.tag.name,
              label: i.node.tag.name,
              connectionId: i.node.id
            });
          }
        });
      }

      // set gallery 
      var _imageGalleryList = [];    
      if (v.tag && v.file.edges.length>0) {
        _.forEach(v.file.edges, function(i){
          if (i.node.value){
            _imageGalleryList.push({id: i.node.id, value: i.node.value});
          }
        });
      }

      return {
        isLoading: false,
        data: data.getPost,
        initialValues: initials,
        postTagList : _postTagList,
        imageGallery: _imageGalleryList,
        mode: "update",
        permalinkFromDb: v.slug,
        postRefetch: data.refetch,
        publishDate: v.publishDate,
        immediatelyStatus: false,
        postCategoryList: postCategoryList,
        metaIds: metaIds
      }
    }
  }
})(NewContentTypeNoPostId)

let NewContentType = (props) => {
  if (!props.urlParams) {
    return <NewContentTypeNoPostId {...props} mode="create"/>
  }

  return <NewContentTypeWithPostId {...props}/>
}


export default NewContentType;
