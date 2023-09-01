import * as vscode from 'vscode'
import { Commands } from './commands'

const uriListMime = 'text/uri-list'

export class UploadonDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    _document: vscode.TextDocument,
    _position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentDropEdit | undefined> {
    const dataTransferItem = dataTransfer.get(uriListMime)
    if (!dataTransferItem) return undefined
    const urlList = await dataTransferItem.asString()
    if (token.isCancellationRequested) return undefined
    const uris: vscode.Uri[] = []
    for (const resource of urlList.split('\n')) {
      try {
        uris.push(vscode.Uri.parse(resource))
      } catch {}
    }
    if (!uris.length) return undefined

    const snippet = new vscode.SnippetString()
    await Commands.commandManager.uploadImageFromStringList(uris.map(item => item.fsPath))

    return new vscode.DocumentDropEdit(snippet)
  }
}
