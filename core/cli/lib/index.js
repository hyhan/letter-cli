'use strict'
const { homedir } = require('os')
const path = require('path')
const fs = require('fs')
const log = require('@letter-cli/log')
// const semver = require('semver')
const commander = require('commander')
const colors = require('colors/safe')
const pkg = require('../package.json')
const constant = require('./constant')

const program = new commander.Command()
const userHome = homedir()

async function cli() {
  try {
    console.log(userHome)
    await prepare()
    await registerCommand()
  } catch (e) {
    log.error(e.message)
    log.verbose(e)
  }
}

async function registerCommand() {
  program.version(pkg.version).option('-d, --debug', '是否开启调试模式', false)

  // 开启debug模式
  program.on('option:debug', function () {
    const opts = program.opts()
    if (opts.debug) {
      process.env.LOG_LEVEL = 'verbose'
      log.level = process.env.LOG_LEVEL
    }
    log.verbose('debug模式开启')
  })

  program.parse(process.argv)
}

async function prepare() {
  checkPkgVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
}

function checkPkgVersion() {
  log.info('version', pkg.version)
}

function checkRoot() {
  require('root-check')()
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, constant.DEFAULT_CONFIG_FILENAME)
  if (fs.existsSync(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    })
  }
  createDefaultConfig()
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  const cliHome = path.join(
    userHome,
    process.env.CLI_HOME ? process.env.CLI_HOME : constant.DEFAULT_CLI_HOME
  )
  cliConfig.cliHome = cliHome
  process.env.CLI_HOME_PATH = cliHome
}

module.exports = cli
