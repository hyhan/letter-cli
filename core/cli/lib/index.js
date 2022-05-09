'use strict'
const { homedir } = require('os')
const path = require('path')
const fs = require('fs')
const log = require('@letter-cli/log')
const { getNpmSemverVersion } = require('@letter-cli/get-npm-info')
const semver = require('semver')
const commander = require('commander')
const colors = require('colors/safe')
const pkg = require('../package.json')
const constant = require('./constant')

const program = new commander.Command()
const userHome = homedir()

async function cli() {
  try {
    await prepare()
    await registerCommand()
  } catch (e) {
    log.error(e.message)
    log.verbose(e)
  }
}

async function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  // init command
  program
    .command('init [projectName')
    .option('-f, --force', '是否强制初始化项目')
    .action(function (projectName, options, cmdObj) {
      console.log(projectName, options, cmdObj)
    })

  // 开启debug模式
  program.on('option:debug', function () {
    const opts = program.opts()
    if (opts.debug) {
      process.env.LOG_LEVEL = 'verbose'
      log.level = process.env.LOG_LEVEL
    }
    log.verbose('debug模式开启')
  })

  // 指定targetPath
  program.on('option:targetPath', function (targetPath) {
    if (targetPath) {
      process.env.CLI_TARGET_PATH = targetPath
    }
  })

  // 对未知的命令监听
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name())
    console.log(colors.red(`位置的命令：${obj[0]}`))
    if (availableCommands.length > 0) {
      console.log(colors.red(`可用的命令：${availableCommands.join(',')}`))
    }
  })

  program.parse(process.argv)
}

async function prepare() {
  checkPkgVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
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

async function checkGlobalUpdate() {
  const currentVersion = pkg.version
  const npmName = pkg.name
  const latestVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${latestVersion}
                更新命令： npm install -g ${npmName}`)
    )
  }
}

module.exports = cli
