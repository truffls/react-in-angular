import React from 'react';

export function createMapScopeToProps (bindings) {
    return function mapScopeToProps (scope) {
        return Object.keys(bindings).reduce((props, propName) => {
            // We expect that properties which are bound with & are functions
            if (bindings[propName] === '&') {
                props[propName] = (event) => scope[propName]({ $event: event });
            } else {
                props[propName] = scope[propName];
            }

            return props;
        }, {});
    };
}

export function wrapWithDecorators (decorators) {
    const compose = (render, decorate) => {
        // We create a new render function which takes props from outside
        const renderDecorator = (props) => {
            // Function which takes the passed props to render the component
            const renderComponentWithProps = () => render(props);

            // Pass the render function for component rendering to the decorate function
            // as render function
            return decorate(renderComponentWithProps);
        };

        return renderDecorator;
    };

    return function withDecorators (Component) {
        const render = (props) => (<Component {...props} />);

        return decorators.reduce(compose, render);
    };
}