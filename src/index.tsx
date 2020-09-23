import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import ReactModal from "react-modal";

const rootElement = document.getElementById("root");
ReactModal.setAppElement(rootElement as HTMLElement);
ReactDOM.render(<App />, rootElement);
