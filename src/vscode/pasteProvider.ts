import * as vscode from 'vscode'

import { getConfig } from './config'
import {
  getImagesFromDataTransfer,
  ImageSource,
  UPLOAD_EDIT_KIND,
  UPLOAD_EDIT_TITLE,
  uploadImageSources,
} from './dataTransfer'

class UploadPasteEdit extends vscode.DocumentPasteEdit {
  constructor(
    readonly images: ImageSource[],
    readonly preferredName: string | undefined,
  ) {
    super('', UPLOAD_EDIT_TITLE, UPLOAD_EDIT_KIND)
  }
}

export class UploadOnPasteProvider implements vscode.DocumentPasteEditProvider<UploadPasteEdit> {
  static readonly metadata: vscode.DocumentPasteProviderMetadata = {
    providedPasteEditKinds: [UPLOAD_EDIT_KIND],
    pasteMimeTypes: ['image/*', 'files', 'text/uri-list'],
  }

  async provideDocumentPasteEdits(
    document: vscode.TextDocument,
    ranges: readonly vscode.Range[],
    dataTransfer: vscode.DataTransfer,
    context: vscode.DocumentPasteEditContext,
    token: vscode.CancellationToken,
  ): Promise<UploadPasteEdit[] | undefined> {
    // "Paste As" can ask for this edit by kind even when uploading on paste is off.
    const isRequested = context.triggerKind === vscode.DocumentPasteTriggerKind.PasteAs
    if (isRequested ? !context.only?.contains(UPLOAD_EDIT_KIND) : !getConfig('enablePasteUpload')) return undefined
    const images = await getImagesFromDataTransfer(dataTransfer)
    if (!images.length || token.isCancellationRequested) return undefined
    // Use selected text as the alt text, like the clipboard upload command does.
    const selectedText = ranges.length === 1 && ranges[0].isSingleLine ? document.getText(ranges[0]) : undefined
    const edit = new UploadPasteEdit(images, selectedText)
    if (isRequested) {
      // VS Code applies edits picked through "Paste As" without resolving them, so upload now.
      edit.insertText = await uploadImageSources(images, token, selectedText)
      return edit.insertText ? [edit] : undefined
    }
    // Apps such as Word and Excel copy text together with a picture of it, so keep pasting their text by default.
    const text = await dataTransfer.get('text/plain')?.asString()
    if (text?.trim()) edit.yieldTo = [vscode.DocumentDropOrPasteEditKind.Text]
    return [edit]
  }

  // Uploading here rather than when providing the edit skips the upload if another paste option is used.
  async resolveDocumentPasteEdit(edit: UploadPasteEdit, token: vscode.CancellationToken): Promise<UploadPasteEdit> {
    if (!edit.insertText) edit.insertText = await uploadImageSources(edit.images, token, edit.preferredName)
    return edit
  }
}
