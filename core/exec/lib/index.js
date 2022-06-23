'use strict'

const path = require('path')
const log = require('@letter-cli/log')
const Package = require('@letter-cli/package')
const { exec: spawn } = require('@letter-cli/util')

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
    try {
      const cmd = args[args.length - 1]
      const o = Object.create(null)
      Object.keys(cmd).forEach((key) => {
        if (
          // eslint-disable-next-line no-prototype-builtins
          cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent'
        ) {
          o[key] = cmd[key]
        }
      })
      args[args.length - 1] = o
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
      child.on('error', (e) => {
        log.error(e.message)
        process.exit(1)
      })
      child.on('exit', (e) => {
        log.verbose(`命令执行成功:${e}`)
        process.exit(e)
      })
    } catch (e) {
      log.error(e.message)
    }
  }
}

module.exports = exec
