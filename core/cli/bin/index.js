#! /usr/bin/env node

const importLocal = require('import-local')
const log = require('@letter-cli/log')

if (importLocal(__filename)) {
  log.info('cli', '正在使用 letter-cli 本地版本')
} else {
  require('../lib')()
}
