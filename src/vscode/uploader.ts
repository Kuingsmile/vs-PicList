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
        // 嘗試從游標所在行讀取既有的 alt text（格式：![alt text](url 或空白)）
        const existingAltText = this.getExistingAltText()
        const output = res.data.result.map((item: string) =>
          this.formatOutput(item, getFileName(item, existingAltText || selectedText, getFileNameFromRes)),
        )
        const outputStr = output.join('\n')
        DataStore.writeUploadedFileDB(res.data.fullResult)
        return outputStr
      } else {
        showError(res.data.message)
        return ''
      }
    } catch (e: any) {
      await showError(String(e))
      return ''
    }
  }

  // 讀取游標所在行，偵測是否已有 ![alt text]() 或 ![alt text](現有url) 結構
  // 若有，回傳 alt text；若無，回傳空字串
  getExistingAltText(): string {
    const editor = Editor.editor
    if (!editor) return ''
    const line = editor.document.lineAt(editor.selection.active.line).text
    // 比對 ![任意內容](任意內容或空白) 的格式
    const match = line.match(/!\[([^\]]*)\]\([^)]*\)/)
    if (match) {
      return match[1] // 回傳 [] 內的文字
    }
    return ''
  }

  // 若游標所在行已有 ![alt](舊url) 結構，則僅替換 () 內的 URL，不整行覆蓋
  async replaceUrlInCurrentLine(newMarkdown: string): Promise<boolean> {
    const editor = Editor.editor
    if (!editor) return false
    const lineIndex = editor.selection.active.line
    const line = editor.document.lineAt(lineIndex).text
    const mdRegex = /!\[([^\]]*)\]\([^)]*\)/
    if (mdRegex.test(line)) {
      // 從 newMarkdown 取出新 URL
      const newUrlMatch = newMarkdown.match(/!\[[^\]]*\]\(([^)]+)\)/)
      const newAltMatch = newMarkdown.match(/!\[([^\]]*)\]/)
      if (!newUrlMatch) return false
      const newUrl = newUrlMatch[1]
      // 保留原始行的 alt text，不使用上傳結果的 fileName
      const origAltMatch = line.match(/!\[([^\]]*)\]/)
      const origAlt = origAltMatch ? origAltMatch[1] : (newAltMatch ? newAltMatch[1] : '')
      const updatedLine = line.replace(mdRegex, `![${origAlt}](${newUrl})`)
      const range = new vscode.Range(
        new vscode.Position(lineIndex, 0),
        new vscode.Position(lineIndex, line.length),
      )
      await editor.edit(editBuilder => editBuilder.replace(range, updatedLine))
      return true
    }
    return false
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
