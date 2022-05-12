'use strict'
/**
 * 兼容 windows | macOS 路径的分隔符
 * windows => \\ 作为路径分隔符
 * macOS => / 作为路径分隔符
 */
const path = require('path')

function formatPath(p) {
  if (p && typeof p === 'string') {
    const { sep } = path
    if (sep === '/') {
      return p
    } else {
      // windows 环境
      return p.replace(/\\/g, '/')
    }
  }
  return p
}

module.exports = formatPath
