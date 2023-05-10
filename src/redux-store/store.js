import { root_reducers } from "./root-reducer";
import { legacy_createStore as createStore, applyMiddleware, compose } from "redux";
//import { composeWithDevTools  } from "redux-devtools-extension";
import { logger } from "redux-logger";
import thunk from "redux-thunk";

let middlewares = [logger];

let composedEnhancers = compose(applyMiddleware(...middlewares));

export let store = createStore(root_reducers, undefined, composedEnhancers);
