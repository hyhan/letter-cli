'use strict'

const path = require('path')
const log = require('@letter-cli/log')
const Package = require('@letter-cli/package')

const SETTING = {
  init: '@letter-cli/init',
}

const CACHE_DIR = 'dependencies'

async function exec(...args) {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const cmdObj = args[args.length - 1]
  const cmdName = cmdObj.name()

  const packageName = SETTING[cmdName]
  const packageVersion = 'latest'

  let storeDir = ''
  let pkg

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      packageName,
      packageVersion,
      targetPath,
      storeDir,
    })
    if (await pkg.exists()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }
  const rootFile = pkg.getRootFilePath()
  if (rootFile) {
    require(rootFile)(args)
  }
}

module.exports = exec
