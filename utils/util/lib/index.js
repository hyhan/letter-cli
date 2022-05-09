'use strict'

function isObject(o) {
  return Object.prototype.toString.call(o) === '[Object object]'
}

module.exports = {
  isObject,
}
