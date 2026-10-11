import * as vscode from 'vscode'

import { getConfig } from './config'
import { getImagesFromDataTransfer, UPLOAD_EDIT_KIND, UPLOAD_EDIT_TITLE, uploadImageSources } from './dataTransfer'

export class UploadonDropProvider implements vscode.DocumentDropEditProvider {
  static readonly metadata: vscode.DocumentDropEditProviderMetadata = {
    providedDropEditKinds: [UPLOAD_EDIT_KIND],
    dropMimeTypes: ['text/uri-list', 'files', 'image/*'],
  }

  async provideDocumentDropEdits(
    _document: vscode.TextDocument,
    _position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): Promise<vscode.DocumentDropEdit | undefined> {
    if (!getConfig('enableDragUpload')) return undefined
    const images = await getImagesFromDataTransfer(dataTransfer)
    if (!images.length || token.isCancellationRequested) return undefined
    // Upload now since VS Code does not call resolveDocumentDropEdit (it sends drop resolves to paste providers).
    const output = await uploadImageSources(images, token)
    return output ? new vscode.DocumentDropEdit(output, UPLOAD_EDIT_TITLE, UPLOAD_EDIT_KIND) : undefined
  }
}
