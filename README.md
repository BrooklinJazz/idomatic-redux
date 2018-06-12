# Simplify Arrow Functions
since action creators are just regular functions, you can define them any way that you like.

in the case of an arrow function returning an object, you can simplify the function by removing the return statement, wraping the object block with () brackets, and using the value of the return statement as the body of the arrow function. for example:

a regular arrow function as an action creator
```js
let nextTodoId = 0
export const addTodo = (text) => {
    return {
        type: 'ADD_TODO',
        id: (nextTodoId++).toString(),
        text,
    }
}
```

can become:

```js
let nextTodoId = 0
export const addTodo = (text) => ({
    type: 'ADD_TODO',
    id: (nextTodoId++).toString(),
    text,
})
```
## Concise Method Notation
in ES6 when a function is defined inside of an object you can simplify it using Concise Method Notation

For example mapDispatchToProps with an onClick function:
```js
const mapDispatchToProps = (dispatch, ownProps) => ({
    onClick: () => {
        dispatch(setVisibilityFilter(ownProps.filter));
    },
})
```
can be simplified to:
```js
const mapDispatchToProps = (dispatch, ownProps) => ({
    onClick() {
        dispatch(setVisibilityFilter(ownProps.filter));
    },
})
```

# Supplying the initial state
When you create the redux store, it's initial state is determined by the root reducer.

```js
// index.js
// where todoApp is the root reducer
const store = createStore(todoApp);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

In this case the root reducer is the result of combining the todos reducer and the visibilityFilter reducer

```js
// todos.js
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action),
      ];
    case 'TOGGLE_TODO':
      return state.map(t =>
        todo(t, action)
      );
    default:
      return state;
  }
};
```

Reducers can supply their own initial state with the default value syntax. in this case above, the initial state is an empty array. In the case below the initial state is a string 'SHOW_ALL' for the visibilityFilter reducer.

```js
// visibilityFilter.js
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};
```

So to go back to the root reducer, the initial state for the combined reducer is going to be an object containing an empty array under the todos key and a 'SHOW_ALL' string for the visibilityFilter key.

Another way of phrasing this is that this is going to be the initial state of the store:

```js
// index.js
const store = createStore(todoApp);
// if you were to log the store right after it's created you should see an object with key todos: [] and key visibilityFilter: 'SHOW_ALL'
console.log(store)
// result:
{
    todos: [],
    visibilityFilter: 'SHOW_ALL',
}
```

in some cases you might want to have some data to supply an initial value to the store. In this case, you can add any persistedState as the second argument in the createStore() function

```js
// index.js
const persistedState = {
  todos: [{
    id: 0,
    text: 'Welcome back!',
    completed: false,
  }]
}
const store = createStore(
    todoApp,
    persistedState
)
// if you were to log the store at this point you would see:
{
    todos: [{
    id: 0,
    text: 'Welcome back!',
    completed: false,
    }],
    visibilityFilter: 'SHOW_ALL',
}
```

# Persisting State to Local Storage

create a new file localstorage.js. In this file you are going to create the function which loads the persisted state, as well as the function to save the persisted state.

```js
// define the function which loads the state
export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        // if there is no state key allow the reducers to define initial state
        if (serializedState === null) {
            return undefined
        }
        // Otherwise, turn serializedState into the initial state object
        return JSON.parse(serializedState)
    } catch (err) {
        return undefined
    }
}

// define the function which saves the state
export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state)
        localStorage.setItem('state', serializedState)
    } catch (err) {
        // ignore write errors
        // ignoring these errors, but having a function to catch them prevents the app from crashing
    }
}
```

Now you are going to need to configure index.js to persist state using these two functions. You can redefine persisted State as the value that is loaded from local storage `loadState()` and add a listener using the `store.subscribe()` function to save the state in local storage every time a state change occurs

```js
// redefine the persistedState as what is loaded from local storage
const persistedState = loadState()

// store.subscribe() will be called every time the state changes.
// essentially it adds a listener to state changes.
store.subscribe(() => {
  console.log('statechange', persistedState);
  saveState(store.getState());
})
```

Determine the paramaters of what states should persist. For this example, you do not want the UI state to persist, only the data. So rather than save the whole state, you can define which keys to persist.

```js
store.subscribe(() => {
  console.log('statechange', persistedState);
  saveState({
    // store.getState() returns the state object so you can use dot notation to access the values on the todos key.
    todos: store.getState().todos
  });
})
```

this will allow the todos to be saved without the UI state for visibilityFilter to be persisted.

Currenty there is a bug in the code where if you add a todo then refresh, the local constant nextTodoId that defines the id of an added todo resets back to 0. this causes a same key error. so new todos won't display until nextTodoId is greater than the number of todos persisted. To fix this you're going to use node-uuid
```
npm install --save node-uuid
```

you're going to use node-uuid to replace the nextTodoId constant in actions/index.js. 

The v4 function in the node-uuid package generates a random and unique string so that each todo has a unique id. the commented lines are what you had there before.
```js
// actions/index.js
// let nextTodoId = 0;
import { v4 } from 'node-uuid'
export const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: v4(),
    // id: (nextTodoId++).toString(),
    text,
  };
};
```

The current app now works, however it could be made more performant since it currently calls the expansive JSON.serialize() methode every time the state changes. To solve this you're going to use the Lodash library's throttle utility.

```
npm install --save lodash
```
now configure the store.subscribe method to use the throttle function. To do this, you can wrap the throttle function around the arrow function inside of store.subscribe()
```js
store.subscribe(throttle(() => {
  saveState({
    todos: store.getState().todos
  });
  // 1000 refers to miliseconds so the saveState function run a maximum of once per second.
}, 1000))
```

# Refactoring the Entry point
To refactor the Entry point for the store you are going to move the logic for configuring the store into a new component `configureStore.js`

```js
// configureStore.js
import { createStore } from 'redux';
import todoApp from './reducers';
import { loadState, saveState } from './localstorage'
import { throttle } from 'lodash'

const configureStore = () => {
    // define the persistedState as what is loaded from local storage
    const persistedState = loadState()

    const store = createStore(
        todoApp,
        persistedState
    );

    // store.subscribe() will be called every time the state changes.
    // essentially it adds a listener to state changes.
    store.subscribe(throttle(() => {
        saveState({
            todos: store.getState().todos
        });
    }, 1000))

    return store
}

export default configureStore;
```

using this configureStore component you can import the store functionality into the application entry point index.js, without specifying the Reducer, or the Subscribers. This keeps the entry point clean and isolates the functionality of configureStore.

```js
// index.js
// the Root component will be created in the second step
import Root from './components/Root'
import configureStore from './configureStore'

const store = configureStore()

render(
  // simplified component for App and Providers
  <Root store={store}/>,
  document.getElementById('root')
);
```
you are also going to create a Root component which will simplify/export the App component and Providers
```js
// components/Root.js
import React. { PropTypes } from 'react';
import Provider from 'react-redux'
import App from './App'

// {store} acts as ES6 syntax to utilize props.store as store, so that the provider can be passed the store prop coming from index.js
const Root = ({ store }) => (
    <Provider store={store}>
        <App />
    </Provider>
)

export default Root
```

# Add React-Router to the project
The tutorial I'm following is outdated and uses browserHistory from the 'browserHistory' from react-router. This is no longer available so instead I'm choosing to create a separate history.js file and importing createBrowserHistory from the 'history' package.

to add React-Router to the project first run:
```
npm install --save react-router history
```

React Router requires the history proptype, so first you have to configure a history.js file that is going to be used to create the browser history. This history keeps track of which pages the user visits, as well as gives you the ability to redirect the user if you need to.

```js
// history.js
import { createBrowserHistory } from 'history'

export default createBrowserHistory();
```

Now in order to configure routing into the project, you will have to go to your Root.js file, and the imports for Routing, and add the Router and Route.

```js
import createBrowserHistory from '../history'
import { Router, Route } from 'react-router'

// {store} acts as ES6 syntax to utilize props.store as store.
  // Router must be provided the history prop or you will see an error.
const Root = ({ store }) => (
    <Provider store={store}>
        <Router history={createBrowserHistory} >
            <Route path='/' component={App} />
        </Router>
    </Provider>
)

export default Root
```

# Navigating with React Router 
The tutorial says to define a (:filter) parameter in the Route for App, however this seems to consistently Break the app so I am going forward using a different parameter syntax
```js
// Root.js
// don't do this:
<Route path='/(:filter)' component={App} />
// instead do this:
<Route path='/:filter?' component={App} />
```

change footer filter props to more generic naming scheme
```js
// footer.js
<FilterLink filter="all">
...
<FilterLink filter="active">
...
<FilterLink filter="completed">
```

remove previous FilterLink configuration to replace it with one that uses the router. 

The tutorial I'm following is broken here because it uses the Link import from react router. Instead I'm going to install the react-router-dom package and import NavLink from there.
npm install react-router-dom

```js
// FilterLink.js
import React from 'react';
import { NavLink } from 'react-router-dom'

const FilterLink = ({ filter, children }) => (
  <NavLink
  // the tutorial does not use the exact to
  // if you do not add exact then the activeStyle will not work.
    exact to={filter === 'all' ? '' : '/' + filter}
    activeStyle={{
      textDecoration: 'none',
      color: 'black',
    }}
  >
    {children}
  </NavLink>
)

export default FilterLink
```
After doing all of the above you can do some
cleanup of unnecessary code:
- Remove setVisibilityFilter action creator
- delete Link.js component

# Filtering Redux state with React Router Params

configure VisibleTodoList
```js
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'all': // renamed
      return todos;
    case 'completed': // renamed
      return todos.filter(t => t.completed);
    case 'active': // renamed
      return todos.filter(t => !t.completed);
    default:
      throw new Error(`Unknown filter: ${filter}.`);
  }
};

const mapStateToProps = (state, ownProps /*added ownProps*/) => {
  return {
    todos: getVisibleTodos(state.todos, ownProps.filter), // get filter from ownProps, not state.
  };
};
```

Now configure VisibleTodoList in App.js to use the match.params prop to set the filter. The match.params gives you access to the parameters in the url.

```js
const App = ({ match /*add the match value*/ }) => (
...
<VisibleTodoList
    // it will use the filter param
    filter={ match.params.filter || 'all'}
     />
     ...
```

set the devServer.js to serve the content on any url. This fixes the error when refreshing the page on a url with parameters

```js
// devServer.js
app.get('/*' /*add the `*` meaning all routes*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
```

delete VisibilityFilter.js and it's import/use in index.js