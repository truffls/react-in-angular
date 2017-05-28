import React from 'react';
import ReactDOM from 'react-dom';

export function createRenderer (Component, container) {
    function render (props) {
        ReactDOM.render(<Component {...props} />, container);
    };

    function unmount () {
        ReactDOM.unmountComponentAtNode(container)
    };

    return {
        render,
        unmount
    };
}
