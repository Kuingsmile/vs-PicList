import * as vscode from 'vscode'

import { CopyType, DEFAULT_CUSTOM_TYPE, IFormatOptions } from '../utils/format'

interface IPicListConfig {
  uploadAPIUrl: string
  deleteAPIUrl: string
  copyType: CopyType
  customType: string
  encodeUrl: boolean
  remoteServerMode: boolean
  enableDragUpload: boolean
  enablePasteUpload: boolean
  skipRemoteImages: boolean
  serverKey: string
  picbed: string
  configName: string
}

// Used when a setting is missing or set to an empty value.
const defaults: IPicListConfig = {
  uploadAPIUrl: 'http://127.0.0.1:36677/upload',
  deleteAPIUrl: 'http://127.0.0.1:36677/delete',
  copyType: 'markdown',
  customType: DEFAULT_CUSTOM_TYPE,
  encodeUrl: false,
  remoteServerMode: false,
  enableDragUpload: true,
  enablePasteUpload: false,
  skipRemoteImages: false,
  serverKey: '',
  picbed: '',
  configName: '',
}

export function getConfig<K extends keyof IPicListConfig>(key: K): IPicListConfig[K] {
  const value = vscode.workspace.getConfiguration('piclist').get<IPicListConfig[K]>(key)
  return value === undefined || value === null || value === '' ? defaults[key] : value
}

export const getFormatOptions = (): IFormatOptions => ({
  copyType: getConfig('copyType'),
  customType: getConfig('customType'),
  encodeUrl: getConfig('encodeUrl'),
})
