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