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