var run = require('tape').test
var stream = require('stream-mixin')
var observe = require('../')

run('it works', function(test) {
  // Setup model
  var model = { key: 'value' } 
  observe.call(model)

  // Setup checkbox (ie. some DOM element)
  var input = document.createElement('input')
  input.type = 'checkbox'
  input.readable = true
  input.writable = true
  
  stream.call(input)

  // When the model (or whatever is piped
  // into input) is updated, run this.  
  input.write = function(data) {
    input.value = data.key
    input.click()
  }
 
  // Make them talk 
  model.pipe(input).pipe(model)

  var handle = function() {
    input.onclick = null
    
    // The input value should have automatically
    // updated to match the model.
    test.equal(input.value, 'new value')

    // Simulate user input that changes the value.    
    input.value = 'newer value'
    input.emit('data', { key: input.value })
    
    // The model should have updated to use the
    // user-defined value.
    test.equal(model.key, 'newer value')

    test.end()
  }

  input.onclick = handle
  document.body.appendChild(input)

  // Get the ball rolling by updating the model.
  model.key = 'new value'
})
