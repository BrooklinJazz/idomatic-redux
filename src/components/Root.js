import React from 'react';
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'
import createBrowserHistory from '../history'
import App from './App'

// {store} acts as ES6 syntax to utilize props.store as store.
const Root = ({ store }) => (
    <Provider store={store}>
        <Router history={createBrowserHistory} >
            <Route path='/' component={App} />
        </Router>
    </Provider>
)

export default Root