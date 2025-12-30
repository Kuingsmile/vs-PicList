import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs-extra'
import * as vscode from 'vscode'

import { handleUrlEncode } from '../utils'
import { DataStore } from './db'
import { Editor } from './Editor'
import { getFileName, getRemoteServerMode, showError } from './utils'

export class Uploader {
  static picgoAPI = new Uploader()
  constructor() {}

  getUploadAPIUrl(): string {
    return vscode.workspace
      ? vscode.workspace.getConfiguration('piclist').get('uploadAPIUrl') || 'http://127.0.0.1:36677/upload'
      : 'http://127.0.0.1:36677/upload'
  }

  getDeleteAPIUrl(): string {
    return vscode.workspace
      ? vscode.workspace.getConfiguration('piclist').get('deleteAPIUrl') || 'http://127.0.0.1:36677/delete'
      : 'http://127.0.0.1:36677/delete'
  }

  getCopyType(): string {
    return vscode.workspace ? vscode.workspace.getConfiguration('piclist').get('copyType') || 'markdown' : 'markdown'
  }

  getCustomType(): string {
    return vscode.workspace
      ? vscode.workspace.getConfiguration('piclist').get('customType') || '![$fileName]($url)'
      : '![$fileName]($url)'
  }

  getEncodeUrl(): boolean {
    return vscode.workspace ? vscode.workspace.getConfiguration('piclist').get('encodeUrl') || false : false
  }

  async upload(input?: string[], getFileNameFromRes = false): Promise<string> {
    try {
      let res
      if (getRemoteServerMode()) {
        const formData = new FormData()
        input!.forEach(item => formData.append('file', fs.createReadStream(item)))
        res = await axios.post(this.getUploadAPIUrl(), formData, {
          headers: { ...formData.getHeaders() },
        })
      } else {
        res = await axios.post(
          this.getUploadAPIUrl(),
          { list: input || [] },
          { headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (res.status === 200 && res.data.success) {
        const selectedText = Editor.editor?.document.getText(Editor.editor.selection)
        const output = res.data.result.map((item: string) =>
          this.formatOutput(item, getFileName(item, selectedText, getFileNameFromRes)),
        )
        const outputStr = output.join('\n')
        DataStore.writeUploadedFileDB(res.data.fullResult)
        return outputStr
      } else {
        showError(res.data.message)
        return ''
      }
    } catch (e: any) {
      showError(String(e))
      return ''
    }
  }

  formatOutput(url: string, fileName: string): string {
    const encodeUrl = this.getEncodeUrl() ? handleUrlEncode(url) : url
    switch (this.getCopyType()) {
      case 'markdown':
        return `![${fileName}](${encodeUrl})`
      case 'html':
        return `<img src="${encodeUrl}" alt="${fileName}">`
      case 'url':
        return encodeUrl
      case 'ubb':
        return `[img]${encodeUrl}[/img]`
      case 'custom':
        return this.getCustomType()
          ? this.getCustomType()
              .replace(/\$fileName/g, fileName)
              .replace(/\$url/g, encodeUrl)
          : '![$fileName]($url)'.replace(/\$fileName/g, fileName).replace(/\$url/g, encodeUrl)
      default:
        return encodeUrl
    }
  }
}

export interface INotice {
  body: string
  text: string
  title: string
}
