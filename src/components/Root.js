import React from 'react';
import { Provider } from 'react-redux'
import App from './App'
import createBrowserHistory from '../history'
import { Router, Route } from 'react-router'

// {store} acts as ES6 syntax to utilize props.store as store.
const Root = ({ store }) => (
    <Provider store={store}>
        <Router history={createBrowserHistory} >
            <Route path='/' component={App} />
        </Router>
    </Provider>
)

export default Root