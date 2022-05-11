'use strict'

const log = require('@letter-cli/log')
// const Package = require('@letter-cli/package')

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  console.log(targetPath, homePath)
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)
}

module.exports = exec
