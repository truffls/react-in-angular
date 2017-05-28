import React from 'react';
import renderer from 'react-test-renderer';
import angular from 'angular';
import 'angular-mocks';

import { toComponent } from '../';
import { createRenderer } from '../renderer';

jest.mock('../renderer.js',() => {
    const original = require.requireActual('../renderer.js');

    return Object.assign({}, original, {
        createRenderer: jest.fn(original.createRenderer)
    });
});

afterEach(() => {
    createRenderer.mockClear();
});

afterAll(() => {
    jest.unmock('../renderer.js');
});

describe('toComponent', () => {
    test('creates a function', () => {
        const decorators = [];

        const createComponent = toComponent(decorators);

        expect(typeof createComponent).toBe('function');
    });

    test('use empty array if no decorators are passed', () => {
        const createComponent = toComponent();

        expect(createComponent._decorators).toHaveLength(0);
    });

    describe('createComponent', () => {
        test('returns correct AngularJS component', () => {
            const decorators = [];
            const Component = (props) => (<span>{props.title}</span>);
            const bindings = { title: '<' };

            const ngComponent = toComponent(decorators)(Component, bindings);
            
            expect(typeof ngComponent.controller).toBe('function');
            expect(ngComponent.bindings).toEqual(bindings);
        });

        test('use empty object if no bindings are passed', () => {
            const decorators = [];
            const Component = () => (<span>MyTitle</span>);

            const ngComponent = toComponent(decorators)(Component);

            expect(ngComponent.bindings).toEqual({});
        });

        describe('Controller', () => {
            test('resolves decorators correctly', () => {
                const decorators = [
                    () => (render) => (<span className="Decorators-1">{render()}</span>),
                    () => (render) => (<span className="Decorators-2">{render()}</span>)
                ];
                const Component = (props) => (<span>{props.title}</span>);
                const bindings = { title: '<' };

                const $element = [ document.createElement('div') ];
                const $injectInvoke = jest.fn((factory) => factory());
                const $injector = { invoke: $injectInvoke };

                const { controller: Controller } = toComponent(decorators)(Component, bindings);
                const ctrl = new Controller($element, $injector);


                expect($injectInvoke.mock.calls).toHaveLength(decorators.length);

                for (let i = 0, l = decorators.length; i < l; i++) {
                    const call = $injectInvoke.mock.calls[i];
                    const decorator = decorators[i];

                    expect(call).toEqual([ decorator ]);
                }
            });

            test('creates correct WrappedComponent', () => {
                const decorators = [
                    () => (render) => (<span className="Decorators-1">{render()}</span>),
                    () => (render) => (<span className="Decorators-2">{render()}</span>)
                ];
                const Component = (props) => (<span>{props.title}</span>);
                const bindings = { title: '<' };

                const $element = [ document.createElement('div') ];
                const $injectInvoke = (factory) => factory();
                const $injector = { invoke: $injectInvoke };

                const { controller: Controller } = toComponent(decorators)(Component, bindings);
                const ctrl = new Controller($element, $injector);

                const WrappedComponent = ctrl.WrappedComponent;
                const tree = renderer.create(
                    <WrappedComponent title="MyTitle" />
                ).toJSON();

                expect(tree).toMatchSnapshot();
            });

            test('creates renderer', () => {
                const decorators = [
                    () => (render) => (<span className="Decorators-1">{render()}</span>),
                    () => (render) => (<span className="Decorators-2">{render()}</span>)
                ];
                const Component = (props) => (<span>{props.title}</span>);
                const bindings = { title: '<' };

                const element = document.createElement('div');
                const $element = [ element ];
                const $injectInvoke = (factory) => factory();
                const $injector = { invoke: $injectInvoke };

                const { controller: Controller } = toComponent(decorators)(Component, bindings);
                const ctrl = new Controller($element, $injector);
                const WrappedComponent = ctrl.WrappedComponent;
                
                expect(createRenderer.mock.calls).toHaveLength(1);

                const call = createRenderer.mock.calls[0];
                expect(call).toEqual([ WrappedComponent, element ]);
            });

            test('$onChanges pass props to render function correctly', () => {
                const decorators = [
                    () => (render) => (<span className="Decorators-1">{render()}</span>),
                    () => (render) => (<span className="Decorators-2">{render()}</span>)
                ];
                const Component = (props) => (<span>{props.title}</span>);
                const bindings = { title: '<' };
                const scope = { title: 'MyTitle', unknownProp: 'unknown' };
                const props = { title: scope.title };

                const element = document.createElement('div');
                const $element = [ element ];
                const $injectInvoke = (factory) => factory();
                const $injector = { invoke: $injectInvoke };

                const { controller: Controller } = toComponent(decorators)(Component, bindings);
                const ctrl = new Controller($element, $injector);
                // We manually bind the scope the the controller
                ctrl.title = scope.title;
                ctrl.unknownProp = scope.unknownProp;
                // Mock render function
                const render = jest.fn();
                ctrl.renderer.render = render;


                ctrl.$onChanges();
                expect(render.mock.calls).toHaveLength(1);
                expect(render.mock.calls[0]).toEqual([ props ]);
            });

            test('$onDestroy unmounts correctly', () => {
                const decorators = [
                    () => (render) => (<span className="Decorators-1">{render()}</span>),
                    () => (render) => (<span className="Decorators-2">{render()}</span>)
                ];
                const Component = (props) => (<span>{props.title}</span>);
                const bindings = { title: '<' };

                const element = document.createElement('div');
                const $element = [ element ];
                const $injectInvoke = (factory) => factory();
                const $injector = { invoke: $injectInvoke };

                const { controller: Controller } = toComponent(decorators)(Component, bindings);
                const ctrl = new Controller($element, $injector);
                // Mock unmount function
                const unmount = jest.fn();
                ctrl.renderer.unmount = unmount;


                ctrl.$onDestroy();
                expect(unmount.mock.calls).toHaveLength(1);
            });
        });

        describe('AngularJS component', () => {
            const createComponentRenderer = (template, componentName, component) => {
                const componentNameInTemplate = componentName.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

                let $compile;
                let $scope;

                angular.mock.module(($compileProvider) => {
                    $compileProvider.component(componentName, component);
                });
                angular.mock.inject((_$compile_, _$rootScope_) => {
                    $compile = _$compile_;
                    $scope = _$rootScope_.$new();
                });

                const render = () => {
                    const wrapper = $compile(template)($scope);
                    wrapper.toElement = () => wrapper.children()[0];

                    return wrapper;
                };

                return {
                    $scope: $scope,
                    render: render
                };
            };

            test('renders correctly without props', () => {
                const Component = () => (<span>MyComponent</span>);
                const ngComponent = toComponent()(Component, {});

                const renderer = createComponentRenderer(
                    '<react-component-without-props></react-component-without-props>',
                    'reactComponentWithoutProps',
                    ngComponent
                );

                expect(renderer.render().toElement()).toMatchSnapshot();
            });

            test('renders correctly with props', () => {
                const Component = (props) => (<span>{props.title}</span>);
                const ngComponent = toComponent()(Component, { title: '<' });

                const renderer = createComponentRenderer(
                    '<react-component-with-props title="title"></react-component-with-props>',
                    'reactComponentWithProps',
                    ngComponent
                );
                const $scope = renderer.$scope;
                const wrapper = renderer.render();

                $scope.title = 'My 1st Title';
                $scope.$digest();

                expect(wrapper.toElement()).toMatchSnapshot();


                $scope.title = 'My 2nd Title';
                $scope.$digest();

                expect(wrapper.toElement()).toMatchSnapshot();
            });
        });
    });
});
