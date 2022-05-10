'use strict'

const semver = require('semver')
const axios = require('axios')
const urlJoin = require('url-join')

function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? 'https://registry.npmjs.org'
    : 'https://registry.npm.taobao.org'
}

async function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null
  }
  const registryUrl = registry || getDefaultRegistry()
  const npmPath = urlJoin(registryUrl, npmName)
  return axios
    .get(npmPath)
    .then((response) => {
      if (response.status === 200) {
        return response.data
      }
      return null
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1))
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const semverVersions = getSemverVersions(baseVersion, versions)
  if (semverVersions && semverVersions.length > 0) {
    return semverVersions[0]
  }
  return null
}

async function getNpmLatestVersion(npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a)[0])
  }
  return null
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmLatestVersion,
  getSemverVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
}
