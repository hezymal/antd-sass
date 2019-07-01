import React from "react";
import ReactDOM from "react-dom";
import { Button } from "antd";
import "./index.scss";

function App() {
    return (
        <Button>Push me</Button>
    );
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);
