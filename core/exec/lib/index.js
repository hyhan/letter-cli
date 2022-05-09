'use strict'

const log = require('@letter-cli/log')

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH

  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)
}

module.exports = exec
