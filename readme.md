# observe-stream
observe-stream is a thin layer on top of [stream-mixin](https://github.com/michaelrhodes/stream-mixin) that turns Objects and Functions into duplex streams so they can accept and announce changes to their properties. Its intended use is multi-way data-binding in the browser.

[![Browser support](https://ci.testling.com/michaelrhodes/observe-stream.png)](https://ci.testling.com/michaelrhodes/observe-stream)

## Install

``` sh
$ npm install observe-stream
```

## Usage
Hate reading code? [See this example running!](http://michaelrhodes.github.io/observe-stream/)
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
input.end = function() {}

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
