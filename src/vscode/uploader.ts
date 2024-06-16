import * as vscode from 'vscode'
import { showError, getRemoteServerMode, getFileName } from './utils'
import axios from 'axios'
import { Editor } from './Editor'
import { handleUrlEncode } from '../utils'
import { DataStore } from './db'
import FormData from 'form-data'
import fs from 'fs-extra'

export class Uploader {
  static picgoAPI = new Uploader()

  constructor() {}

  getUploadAPIUrl(): string {
    if (vscode.workspace) {
      return vscode.workspace.getConfiguration('piclist').get('uploadAPIUrl') || 'http://127.0.0.1:36677/upload'
    }
    return 'http://127.0.0.1:36677/upload'
  }

  getDeleteAPIUrl(): string {
    if (vscode.workspace) {
      return vscode.workspace.getConfiguration('piclist').get('deleteAPIUrl') || 'http://127.0.0.1:36677/delete'
    }
    return 'http://127.0.0.1:36677/delete'
  }

  getCopyType(): string {
    if (vscode.workspace) {
      return vscode.workspace.getConfiguration('piclist').get('copyType') || 'markdown'
    }
    return 'markdown'
  }

  getCustomType(): string {
    if (vscode.workspace) {
      return vscode.workspace.getConfiguration('piclist').get('customType') || '![$fileName]($url)'
    }
    return '![$fileName]($url)'
  }

  getEncodeUrl(): boolean {
    if (vscode.workspace) {
      return vscode.workspace.getConfiguration('piclist').get('encodeUrl') || false
    }
    return false
  }

  async upload(input?: string[], getFileNameFromRes = false): Promise<string> {
    try {
      let res
      if (getRemoteServerMode()) {
        const formData = new FormData()
        const fileLists = input!.map(item => {
          return fs.createReadStream(item)
        })
        for (const file of fileLists) {
          formData.append('file', file)
        }
        res = await axios.post(this.getUploadAPIUrl(), formData, {
          headers: {
            ...formData.getHeaders()
          }
        })
      } else {
        res = await axios.post(
          this.getUploadAPIUrl(),
          {
            list: input || []
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
      if (res.status === 200 && res.data.success) {
        const selectedText = Editor.editor?.document.getText(Editor.editor.selection)
        const output = res.data.result.map((item: string) => {
          return this.formatOutput(item, getFileName(item, selectedText, getFileNameFromRes))
        })
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
