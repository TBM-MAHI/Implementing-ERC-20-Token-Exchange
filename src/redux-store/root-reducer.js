
import { combineReducers } from "redux";
import {ProviderReducer,TokenReducer,ExchangeReducers } from './reducers'

export const root_reducers = combineReducers({
    ProviderReducer,
    TokenReducer,
    ExchangeReducers
})