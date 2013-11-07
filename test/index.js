var run = require('tape').test
var stream = require('stream-mixin')
var observe = require('../')

run('it works', function(test) {
  test.plan(2)

  var done = false
  var model = { key: 'value' }
  var input = document.createElement('input')
  input.type = 'checkbox'

  observe.call(model)
  stream.call(input)

  input.readable = true
  input.writable = true
  input.write = function(data) {
    input.value = data.key
    if (done) {
      return
    }
    done = true
    input.click()
  }
  
  model.pipe(input).pipe(model)

  input.onclick = function() {
    test.equal(input.value, 'new value')
    input.emit('data', { key: 'newer value' })
    test.equal(model.key, 'newer value')
  }

  model.key = 'new value'
})
