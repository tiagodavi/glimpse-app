import ReactDOM  from "react-dom";
import Dropzone from './dropzone';

const App = () => {
    return (
        <div>
            <h1> Glimpse App </h1>
            <Dropzone />
        </div>
    )
};

ReactDOM.render(
    <App />, document.querySelector("#root")
);

