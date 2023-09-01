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
    const appDataPath = getAppDataPath('vs-piclist')
    console.log('appDataPath', appDataPath)
    fs.ensureDirSync(appDataPath)
    return appDataPath
  }

  get conUploadedFileDBPath() {
    return path.join(this.appDataPath, 'uploadedFileDB.json')
  }

  static writeUploadedFileDB(data: IStringKeyObject[]) {
    try {
      const originData = DataStore.readUploadedFileDB() || []
      console.log('data', data)
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

  static searchUploadedFileDB(url: string): IStringKeyObject {
    const data = DataStore.readUploadedFileDB()
    const res = data.find(item => item.imgUrl === url || decodeURI(item.imgUrl) === url) || {}
    return res
  }

  static removeUploadedFileDBItem(item: IStringKeyObject) {
    const data = DataStore.readUploadedFileDB()
    const newData = data.filter((i: IStringKeyObject) => i.id !== item.id)
    fs.writeJSONSync(DataStore.dataStore.conUploadedFileDBPath, newData)
  }
}
