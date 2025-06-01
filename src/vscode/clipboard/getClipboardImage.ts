import macClipboardScript from './mac.applescript'
import windowsClipboardScript from './windows.ps1'
import windows10ClipboardScript from './windows10.ps1'
import linuxClipboardScript from './linux.sh'
import os from 'os'
import { getAppDataPath } from '../utils/appDataPath'
import path from 'path'
import fs from 'fs-extra'
import dayjs from 'dayjs'
import { spawn } from 'child_process'

type Platform = 'darwin' | 'win32' | 'win10' | 'linux'

function getCurrentPlatform(): Platform {
  const platform = process.platform
  if (platform === 'win32') {
    return os.release().split('.')[0] === '10' ? 'win10' : 'win32'
  }
  return platform === 'darwin' ? 'darwin' : 'linux'
}

const platform2ScriptContent: { [key in Platform]: string } = {
  darwin: macClipboardScript,
  win32: windowsClipboardScript,
  win10: windows10ClipboardScript,
  linux: linuxClipboardScript
}

const platform2ScriptFilename: { [key in Platform]: string } = {
  darwin: 'mac.applescript',
  win32: 'windows.ps1',
  win10: 'windows10.ps1',
  linux: 'linux.sh'
}

interface IClipboardImage {
  imgPath: string
  shouldKeepAfterUploading: boolean
}

function appDataPath() {
  const dir = getAppDataPath('vs-piclist')
  fs.ensureDirSync(dir)
  return dir
}

function ImageSaveDir() {
  const dir = path.join(appDataPath(), 'piclist-clipboard-image')
  fs.emptyDirSync(dir)
  return dir
}

const getClipboardImage = async (): Promise<IClipboardImage> => {
  const imageSaveDir = ImageSaveDir()
  const imagePath = path.join(imageSaveDir, `${dayjs().format('YYYYMMDDHHmmss')}.png`)
  return await new Promise<IClipboardImage>((resolve, reject) => {
    const platform = getCurrentPlatform()
    const scriptPath = path.join(appDataPath(), platform2ScriptFilename[platform])
    if (!fs.existsSync(scriptPath)) {
      fs.writeFileSync(scriptPath, platform2ScriptContent[platform], 'utf8')
    }
    let execution
    if (platform === 'darwin') {
      execution = spawn('osascript', [scriptPath, imagePath])
    } else if (platform === 'win32' || platform === 'win10') {
      execution = spawn('powershell', [
        '-noprofile',
        '-noninteractive',
        '-nologo',
        '-sta',
        '-executionpolicy',
        'unrestricted',
        '-file',
        scriptPath,
        imagePath
      ])
    } else {
      execution = spawn('sh', [scriptPath, imagePath])
    }

    execution.stdout.on('data', (data: Buffer) => {
      if (platform === 'linux' && data.toString().trim() === 'no xclip or wl-clipboard') {
        return reject(new Error('Please install xclip(for x11) or wl-clipboard(for wayland) before run picgo'))
      }
      const imgPath = data.toString().trim()
      let shouldKeepAfterUploading = false
      if (path.basename(imgPath) !== path.basename(imagePath) && fs.existsSync(imgPath)) {
        shouldKeepAfterUploading = true
      }
      if (imgPath !== 'no image' && !fs.existsSync(imgPath)) {
        return reject(new Error(`Can't find ${imgPath}`))
      }
      resolve({ imgPath, shouldKeepAfterUploading })
    })
  })
}

export default getClipboardImage
