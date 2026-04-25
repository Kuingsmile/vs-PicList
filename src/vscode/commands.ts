import * as path from 'node:path'

import axios from 'axios'
import fs from 'fs-extra'
import * as vscode from 'vscode'

import { isURL } from '../utils'
import getClipboardImage from './clipboard/getClipboardImage'
import { DataStore, IStringKeyObject } from './db'
import { Editor } from './Editor'
import { Uploader } from './uploader'
import { getRemoteServerMode, showError } from './utils'

export class Commands {
  static commandManager: Commands = new Commands()

  async uploadCommand(
    input?: string[],
    shouldKeepAfterUploading = true,
    writeToEditor = true,
    getFileNameFromRes = false,
  ) {
    const output = await Uploader.picgoAPI.upload(input, getFileNameFromRes)
    if (!output) return
    if (!shouldKeepAfterUploading && input) fs.removeSync(input[0])
    if (writeToEditor) {
      vscode.env.clipboard.writeText(output)
      // 先嘗試偵測游標所在行是否已有 ![alt](url) 結構
      // 若有，僅替換 URL 保留 alt text；否則走原本整段插入邏輯
      const replaced = await Uploader.picgoAPI.replaceUrlInCurrentLine(output)
      if (!replaced) {
        await Editor.writeToEditor(output)
      }
    }
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
      filters: { Images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'svg'] },
      canSelectMany: true,
    })
    if (result) {
      const input = result.map(item => path.resolve(item.fsPath))
      this.uploadCommand(input)
    }
  }

  async uploadImageFromInputBox() {
    let result = await vscode.window.showInputBox({ placeHolder: 'Please input an local image path or URL' })
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
    if (!items.length) return true
    try {
      const res = await axios.post(
        Uploader.picgoAPI.getDeleteAPIUrl(),
        { list: items },
        { headers: { 'Content-Type': 'application/json' } },
      )
      if (res.status === 200 && res.data.success) {
        DataStore.removeUploadedFileDBItem(items)
        return true
      }
      return false
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async uploadAllImgInFile(selected = false) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    const document = editor.document
    let text = selected && !editor.selection.isEmpty ? document.getText(editor.selection) : document.getText()
    const textLength = text.length
    const config = vscode.workspace.getConfiguration('piclist')
    const formats: string[] = config.get('uploadSourceFormats') ?? ['markdown']
    const parts: string[] = []
    if (formats.includes('markdown')) parts.push(String.raw`(?:!\[.*?\]\((?<md>[^)]*)\))`)
    if (formats.includes('html'))     parts.push(String.raw`(?:<img[^>]*src="(?<html>[^"]*)"[^>]*>)`)
    if (formats.includes('url'))      parts.push(String.raw`(?<url>https?:\/\/[^\s]+)`)
    if (formats.includes('ubb'))      parts.push(String.raw`(?:\[img\](?<ubb>[^\[]*)\[\/img\])`)
    if (parts.length === 0) return
    const regex = new RegExp(parts.join('|'), 'g')
    let match
    const uploadedImages: Record<string, string> = {}
    const matches = []
    while ((match = regex.exec(text)) !== null) matches.push(match)
    for (const match of matches) {
      const imgSyntax = match[0]
      const url = match.groups?.md ?? match.groups?.html ?? match.groups?.url ?? match.groups?.ubb
      if (url) {
        let res: string | undefined = uploadedImages[url]
        if (!res) {
          const skipRemote: boolean = config.get('skipRemoteImages') ?? true
          if (isURL(url)) {
            if (!skipRemote) res = await this.uploadCommand([url], true, false, true)
          } else {
            const decodedUrl = decodeURIComponent(url)
            const localPath = path.isAbsolute(decodedUrl) ? decodedUrl : path.join(document.uri.fsPath, '../', decodedUrl)
            if (fs.existsSync(localPath)) {
              res = await this.uploadCommand([localPath], true, false, true)
            }
          }
          if (res) uploadedImages[url] = res
        }
        if (res) text = text.replace(imgSyntax, res)
      }
    }
    const range =
      selected && !editor.selection.isEmpty
        ? editor.selection
        : new vscode.Range(document.positionAt(0), document.positionAt(textLength))
    editor.edit(editBuilder => {
      editBuilder.replace(range, text)
    })
  }

  async uploadSelectedImg() {
    const editor = vscode.window.activeTextEditor
    if (editor) await this.uploadAllImgInFile(true)
  }
}
