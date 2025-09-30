import { homedir, platform } from 'node:os'
import { join } from 'node:path'

function getForWindows() {
  return join(homedir(), 'AppData', 'Roaming')
}

function getForMac() {
  return join(homedir(), 'Library', 'Application Support')
}

function getForLinux() {
  return join(homedir(), '.config')
}

function getFallback() {
  return platform().startsWith('win') ? getForWindows() : getForLinux()
}

function getAppDataPath(app?: string) {
  let appDataPath = process.env['APPDATA']
  if (!appDataPath) {
    switch (platform()) {
      case 'win32':
        appDataPath = getForWindows()
        break
      case 'darwin':
        appDataPath = getForMac()
        break
      case 'linux':
        appDataPath = getForLinux()
        break
      default:
        appDataPath = getFallback()
    }
  }
  if (!app) return appDataPath
  const normalizedAppName = appDataPath !== homedir() ? app : '.' + app
  return join(appDataPath, normalizedAppName)
}

export { getAppDataPath }
