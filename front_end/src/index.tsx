import { Dispatch, SetStateAction, useState } from "react";
import ReactDOM from "react-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import App from "./App";
import { blue, lightBlue } from "@material-ui/core/colors";

const themeLight = createTheme({
  palette: {
    secondary: blue,
    background: {
      default: lightBlue[100],
      paper: "#ffffff"
    }
  }
});

const themeDark = createTheme({
  palette: {
    background: {
      default: "#222222",
      paper: "#333333",
    },
    text: {
      primary: "#ffffff",
      secondary: "#c5cae9"
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
