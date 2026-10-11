import * as vscode from 'vscode'

import { Commands } from './vscode/commands'
import { UploadonDropProvider } from './vscode/dropProvider'
import { UploadOnPasteProvider } from './vscode/pasteProvider'

export function activate(context: vscode.ExtensionContext) {
  // Exact schemes rank these providers ahead of the built-in Markdown ones, so uploading is the default action.
  const selector: vscode.DocumentSelector = [
    { scheme: 'file' },
    { scheme: 'untitled' },
    { scheme: 'vscode-remote' },
    { scheme: 'vscode-notebook-cell' },
  ]
  const commands = Commands.commandManager
  context.subscriptions.push(
    vscode.commands.registerCommand('piclist.uploadFromClipboard', () => commands.uploadImageFromClipboard()),
    vscode.commands.registerCommand('piclist.uploadFromExplorer', (uri?: vscode.Uri, uris?: vscode.Uri[]) =>
      commands.uploadImageFromExplorer(uri, uris),
    ),
    vscode.commands.registerCommand('piclist.openImageDB', () => commands.openImageDB()),
    vscode.commands.registerCommand('piclist.uploadFromInputBox', () => commands.uploadImageFromInputBox()),
    vscode.commands.registerCommand('piclist.deleteImage', () => commands.deleteImage()),
    vscode.commands.registerCommand('piclist.uploadSelectedImg', () => commands.uploadSelectedImg()),
    vscode.commands.registerCommand('piclist.uploadAllImgInFile', () => commands.uploadAllImgInFile()),
    vscode.languages.registerDocumentDropEditProvider(
      selector,
      new UploadonDropProvider(),
      UploadonDropProvider.metadata,
    ),
    vscode.languages.registerDocumentPasteEditProvider(
      selector,
      new UploadOnPasteProvider(),
      UploadOnPasteProvider.metadata,
    ),
  )
}

export function deactivate() {}
