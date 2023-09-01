import fs from 'fs-extra'
import * as path from 'path'
import * as vscode from 'vscode'
import { Editor } from './Editor'
import { Uploader } from './uploader'
import { showError } from './utils'
import { isURL } from '../utils'
import { DataStore, IStringKeyObject } from './db'
import axios from 'axios'

export class Commands {
  static commandManager: Commands = new Commands()

  async uploadCommand(input?: string[]) {
    const output = await Uploader.picgoAPI.upload(input)

    if (!output) return
    vscode.env.clipboard.writeText(output)
    await Editor.writeToEditor(output)
    return output
  }

  async uploadImageFromClipboard() {
    this.uploadCommand()
  }

  async uploadImageFromExplorer() {
    const result = await vscode.window.showOpenDialog({
      filters: {
        Images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'svg']
      },
      canSelectMany: true
    })

    if (result != null) {
      const input = result.map(item => item.fsPath)
      this.uploadCommand(input.map(item => path.resolve(item)))
    }
  }

  async uploadImageFromInputBox() {
    let result = await vscode.window.showInputBox({
      placeHolder: 'Please input an local image path or URL'
    })
    const imageReg = /\.(png|jpg|jpeg|webp|gif|bmp|tiff|ico|svg)$/
    if (isURL(result)) {
      return await this.uploadCommand([result!])
    } else if (result && imageReg.test(result)) {
      result = path.isAbsolute(result) ? result : path.join(Editor.editor?.document.uri.fsPath ?? '', '../', result)
      if (fs.existsSync(result)) {
        return await this.uploadCommand([result])
      } else {
        showError('No such file.')
      }
    } else if (result !== '') {
      showError('Error input.')
    }
  }

  async DeleteImage(item: IStringKeyObject): Promise<boolean> {
    if (Object.keys(item).length === 0) return false
    try {
      const res = await axios.post(
        Uploader.picgoAPI.getDeleteAPIUrl(),
        {
          list: [item]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (res.status === 200 && res.data.success) {
        DataStore.removeUploadedFileDBItem(item)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
