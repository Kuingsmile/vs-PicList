import * as vscode from 'vscode'

import { extractUrl } from './utils'
import { Commands } from './vscode/commands'
import { DataStore } from './vscode/db'
import { UploadonDropProvider } from './vscode/dropProvider'

export async function activate(context: vscode.ExtensionContext) {
  const selector: vscode.DocumentSelector = {
    language: '*',
    scheme: 'file'
  }
  const disposable = [
    vscode.commands.registerCommand(
      'piclist.uploadFromClipboard',
      async () => await Commands.commandManager.uploadImageFromClipboard()
    ),
    vscode.commands.registerCommand(
      'piclist.uploadFromExplorer',
      async () => await Commands.commandManager.uploadImageFromExplorer()
    ),
    vscode.commands.registerCommand('piclist.openImageDB', async () => await Commands.commandManager.openImageDB()),
    vscode.commands.registerCommand(
      'piclist.uploadFromInputBox',
      async () => await Commands.commandManager.uploadImageFromInputBox()
    ),
    vscode.commands.registerCommand('piclist.deleteImage', async () => {
      const editor = vscode.window.activeTextEditor

      if (editor) {
        const document = editor.document
        const selection = editor.selection
        const text = document.getText(selection)
        const extractedURL = extractUrl(text)
        if (extractedURL) {
          const res = DataStore.searchUploadedFileDB(extractedURL)
          const result = await Commands.commandManager.DeleteImage(res)
          if (result) {
            editor.edit(editBuilder => {
              editBuilder.delete(selection)
            })
          } else {
            vscode.window.showErrorMessage('Delete failed.')
          }
        }
      }
    }),
    vscode.commands.registerCommand('piclist.uploadSelectedImg', async () => {
      await Commands.commandManager.uploadSelectedImg()
    }),
    vscode.commands.registerCommand('piclist.uploadAllImgInFile', async () => {
      await Commands.commandManager.uploadAllImgInFile()
    })
  ]
  context.subscriptions.push(...disposable)
  context.subscriptions.push(vscode.languages.registerDocumentDropEditProvider(selector, new UploadonDropProvider()))

  return context
}

export function deactivate() {}
