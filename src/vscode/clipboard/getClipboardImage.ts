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
    const currentOS = os.release().split('.')[0]
    if (currentOS === '10') {
      return 'win10'
    } else {
      return 'win32'
    }
  } else if (platform === 'darwin') {
    return 'darwin'
  } else {
    return 'linux'
  }
}

const platform2ScriptContent: {
  [key in Platform]: string
} = {
  darwin: macClipboardScript,
  win32: windowsClipboardScript,
  win10: windows10ClipboardScript,
  linux: linuxClipboardScript
}

const platform2ScriptFilename: {
  [key in Platform]: string
} = {
  darwin: 'mac.applescript',
  win32: 'windows.ps1',
  win10: 'windows10.ps1',
  linux: 'linux.sh'
}

interface IClipboardImage {
  imgPath: string
  /**
   * if the path is generate by picgo -> false
   * if the path is a real file path in system -> true
   */
  shouldKeepAfterUploading: boolean
}

function appDataPath() {
  const appDataPath = getAppDataPath('vs-piclist')
  fs.ensureDirSync(appDataPath)
  return appDataPath
}

function ImageSaveDir() {
  const imageSavePath = path.join(appDataPath(), 'piclist-clipboard-image')
  fs.ensureDirSync(imageSavePath)
  return imageSavePath
}

const getClipboardImage = async (): Promise<IClipboardImage> => {
  const imageSaveDir = ImageSaveDir()
  const imagePath = path.join(imageSaveDir, `${dayjs().format('YYYYMMDDHHmmss')}.png`)
  return await new Promise<IClipboardImage>((resolve: any, reject: any): void => {
    const platform = getCurrentPlatform()
    const scriptPath = path.join(appDataPath(), platform2ScriptFilename[platform])
    // If the script does not exist yet, we need to write the content to the script file
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
        // fix windows 10 native cmd crash bug when "picgo upload"
        // https://github.com/PicGo/PicGo-Core/issues/32
        // '-windowstyle','hidden',
        // '-noexit',
        '-file',
        scriptPath,
        imagePath
      ])
    } else {
      execution = spawn('sh', [scriptPath, imagePath])
    }

    execution.stdout.on('data', (data: Buffer) => {
      if (platform === 'linux') {
        if (data.toString().trim() === 'no xclip or wl-clipboard') {
          return reject(new Error('Please install xclip(for x11) or wl-clipboard(for wayland) before run picgo'))
        }
      }
      const imgPath = data.toString().trim()

      // if the filePath is the real file in system
      // we should keep it instead of removing
      let shouldKeepAfterUploading = false

      // in macOS if your copy the file in system, it's basename will not equal to our default basename
      if (path.basename(imgPath) !== path.basename(imagePath)) {
        // if the path is not generate by picgo
        // but the path exists, we should keep it
        if (fs.existsSync(imgPath)) {
          shouldKeepAfterUploading = true
        }
      }
      // if the imgPath is invalid
      if (imgPath !== 'no image' && !fs.existsSync(imgPath)) {
        return reject(new Error(`Can't find ${imgPath}`))
      }

      resolve({
        imgPath,
        shouldKeepAfterUploading
      })
    })
  })
}

export default getClipboardImage
