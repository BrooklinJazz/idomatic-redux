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

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter,
  };
};

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id,
  };
};
