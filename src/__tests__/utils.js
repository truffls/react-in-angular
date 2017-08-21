import React from 'react';
import renderer from 'react-test-renderer';

import { parseBindingDefinition, createMapScopeToProps, wrapWithDecorators } from '../utils';

describe('parseBindingDefinition', () => {
    test('parse binding definitions correctly', () => {
        expect(parseBindingDefinition('<')).toEqual({ binding: '<', optional: false });
        expect(parseBindingDefinition('&')).toEqual({ binding: '&', optional: false });

        // Optional
        expect(parseBindingDefinition('<?')).toEqual({ binding: '<', optional: true });
        expect(parseBindingDefinition('&?')).toEqual({ binding: '&', optional: true });

        // Named
        expect(parseBindingDefinition('<name')).toEqual({ binding: '<', optional: false });
        expect(parseBindingDefinition('&onClick')).toEqual({ binding: '&', optional: false });

        // Optional and named
        expect(parseBindingDefinition('<?name')).toEqual({ binding: '<', optional: true });
        expect(parseBindingDefinition('&?onClick')).toEqual({ binding: '&', optional: true });
    });

    test('throws an error for invalid bindings', () => {
        expect(() => {
            parseBindingDefinition(':');
        }).toThrowError(`Defintion of binding ':' is not a valid`);
    });

    test('throws an error for unsupported bindings', () => {
        expect(() => {
            parseBindingDefinition('@');
        }).toThrowError(`Binding '@' is not a supported binding`);
    });
});

describe('createMapScopeToProps', () => {
    test('throws errors for invalid or not supported bindings', () => {
        expect(() => {
            createMapScopeToProps({
                name: ':'
            });
        }).toThrowError(`Defintion of binding ':' is not a valid`);

        expect(() => {
            createMapScopeToProps({
                name: '@'
            });
        }).toThrowError(`Binding '@' is not a supported binding`);
    });

    test('create mapScopeToProps functions ', () => {
        const bindings = {
            name: '<',
            onClickName: '&'
        };

        const mapScopeToProps = createMapScopeToProps(bindings);

        expect(typeof mapScopeToProps).toBe('function');
    });
    test('mapScopeToProps returns correct props', () => {
        const bindings = {
            name: '<',
            onClickName: '&'
        };
        const scope = {
            name: 'Hello',
            onClickName: jest.fn(),
            unknownProp: 'UNKNOWN'
        }
        const event = Symbol();
        const mapScopeToProps = createMapScopeToProps(bindings);

        const props = mapScopeToProps(scope);

        expect(props.name).toBe(scope.name);
        expect(typeof props.onClickName).toBe('function');

        props.onClickName(event)
        expect(scope.onClickName.mock.calls[0]).toEqual([ { $event: event } ]);
    });

    test('mapScopeToProps handles optional bindings correctly', () => {
        const bindings = {
            name: '<?',
            onClickName: '&?',
            onDoubleClickName: '&?'
        };
        const scope = {
            name: 'Hello',
            onDoubleClickName: jest.fn()
        };
        const event = Symbol();
        const mapScopeToProps = createMapScopeToProps(bindings);

        const props = mapScopeToProps(scope);

        expect(props.name).toBe(scope.name);
        expect(typeof props.onClickName).toBe('undefined');
        expect(typeof props.onDoubleClickName).toBe('function');

        props.onDoubleClickName(event)
        expect(scope.onDoubleClickName.mock.calls[0]).toEqual([ { $event: event } ]);
    });
});


describe('wrapWithDecorators', () => {
    test('returns function', () => {
        const decorators = [];

        expect(typeof wrapWithDecorators()).toBe('function');
    });

    describe('renders correctly', () => {
        const decorators = [
            (render) => (<span className="Decorator-1">{render()}</span>),
            (render) => (<span className="Decorator-2">{render()}</span>)
        ];
        const ComponentToDecorate = ({ content }) => (<span>{content}</span>);

        const Component = wrapWithDecorators(decorators)(ComponentToDecorate);

        const tree = renderer.create(
            <Component content="MyContent" />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
