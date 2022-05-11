'use strict'
const fs = require('fs')
const path = require('path')
const { isObject } = require('@letter-cli/util')
const npminstall = require('npminstall')
const fse = require('fs-extra')
const pkgDir = require('pkg-dir')
const formatPath = require('@letter-cli/format-path')
const {
  getNpmLatestVersion,
  getDefaultRegistry,
} = require('@letter-cli/get-npm-info')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空！')
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象！')
    }
    // package的目标路径
    this.targetPath = options.targetPath
    // 缓存package的路径
    this.storeDir = options.storeDir
    // package的name
    this.packageName = options.packageName
    // package的version
    this.packageVersion = options.packageVersion
    // package 的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if (this.storeDir && !fs.existsSync(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    )
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    )
  }

  // 判断当前package是否已经存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return fs.existsSync(this.cacheFilePath)
    } else {
      return fs.existsSync(this.targetPath)
    }
  }

  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    })
  }

  async update() {
    await this.prepare()
    // 1. 获取最新的npm模块版本号
    const latestVersion = await getNpmLatestVersion(this.packageName)
    // 2. 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestVersion)
    // 3. 如果不存在，则直接安装最新版本
    if (!fs.existsSync(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestVersion,
          },
        ],
      })
      this.packageVersion = latestVersion
    } else {
      this.packageVersion = latestVersion
    }
  }

  // 获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
