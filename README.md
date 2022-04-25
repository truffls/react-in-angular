# react-in-angular ![Build Status](https://github.com/truffls/react-in-angular/actions/workflows/main.yml/badge.svg)

## Installation

```
npm install -S react-in-angular react react-dom
```

_Note: `react` and `react-dom` are peer dependencies and are needed to run `react-in-angular`_

## Usage

Create your React component:
```js
const ClickMeButton = (props) => {
    return (
        <button type={props.type} onClick={props.onClick}>
            Click me!
        </button>
    )
};

export default ClickMeButton;
```

Wrap it with `react-in-angular` and register it as AngularJS component:
```js
import { toComponent } from 'react-in-angular';

import ClickMeButton from './ClickMeButton';

// Define the bindings for ClickMeButton
const bindings = {
    type: '<',
    onClick: '&'
};


angular
    .module('app.button')
    .component('clickMeButton', toComponent()(ClickMeButton, bindings));

```

In your angular controller:
```js
function Controller () {
    this.type = 'button';
    this.onClick = ($event) => {
        $event.preventDefault();

        alert('Clicked!');
    };
}
```

In your angular template:
```html
<click-me-button type="$ctrl.type" on-click="$ctrl.onClick($event)"></click-me-button>
```

### Supported bindings

Because of compatibility with React's one-way data flow only two bindings are supported:
 * `<` &ndash; for data
 * `&` &ndash; for functions

Internally all bindings of type `&` are handled like event handlers. Because of that all events which are passed to the event handlers will be wrapped in a scope where your event is accessible as `$event`. In Angular you can pass `$event` to your event handler:

```js
<click-me-button on-click="$ctrl.onClick($event)"></click-me-button>
```

_Note: The property name `$event` was advised in [AngularJS Styleguide by Todd Motto](https://github.com/toddmotto/angularjs-styleguide#one-way-dataflow-and-events) and is described in the [documentation](https://docs.angularjs.org/guide/expression#-event-) of AngularJS._

### Decorators

With decorators you have the option to provide contexts for your React components or wrap it with logic which is provided by your AngularJS application.

#### How to write a decorators

Decorators are simple AngularJS factory functions which return a decorate function. The decorate function takes a render function as argument which will be used to render the actual component.

An example decorator called `ReduxDecorator` which reuses the Redux store of `$ngRedux`:
```js
import { Provider } from 'react-redux';

function ReduxDecorator ($ngRedux) {
    return function decorate (render) {
        return (
            <Provider store={$ngRedux}>
                {render()}
            </Provider>
        );
    };
}

export default ReduxDecorator;
```
