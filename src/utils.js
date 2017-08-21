import React from 'react';

export function parseBindingDefinition (bindingDefinition) {
    const match = bindingDefinition.match(/^([@=<&])(\??)/);

    if (!match) {
        throw new Error(`Defintion of binding '${bindingDefinition}' is not a valid`);
    }

    const binding = match[1];
    const optional = match[2] === '?';

    // We only support '<' and '&'
    if (binding !== '<' && binding !== '&') {
        throw new Error(`Binding '${binding}' is not a supported binding`);
    }

    return { binding, optional };
}

export function createMapScopeToProps (bindings) {
    // We compile the details as early as possible because we want to validate the bindings before using the bindings.
    const bindingDetails = Object.keys(bindings).reduce((details, name) => {
        details[name] = parseBindingDefinition(bindings[name]);

        return details;
    }, {});


    return function mapScopeToProps (scope) {
        return Object.keys(bindingDetails).reduce((props, propName) => {
            const { binding, optional } = bindingDetails[propName];

            // If the binding is optional and no value is passed we don't want to add it to the props
            if (optional && typeof scope[propName] === 'undefined') {
                return props;
            }

            // We expect that properties which are bound with & are functions
            if (binding === '&') {
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
