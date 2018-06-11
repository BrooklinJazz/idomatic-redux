# Simplify Arrow Functions
since action creators are just regular functions, you can define them any way that you like.

in the case of a return as the body of an arrow function, you can simplify the action creator even further by removing the return statement, wraping the object block with () brackets,  and using the value of the return statement as the body of the arrow function. for example:

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