'use strict'

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function exec() {}

module.exports = {
  isObject,
  exec,
}
