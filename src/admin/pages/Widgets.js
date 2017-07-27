import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import uuid from 'uuid';


const widgetMap = {
    'search': {
        title: 'Search',
        description: 'A simple search widget',
        type: 'search'
    },
    'recent-post': {
        title: 'Recent Post',
        description: 'Show your latest post with this widget',
        type: 'recent-post'
    },
    'custom-html': {
        title: 'Custom HTML',
        description: 'Create your own widget using html tags + css + javascript',
        type: 'custom-html'
    }
}


class BoxItemSidebar extends React.Component {

    constructor(props){
        super(props);
        this.handleRemoveButton = this.handleRemoveButton.bind(this);
    }

    handleRemoveButton(e){
        this.props.removeSingleWidget(this.props.uuid, this.props.widgetAreaId)
    }

    
   render() {
      return (<div className="box box-default collapsed-box box-solid" style={{borderRadius: 0}}>
<div className="box-header with-border">
    <h3 className="box-title">{this.props.widget.title}</h3>
    <div className="box-tools pull-right">
        <button type="button" className="btn btn-box-tool btn-info" data-widget="collapse" title="Expand to setting widget">
            <i className="fa fa-plus"></i>
        </button>
        <button type="button" className="btn btn-box-tool btn-danger"  onClick={this.handleRemoveButton} >
            <i className="fa fa-times"></i>
        </button>
    </div>
</div>
<div className="box-body" style={{display: "none"}}>
    <div className="form-group">
        <label htmlFor="title">Title</label>
        <input type="text" className="form-control"/>
    </div>
    <div className="form-group">
        <label htmlFor="title">Text</label>
        <textarea className="form-control" id="" name="" cols="30" rows="10"></textarea>
    </div>
    <button onClick={this.handleRemoveButton} className="btn btn-danger btn-xs">Remove</button>
    <button className="btn btn-success btn-xs pull-right">Save</button>
</div>
</div>
)
   }
}

class BoxItemAvailable extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            widgetAreaId: ''
        }

        this.handleWidgetAreaChange = this.handleWidgetAreaChange.bind(this);
        this.handleWidgetAreaSubmit = this.handleWidgetAreaSubmit.bind(this);
    }

    handleWidgetAreaChange(e){
        e.preventDefault();
        this.setState({widgetAreaId: e.currentTarget.value})
    }

    handleWidgetAreaSubmit(e){
        e.preventDefault();
        if (this.state.widgetAreaId === "" || this.state.widgetAreaId === "---widget area---"){
            return null
        }
        this.props.handleAddToWidgetArea(this.state.widgetAreaId, this.props.widget);
    }

    render(){

        var widget = this.props.widget;
    
        return <div className="box box-info box-solid">
        <div className="box-header with-border">
            <h3 className="box-title">{widget.title}</h3>
        </div>
        <div className="box-body">
            <p>{widget.description}</p>
        </div>
        <div className="box-footer text-center">
            <div className="input-group">
            <span className="input-group-btn">
                <button className="btn btn-default" onClick={this.handleWidgetAreaSubmit}>Add to</button>
            </span>
            <select onChange={this.handleWidgetAreaChange} className="form-control select">
            <option>---widget area---</option>
            <option value="sidebar-1">Sidebar 1</option>
            <option value="footer-1">Footer 1</option>
            </select>
            </div>
        </div>
    </div>
    }

}

class WidgetAreaContainer extends React.Component {
    constructor(props) {
        super(props);

        this.handleClearAll = this.handleClearAll.bind(this);
    }

    handleClearAll(e){
        e.preventDefault();
        this.props.clearAllWidget(this.props.id);
    }

    render(){

    return <div id={this.props.id} className="col-md-6">
                <div className="box box-default collapsed-box">
                    <div className="box-header with-border">
                        <h3 className="box-title">{this.props.title}</h3>
                        <div className="box-tools pull-right">
                            <button className="btn btn-box-tool btn-primary" data-widget="collapse">
                                <i className="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div className="box-body">
                        <ul id="dragablePanelList" className="widgets list-unstyled">
                        {_.map(this.props.sbWidgets, (widget, index) => (
                                                                <li key={index}>
                                                                        {widget}
                                                                </li>
                                                                ))}
                    </ul>
                    </div>
                    <div className="box-footer">
                        <button onClick={this.handleClearAll} className="btn btn-danger">Clear All</button>
                        <button className="btn btn-success pull-right">Save</button>
                    </div>
                </div>
            </div>
    }
}



class Widgets extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            sbWidgets : {
                'sidebar-1': [],
                'footer-1': [],
            }
        } 

        this.handleAddToWidgetArea = this.handleAddToWidgetArea.bind(this);
        this.handleClearAll = this.handleClearAll.bind(this);
        this.handleRemoveSingleWidget = this.handleRemoveSingleWidget.bind(this);
    }

    componentDidMount(){
        require ('../lib/jquery-sortable.js');
        require ('jquery-ui/themes/base/theme.css');
        require ('../../../public/css/AdminLTE.css');
        require ('../../../public/css/skins/_all-skins.css');
    var panelList = $('#sidebar-1 #dragablePanelList');
    panelList.sortable({
        group: 'sidebar-1',
        handle: '.box-header',
        onDragStart: function ($item, container, _super) {
          // Duplicate items of the no drop area
          if(!container.options.drop)
            $item.clone().insertAfter($item);
          _super($item, container);
        }
    });
    var panelListFooter = $('#footer-1 #dragablePanelList');
    panelListFooter.sortable({
        group: 'footer-1',
        handle: '.box-header',
        onDragStart: function ($item, container, _super) {
          // Duplicate items of the no drop area
          if(!container.options.drop)
            $item.clone().insertAfter($item);
          _super($item, container);
        }
    });
    }

    handleAddToWidgetArea(id, widget){
        // params id => widgetAreaId

        this.setState(prevState => {
            var widgetContainers = _.cloneDeep(prevState.sbWidgets);
            widgetContainers[id].push(<BoxItemSidebar widgetAreaId={id} widget={widgetMap[widget.type]} uuid={uuid()} removeSingleWidget={this.handleRemoveSingleWidget}/>);
            return {sbWidgets: widgetContainers}
        });
    }

    handleClearAll(id){
        this.setState(prevState => {
            var widgetContainers = _.cloneDeep(prevState.sbWidgets);
            widgetContainers[id] = [];
            return {sbWidgets: widgetContainers}
        });
    }

    handleRemoveSingleWidget(id, widgetAreaId){
            this.setState((prevState) => {
                var widgetContainers = _.cloneDeep(prevState.sbWidgets);
                widgetContainers[widgetAreaId] = _.filter(widgetContainers[widgetAreaId], (widget) => (widget.props.uuid !== id))
                return {
                    sbWidgets: widgetContainers
                }
            }
        );
    
    }

	render(){
		return (
			<div className="content-wrapper">
			<div className="container-fluid">
                
				<section className="content-header">
			      <h1>
			        Widget Management Page
			      </h1>
			      <ol className="breadcrumb">
			        <li><a href="#"><i className="fa fa-dashboard"></i> Home</a></li>
			        <li className="active">Widget</li>
			      </ol>
			      <div style={{borderBottom:"#eee" , borderBottomStyle:"groove", borderWidth:2, marginTop: 10}}></div>
			    </section>
                <div className="notifications-wrapper"></div>

                <div className="row">
                <div style={{paddingRight: 60, paddingLeft: 60}}>
                <p className="lead">To active the widget click Add to button after selecting a widget area. To deactivate a widget and its settings you can click Clear All button in each widget area or click the close button in each widget. Also, you can drag-n-drop widget to reorder position</p>
                </div>

                <div className="col-md-8">
                    <WidgetAreaContainer id="sidebar-1" title='Sidebar #1' sbWidgets={this.state.sbWidgets['sidebar-1']} clearAllWidget={this.handleClearAll} />
                    <WidgetAreaContainer id="footer-1" title='Footer #1' sbWidgets={this.state.sbWidgets['footer-1']} clearAllWidget={this.handleClearAll} />
                </div>


                    <div className="col-md-4 pull-right">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Available widgets</h3>
                            </div>
                            <div className="box-body">
                                <div className="row">
                                <ul  className="widgets no-drop list-unstyled">

                                    {_.map(_.keys(widgetMap), (key, index) => (
                                        <div className="col-md-12" key={index}>
                                            <BoxItemAvailable widget={widgetMap[key]} handleAddToWidgetArea={this.handleAddToWidgetArea}/>
                                        </div>
                                    ))}

                                </ul>
                                                
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
		    </div>
            </div>
		)
	}
}

export default Widgets;
