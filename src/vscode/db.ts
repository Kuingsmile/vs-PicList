import { getAppDataPath } from './utils/appDataPath'
import path from 'path'
import fs from 'fs-extra'

export interface IStringKeyObject {
  [key: string]: any
}

export class DataStore {
  static dataStore: DataStore = new DataStore()
  private constructor() {}

  get appDataPath() {
    const dir = getAppDataPath('vs-piclist')
    fs.ensureDirSync(dir)
    return dir
  }

  get conUploadedFileDBPath() {
    return path.join(this.appDataPath, 'uploadedFileDB.json')
  }

  static writeUploadedFileDB(data: IStringKeyObject[]) {
    try {
      const originData = DataStore.readUploadedFileDB() || []
      const newData = [...originData, ...data]
      fs.writeJSONSync(DataStore.dataStore.conUploadedFileDBPath, newData)
    } catch (error) {
      console.error(error)
    }
  }

  static readUploadedFileDB(): IStringKeyObject[] {
    try {
      fs.ensureFileSync(DataStore.dataStore.conUploadedFileDBPath)
      return fs.readJSONSync(DataStore.dataStore.conUploadedFileDBPath)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static searchUploadedFileDB(urls: string[]): IStringKeyObject[] {
    const data = DataStore.readUploadedFileDB()
    return urls
      .map(url => data.find(item => item.imgUrl === url || decodeURI(item.imgUrl) === url))
      .filter(Boolean) as IStringKeyObject[]
  }

  static removeUploadedFileDBItem(items: IStringKeyObject[]) {
    const data = DataStore.readUploadedFileDB()
    for (const item of items) {
      const index = data.findIndex((i: IStringKeyObject) => i.id === item.id)
      if (index !== -1) data.splice(index, 1)
    }
    fs.writeJSONSync(DataStore.dataStore.conUploadedFileDBPath, data)
  }
}
