# react-in-angular [![Build Status](https://travis-ci.org/truffls/react-in-angular.svg?branch=master)](https://travis-ci.org/truffls/react-in-angular)

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
    onClick: '6'
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
<click-me-button title="$ctrl.type" on-click="$ctrl.onClick($event)"></click-me-button>
```

### Decorators

With decorators you have the possibility to pass parts of your AngularJS application into your React component or simply
wrap the component with component you want to use multiple times.

#### How to write a decorators

Decorators are simple AngularJS factory functions which return a decorate function. The decorate function takes a
render function as argument which will be used to render the actual component.

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
