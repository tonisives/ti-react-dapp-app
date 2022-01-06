import { Dispatch, SetStateAction, useState } from "react";
import ReactDOM from "react-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import App from "./App";
import './index.css';

const themeLight = createTheme({
  palette: {
    background: {
      default: "#e4f0e2",
      paper: "#ffffff"
    }
  }
});

const themeDark = createTheme({
  palette: {
    background: {
      default: "#222222",
      paper: "#333333"
    },
    text: {
      primary: "#ffffff"
    }
  }
});

export interface AppProps<S> {
  theme: [S, Dispatch<SetStateAction<S>>];
}

const ThemedApp = () => {
  const themee = useState(true);

  return (
    <ThemeProvider theme={themee[0] ? themeDark : themeLight}>
      <CssBaseline />
      <App theme={themee} />
    </ThemeProvider>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<ThemedApp />, rootElement);
