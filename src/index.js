import React from "react";
import ReactDOM from "react-dom";
// import NewPromise from './NewPromise';
import HandlePromise from "./HandlePromise";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <h1>test</h1>
      <h2>Study-demo前端学习</h2>
      {/* <NewPromise /> */}
      <HandlePromise />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
