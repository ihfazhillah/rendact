import React from 'react';

const ChildMenuComponent = (props) => {
    var childMenuItem=  props.child.map((item, index) => (
        <a className="dropdown-item" href={item.target} key={index.toString()}>{item.title}</a>
    ))

    return <div className="dropdown-menu" aria-labelledby="dropdown-menu-link">
            {childMenuItem}
            </div>

}

const ParentMenuComponent = (props) => {
    var item = props.menuItem;

    if (item.children) {
        return <li className="dropdown" key={props.parentIndex}>
                <a className="dropdown-toggle" data-toggle="dropdown" href={item.target}>{item.title}</a>
                <ChildMenuComponent child={item.children} />
                </li>

    } else {
        return <li key={props.parentIndex}><a href={item.target}>{item.title}</a></li>
    }
}

export const MenuComponent = (props) => {
    var menuItems = props.menuItems.map((parentItem, parentIndex)=>(
        <ParentMenuComponent menuItem={parentItem} parentIndex={parentIndex} key={parentIndex.toString()}/>
    ))
    
    return <ul className="cl-effect-16">
        <li><a className="active" href="#" onClick={props.goHome}>Home</a></li>
        <li><a href="blogs">Blogs</a></li>
        { menuItems }
    </ul>
}



