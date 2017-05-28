import React from 'react';
import ReactDOM from 'react-dom';

import { createMapScopeToProps, wrapWithDecorators } from './utils';
import { createRenderer } from './renderer';

function toComponent (decorators) {
    decorators = decorators || [];

    function createComponent (Component, bindings) {
        bindings = bindings || {};

        const mapScopeToProps = createMapScopeToProps(bindings);

        class ComponentController {
            constructor ($element, $injector) {
                this.$injector = $injector;

                this.WrappedComponent = wrapWithDecorators(this.resolveDecorators(decorators))(Component);
                
                this.renderer = createRenderer(this.WrappedComponent, $element[0]);
            }

            resolveDecorators (decorators) {
                return decorators.map((decorator) => this.$injector.invoke(decorator));
            }

            $onChanges () {
                const props = mapScopeToProps(this);
                
                this.renderer.render(props);
            }

            $onDestroy () {
                this.renderer.unmount();
            }
        }

        ComponentController.$inject = ['$element', '$injector'];

        return {
            bindings: bindings,
            controller: ComponentController
        };
    };

    // Exposed for testing
    createComponent._decorators = decorators;

    return createComponent;
}

export {
    toComponent
};
