import React from 'react';
import renderer from 'react-test-renderer';

import { createMapScopeToProps, wrapWithDecorators } from '../utils';

describe('createMapScopeToProps', () => {
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
    })
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