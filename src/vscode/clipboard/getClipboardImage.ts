import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { formatTimestamp, isImagePath } from '../../utils'
import { getAppDataPath } from '../utils/appDataPath'
import linuxClipboardScript from './linux.sh'
import macClipboardScript from './mac.applescript'
import windowsClipboardScript from './windows.ps1'
import windows10ClipboardScript from './windows10.ps1'

type Platform = 'darwin' | 'win32' | 'win10' | 'linux'

function getCurrentPlatform(): Platform {
  const platform = process.platform
  if (platform === 'win32') {
    return os.release().split('.')[0] === '10' ? 'win10' : 'win32'
  }
  return platform === 'darwin' ? 'darwin' : 'linux'
}

const platform2ScriptContent: Record<Platform, string> = {
  darwin: macClipboardScript,
  win32: windowsClipboardScript,
  win10: windows10ClipboardScript,
  linux: linuxClipboardScript,
}

const platform2ScriptFilename: Record<Platform, string> = {
  darwin: 'mac.applescript',
  win32: 'windows.ps1',
  win10: 'windows10.ps1',
  linux: 'linux.sh',
}

export interface IClipboardImage {
  imgPath: string
  /** `false` for the temporary file the clipboard image was saved to, which is removed after uploading. */
  shouldKeepAfterUploading: boolean
}

function appDataPath() {
  const dir = getAppDataPath('vs-piclist')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function ImageSaveDir() {
  const dir = path.join(appDataPath(), 'piclist-clipboard-image')
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/** Writes the clipboard script, replacing copies left by older versions of the extension. */
function ensureScript(platform: Platform) {
  const scriptPath = path.join(appDataPath(), platform2ScriptFilename[platform])
  const content = platform2ScriptContent[platform]
  let current: string | undefined
  try {
    current = fs.readFileSync(scriptPath, 'utf8')
  } catch {}
  if (current !== content) fs.writeFileSync(scriptPath, content, 'utf8')
  return scriptPath
}

function runScript(platform: Platform, scriptPath: string, imagePath: string) {
  const [command, args] =
    platform === 'darwin'
      ? ['osascript', [scriptPath, imagePath]]
      : platform === 'linux'
        ? ['sh', [scriptPath, imagePath]]
        : [
            'powershell',
            [
              '-noprofile',
              '-noninteractive',
              '-nologo',
              '-sta',
              '-executionpolicy',
              'unrestricted',
              '-file',
              scriptPath,
              imagePath,
            ],
          ]
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const execution = spawn(command, args, { timeout: 30_000, windowsHide: true })
    let stdout = ''
    let stderr = ''
    execution.stdout.on('data', (data: Buffer) => (stdout += data.toString()))
    execution.stderr.on('data', (data: Buffer) => (stderr += data.toString()))
    execution.on('error', reject)
    // The scripts may exit with 1 after printing a path, so their output decides the result.
    execution.on('close', () => resolve({ stdout, stderr }))
  })
}

/** Saves the clipboard image to a temporary file, or returns the image files copied to the clipboard. */
const getClipboardImage = async (): Promise<IClipboardImage[]> => {
  const imagePath = path.join(ImageSaveDir(), `${formatTimestamp()}.png`)
  const platform = getCurrentPlatform()
  const { stdout, stderr } = await runScript(platform, ensureScript(platform), imagePath)
  const lines = stdout
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
  if (!lines.length) throw new Error(stderr.trim() || 'Failed to read the clipboard')
  if (lines[0] === 'no image') return []
  if (lines[0] === 'no xclip' || lines[0] === 'no wl-clipboard') {
    throw new Error('Please install xclip (for X11) or wl-clipboard (for Wayland) to upload clipboard images')
  }
  const missing = lines.find(line => !fs.existsSync(line))
  if (missing) throw new Error(`Can't find ${missing}`)
  return lines
    .filter(isImagePath)
    .map(imgPath => ({ imgPath, shouldKeepAfterUploading: path.resolve(imgPath) !== path.resolve(imagePath) }))
}

export default getClipboardImage
