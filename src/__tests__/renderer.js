import React from 'react';
import ReactDOM from 'react-dom';
import { createRenderer } from '../renderer'

jest.mock('react-dom', () => ({
    render: jest.fn(),
    unmountComponentAtNode: jest.fn()
}))

describe('createRenderer', () => {
    test('creates render and unmount function', () => {
        const Component = () => (<span />);
        const container = document.createElement('div');

        const renderer = createRenderer(Component, container);

        expect(typeof renderer).toBe('object');
        expect(typeof renderer.render).toBe('function');
        expect(typeof renderer.unmount).toBe('function');
    });

    describe('render', () => {
        afterEach(() => {
            ReactDOM.render.mockClear();
        });

        test('renders correct component into container', () => {
            const Component = () => (<span />);
            const container = document.createElement('div');
            const props = { title: 'MyTitle' };

            const { render } = createRenderer(Component, container)


            render();
            expect(ReactDOM.render.mock.calls).toHaveLength(1);
            
            const call = ReactDOM.render.mock.calls[0];
            expect(call[0].type).toBe(Component);
            expect(call[1]).toBe(container);
        });

        test('renders correctly without props', () => {
            const Component = () => (<span />);
            const container = document.createElement('div');

            const { render } = createRenderer(Component, container);


            render();
            const element = ReactDOM.render.mock.calls[0][0];
            expect(element.props).toEqual({});
        });

        test('renders correctly with props', () => {
            const Component = () => (<span />);
            const container = document.createElement('div');
            const props = { title: 'MyTitle' };

            const { render } = createRenderer(Component, container);


            render(props);
            const element = ReactDOM.render.mock.calls[0][0];
            expect(element.props).toEqual(props);
        });
    });

    test('unmount function unmounts correctly', () => {
        const Component = () => (<span />);
        const container = document.createElement('div');

        const { unmount } = createRenderer(Component, container);


        unmount(container);
        expect(ReactDOM.unmountComponentAtNode.mock.calls).toHaveLength(1);
        
        const call = ReactDOM.unmountComponentAtNode.mock.calls[0];
        expect(call[0]).toBe(container);
        

        ReactDOM.render.mockClear();
        ReactDOM.unmountComponentAtNode.mockClear();
    });
});