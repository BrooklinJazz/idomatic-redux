import React from 'react';
import Provider from 'react-redux'
import App from './App'

// {store} acts as ES6 syntax to utilize props.store as store.
const Root = ({ store }) => {
    <Provider store={store}>
        <App />
    </Provider>
}

export default Root