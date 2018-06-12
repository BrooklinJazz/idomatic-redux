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

create a new file localstorage.js. In this file you are going to create the function which loads the persisted state, as well as the function to save the persisted state

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

Determine the paramaters of what states should persist. For this example, we do not want the UI state to persist, only the data. So rather than save the whole state, you can define which keys to persist.

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

Currenty there is a bug in the code where if you add a todo then refresh, the local constant nextTodoId that defines the id of an added todo resets back to 0. this causes a same key error. so new todos won't display until nextTodoId is greater than the number of todos persisted. To fix this we're going to use node-uuid
```
npm install --save node-uuid
```

We're going to use node-uuid to replace the nextTodoId constant in actions/index.js. 

The v4 function in the node-uuid package generates a random and unique string so that each todo has a unique id. the commented lines are what we had there before.
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
