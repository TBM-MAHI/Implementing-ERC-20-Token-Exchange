export let ProviderReducer = (state = {}, action) => {
  let { type, payload } = action;
  switch (type) {
    case "PROVIDER_LOADED":
      return {
        ...state,
        ...payload,
      };
    case "NETWORK_LOADED":
      return {
        ...state,
        ...payload,
      };
    case "ACCOUNT_LOADED":
      return {
        ...state,
        ...payload,
      };
    case "ACCOUNT_BALANCE_LOADED":
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
};

let INITIAL_TOKEN_STATE = {
  loaded: false,
  tokenContracts: [],
  symbols: [],
};

export let TokenReducer = (state = INITIAL_TOKEN_STATE, action) => {
  let { type, payload } = action;
  switch (type) {
    case "TOKEN_1_LOADED":
      return {
        ...state,
        loaded: true,
        tokenContracts: [...state.tokenContracts, payload.tokenContr],
        symbols: [...state.symbols, payload.symbol],
      };
    case "TOKEN_2_LOADED":
      return {
        ...state,
        loaded: true,
        tokenContracts: [...state.tokenContracts, payload.tokenContr],
        symbols: [...state.symbols, payload.symbol],
      };
    default:
      return state;
  }
};

let INITIAL_EXCHANGE_STATE = {
  loaded: false,
}

export let ExchangeReducers = (state = INITIAL_EXCHANGE_STATE, action) => {
  let { type, payload } = action;
  switch (type) {
    case "EXCHANGE_LOADED":
      return {
        ...state,
        loaded: true,
        ...payload,
      };
    default:
      return state;
  }
}
