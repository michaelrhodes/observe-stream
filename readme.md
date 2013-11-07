# observe-stream
observe-stream is a thin layer on top of [stream-mixin](https://github.com/michaelrhodes/stream-mixin) that turns Objects and Functions into duplex streams so they can accept and announce changes to their properties. It’s intended use is multi-way data-binding in the browser.

\[ soon: tests \]

## Install

``` sh
$ npm install observe-stream
```

## Usage
``` js
var stream = require('stream-mixin')
var observe = require('observe-stream')

var model = {
  name: 'Alice'
}

// Mixin pre-configured duplex stream.
observe.call(model)

var input = document.createElement('input')

// Make duplex stream from scratch.
stream.call(input)
input.readable = true
input.writable = true
input.write = function(data) {
  this.value = data.name
}

input.value = model.name
input.addEventListener('input', function() {
  this.emit('data', { name: this.value })
})

// Make them talk
model.pipe(input).pipe(model)

// Let us interact
window.model = model
window.input = input
document.body.appendChild(input)
```

### License
[MIT](http://opensource.org/licenses/MIT)
