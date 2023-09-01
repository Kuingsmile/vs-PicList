import * as vscode from 'vscode'
import { Commands } from './vscode/commands'
import { DataStore } from './vscode/db'
import { extractUrl } from './utils'

export async function activate(context: vscode.ExtensionContext) {
  const disposable = [
    vscode.commands.registerCommand(
      'piclist.uploadFromClipboard',
      async () => await Commands.commandManager.uploadImageFromClipboard()
    ),
    vscode.commands.registerCommand(
      'piclist.uploadFromExplorer',
      async () => await Commands.commandManager.uploadImageFromExplorer()
    ),
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
    })
  ]
  context.subscriptions.push(...disposable)

  return context
}

export function deactivate() {}
