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