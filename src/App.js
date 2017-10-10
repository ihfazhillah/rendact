import React from 'react'
import {render} from 'react-dom'
import {ApolloProvider} from 'react-apollo'
import BrowserRouter from 'react-router/BrowserRouter'
import Match from 'react-router/Match'
import Miss from 'react-router/Miss'
import MatchWhenAuthorized from './auth'
import client from './apollo'
import reducer from './reducers'
import DragDropContext from 'react-dnd/lib/DragDropContext';
import HTML5Backend from 'react-dnd-html5-backend';
import createStore from 'redux/lib/createStore'
import Loading from './admin/Loading';
import Loadable from 'react-loadable';

const store = createStore(reducer, {})

let Main = React.createClass({
	render(){
		return (
				<BrowserRouter>
					<div id="router" style={{height: "100vh"}}>
							<MatchWhenAuthorized pattern="/admin/:page?/:action?/:postId?" 
                component={props => {
              const Admin = Loadable({
                loader: () => import(/* webpackChunkName: "admin"*/ /*webpackMode: "lazy"*/'./admin'),
                loading: () => <Loading/>
              })
                  return <Admin {...props}/>
                }}
								/>
              <Match pattern="/page/:postId?/:param1?/:param2?" render={props=>{
                  const ThemeSingle = Loadable({
                    loader: () => import('./includes/Theme/ThemeSingle'),
                    loading: () => null
                  })
                return <ThemeSingle {...props} />             }} />
              <Match pattern="/post/:postId?/:param1?/:param2?" render={props =>{
                  const ThemeSingle = Loadable({
                    loader: () => import('./includes/Theme/ThemeSingle'),
                    loading: () => null
                  })
                return <ThemeSingle {...props} />             }} />
              <Match pattern="/blog/:postId?/:param1?/:param2?" render={props => {
                  const ThemeBlog = Loadable({
                    loader: () => import('./includes/Theme/ThemeBlog'),
                    loading: () => <Loading/>
                  })
                return <ThemeBlog {...props}/>
              }} />
            <Match pattern="/category/:categoryId?/:param1?/:param2?" render={props => {
                  const ThemeBlog = Loadable({
                    loader: () => import('./includes/Theme/ThemeBlog'),
                    loading: () => <Loading/>
                  })
                return <ThemeBlog {...props}/>
            }} />
          <Match pattern="/search/:search" render={props => {
                  const ThemeSearch = Loadable({
                    loader: () => import('./includes/themeSearch'),
                    loading: () => <Loading/>
})
            return <ThemeSearch {...props}/>
          }}/>
        <Match pattern="/register/:param1?" render={props => {
                  const Register = Loadable({
                    loader: () => import('./register'),
                    loading: () => <Loading/>
                  })

          return <Register {...props}/>

        }}/>
              <Match pattern="/login/:param1?" render={props=> {
                const Login = Loadable({
                  loader: () => import('./login'),
                  loading: () => <Loading/>
                })
                return <Login {...props}/>
              }}/>
            <Miss render={props => {
                const ThemeHome = Loadable({
                  loader: () => import(/*webpackChunkName: "home"*/ /*webpackMode: "lazy"*/'./includes/Theme/ThemeHome'),
                  loading: () => <Loading/>
                })

                return <ThemeHome {...props}/>
                }} />
					</div>
				</BrowserRouter>
		)
	}
})

Main = DragDropContext(HTML5Backend)(Main);
const App = () => <ApolloProvider client={client} store={store}><Main/></ApolloProvider>
export default App
