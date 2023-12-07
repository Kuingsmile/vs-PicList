import fs from 'fs-extra'
import * as path from 'path'
import * as vscode from 'vscode'
import { Editor } from './Editor'
import { Uploader } from './uploader'
import { getRemoteServerMode, showError } from './utils'
import { isURL } from '../utils'
import { DataStore, IStringKeyObject } from './db'
import axios from 'axios'
import getClipboardImage from './clipboard/getClipboardImage'

export class Commands {
  static commandManager: Commands = new Commands()

  async uploadCommand(input?: string[], shouldKeepAfterUploading = true) {
    const output = await Uploader.picgoAPI.upload(input)

    if (!output) return
    if (shouldKeepAfterUploading === false && input) {
      fs.removeSync(input[0])
    }
    vscode.env.clipboard.writeText(output)
    await Editor.writeToEditor(output)
    return output
  }

  async uploadImageFromClipboard() {
    if (getRemoteServerMode()) {
      const { imgPath, shouldKeepAfterUploading } = await getClipboardImage()
      this.uploadCommand([imgPath], shouldKeepAfterUploading)
    } else {
      this.uploadCommand()
    }
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

  async openImageDB() {
    const filePath = DataStore.dataStore.conUploadedFileDBPath
    if (fs.existsSync(filePath)) {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath))
    } else {
      showError('No uploaded image.')
    }
  }

  async uploadImageFromStringList(input: string[]) {
    return await this.uploadCommand(input.map(item => path.resolve(item.trim())))
  }

  async DeleteImage(items: IStringKeyObject[]): Promise<boolean> {
    if (items.length === 0) return true
    try {
      const res = await axios.post(
        Uploader.picgoAPI.getDeleteAPIUrl(),
        {
          list: items
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (res.status === 200 && res.data.success) {
        DataStore.removeUploadedFileDBItem(items)
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
