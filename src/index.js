import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import todoApp from './reducers';
import App from './components/App';
import { loadState, saveState } from './localstorage'

// define the persistedState as what is loaded from local storage
const persistedState = loadState()

const store = createStore(
  todoApp,
  persistedState
);

// store.subscribe() will be called every time the state changes.
// essentially it adds a listener to state changes.
store.subscribe(() => {
  console.log('statechange', persistedState);
  saveState({
    todos: store.getState().todos
  });
})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
