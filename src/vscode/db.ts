import fs from 'node:fs'
import path from 'node:path'

import { formatTimestamp, isSameUrl } from '../utils'
import { getAppDataPath } from './utils/appDataPath'

export type IStringKeyObject = Record<string, any>

export class DataStore {
  static dataStore: DataStore = new DataStore()
  private constructor() {}

  get appDataPath() {
    const dir = getAppDataPath('vs-piclist')
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  get conUploadedFileDBPath() {
    return path.join(this.appDataPath, 'uploadedFileDB.json')
  }

  static writeUploadedFileDB(data: IStringKeyObject[]) {
    if (!data.length) return
    try {
      DataStore.save([...DataStore.readUploadedFileDB(), ...data])
    } catch (error) {
      console.error(error)
    }
  }

  static readUploadedFileDB(): IStringKeyObject[] {
    const filePath = DataStore.dataStore.conUploadedFileDBPath
    let content: string
    try {
      content = fs.readFileSync(filePath, 'utf8')
    } catch {
      return []
    }
    if (!content.trim()) return []
    try {
      const data = JSON.parse(content)
      if (Array.isArray(data)) return data
    } catch {}
    // Set unreadable history aside so the next write does not overwrite it.
    try {
      fs.renameSync(filePath, `${filePath}.${formatTimestamp()}.bak`)
    } catch (error) {
      console.error(error)
    }
    return []
  }

  static searchUploadedFileDB(urls: string[]): IStringKeyObject[] {
    const data = DataStore.readUploadedFileDB()
    const items = urls
      .map(url => data.find(item => typeof item.imgUrl === 'string' && isSameUrl(item.imgUrl, url)))
      .filter(item => item !== undefined)
    return [...new Set(items)]
  }

  static removeUploadedFileDBItem(ids: ReadonlySet<string>) {
    const data = DataStore.readUploadedFileDB()
    DataStore.save(data.filter(item => !ids.has(String(item.id))))
  }

  private static save(data: IStringKeyObject[]) {
    fs.writeFileSync(DataStore.dataStore.conUploadedFileDBPath, JSON.stringify(data))
  }
}
