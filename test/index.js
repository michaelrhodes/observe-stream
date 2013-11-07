var run = require('tape').test
var stream = require('stream-mixin')
var observe = require('../')

run('it works', function(test) {
  var model = { key: 'value' }
  var input = document.createElement('input')
  input.type = 'checkbox'

  observe.call(model)
  stream.call(input)

  input.readable = true
  input.writable = true
  input.write = function(data) {
    input.value = data.key
    input.click()
  }
  
  model.pipe(input).pipe(model)

  input.onclick = function() {
    test.equal(input.value, 'new value')
    test.end()
  }

  model.key = 'new value'
})
