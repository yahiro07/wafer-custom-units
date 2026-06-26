// @flow
import "./styles/reset.css";
import rootReducer from "./rootReducer";

import React, { Component } from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
// import logger from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";

import ThemeWrapper from "./components/ThemeWrapper";
import theme from "./styles/theme.js";

const middleware = [];

const THEME_STORAGE_KEY = "bc-010-theme";

function loadPersistedTheme() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedThemeName = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (!storedThemeName || !theme[storedThemeName]) {
    return undefined;
  }

  return {
    theme: {
      name: storedThemeName,
    },
  };
}

const store = createStore(
  rootReducer,
  loadPersistedTheme(),
  composeWithDevTools(applyMiddleware(...middleware)),
);

store.subscribe(() => {
  if (typeof window === "undefined") {
    return;
  }

  const currentThemeName = store.getState().theme.name;

  window.localStorage.setItem(THEME_STORAGE_KEY, currentThemeName);
});

type Props = {};
type State = {};

class App extends Component<Props, State> {
  render() {
    return (
      <Provider store={store}>
        <ThemeWrapper />
      </Provider>
    );
  }
}

export default App;
