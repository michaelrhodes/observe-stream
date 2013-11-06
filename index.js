var stream = require('stream-mixin')

var defineProperty = function(context, property, value) {
  var _value = value
  
  // Prepare to redefine existing properties.
  if (context.hasOwnProperty(property)) {
    _value = context[property]
    delete context[property]
  }

  // Emit data events when the property changes.
  Object.defineProperty(context, property, {
    get: function() {
      return _value
    },
    set: function(value) {
      _value = value
      var data = {}
      data[property] = _value
      context.emit('data', data)
    }
  })
}

module.exports = function() {

  // Redefine existing properties so
  // that changes produce data events.
  for (var property in this) {
    defineProperty(this, property) 
  }

  // Update existing properties.
  this.write = function(data) {
    for (var property in data) {
      if (this.hasOwnProperty(property)) {
        this[property] = data[property]
      }
    }
  }
  
  // Allow additional properties to be added
  // after the mixin has been called.
  this.define = function(name, value) {
    defineProperty(this, name, value)
  }

  // Mixin duplex stream
  stream.call(this)
  this.readable = true
  this.writable = true

}
