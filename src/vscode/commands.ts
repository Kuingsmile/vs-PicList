import fs from 'node:fs'
import path from 'node:path'

import * as vscode from 'vscode'

import { handleUrlEncode, IMAGE_EXTENSIONS, isHttpUrl, isImagePath, isSameUrl, safeDecodeURIComponent } from '../utils'
import { filterReferencesByRanges, findImageReferences, IImageReference } from '../utils/imageSyntax'
import getClipboardImage, { IClipboardImage } from './clipboard/getClipboardImage'
import { getConfig } from './config'
import { DataStore } from './db'
import { Editor } from './Editor'
import { ConnectionError, Uploader, UploadInput } from './uploader'
import { handleError, isFile, showError, showInfo, showWarning, toUploadInput } from './utils'

const dataImageRegex = /^data:(image\/[\w.+-]+);base64,([\s\S]*)$/i

/** Resolves an image path written in `document`, with relative paths starting from the document's folder. */
function resolveImageUri(target: string, document?: vscode.TextDocument): vscode.Uri | undefined {
  if (/^file:\/\//i.test(target)) return vscode.Uri.parse(target)
  const base =
    document && !document.isUntitled
      ? vscode.Uri.joinPath(document.uri, '..')
      : vscode.workspace.workspaceFolders?.[0]?.uri
  if (!base || base.scheme === 'file') {
    if (path.isAbsolute(target)) return vscode.Uri.file(target)
    return base && vscode.Uri.file(path.resolve(base.fsPath, target))
  }
  return target.startsWith('/') ? base.with({ path: target }) : vscode.Uri.joinPath(base, target)
}

/** Finds a local image, also trying the percent-decoded path since Markdown paths are often encoded. */
async function findLocalImage(target: string, document?: vscode.TextDocument): Promise<vscode.Uri | undefined> {
  for (const candidate of new Set([target, safeDecodeURIComponent(target)])) {
    const uri = resolveImageUri(candidate, document)
    if (uri && (await isFile(uri))) return uri
  }
}

/** Returns what to upload for an image reference and a key identifying the image, or `undefined` if not found. */
async function getUploadSource(
  url: string,
  document: vscode.TextDocument,
): Promise<{ key: string; input: UploadInput } | undefined> {
  const target = url.trim()
  if (isHttpUrl(target)) return { key: target, input: target }
  const dataImage = dataImageRegex.exec(target)
  if (dataImage) {
    const [, mime, base64] = dataImage
    const extension = mime.split('/')[1].split('+')[0]
    const data = Buffer.from(base64, 'base64')
    return { key: target, input: { name: `image.${extension}`, data, mime } }
  }
  if (!isImagePath(target)) return undefined
  const uri = await findLocalImage(target, document)
  return uri && { key: uri.toString(), input: await toUploadInput(uri) }
}

/**
 * Finds the images to work on: all images in the document, or with `selected`, the images overlapping a
 * selection or at a cursor.
 */
function getImageReferences(editor: vscode.TextEditor, selected: boolean, allBareUrls = false): IImageReference[] {
  const { document } = editor
  const skipCode = document.languageId === 'markdown'
  const references = findImageReferences(document.getText(), { skipCode, allBareUrls })
  if (!selected) return references
  const ranges = editor.selections.map(
    selection => [document.offsetAt(selection.start), document.offsetAt(selection.end)] as const,
  )
  return filterReferencesByRanges(references, ranges)
}

/** Tracks the original image URLs as edits shift their offsets, dropping URLs that are changed or removed. */
function trackImageReferences(document: vscode.TextDocument, references: IImageReference[]) {
  let ranges = references.map(reference => ({ start: reference.urlStart, end: reference.urlEnd }))
  const subscription = vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document !== document) return
    // Each change uses offsets from before the event, so apply changes from the end of the document.
    const changes = [...event.contentChanges].sort((a, b) => b.rangeOffset - a.rangeOffset)
    for (const change of changes) {
      const changeEnd = change.rangeOffset + change.rangeLength
      const delta = change.text.length - change.rangeLength
      ranges = ranges.flatMap(range => {
        if (changeEnd <= range.start) return [{ start: range.start + delta, end: range.end + delta }]
        if (change.rangeOffset >= range.end) return [range]
        return []
      })
    }
  })
  return {
    contains: (reference: IImageReference) =>
      ranges.some(range => range.start === reference.urlStart && range.end === reference.urlEnd),
    dispose: () => subscription.dispose(),
  }
}

/** Returns the range of a reference, extended to the whole line if the reference is all the line holds. */
function getRemovalRange(document: vscode.TextDocument, reference: IImageReference): vscode.Range {
  const range = new vscode.Range(document.positionAt(reference.start), document.positionAt(reference.end))
  const line = document.lineAt(range.start.line)
  if (range.isSingleLine && line.text.trim() === document.getText(range)) return line.rangeIncludingLineBreak
  return range
}

const withUploadProgress = <T>(task: () => Promise<T>) =>
  vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'PicList: Uploading...' }, task)

export class Commands {
  static commandManager: Commands = new Commands()

  /** Uploads images, then inserts the result at the cursor and copies it to the clipboard. */
  async uploadCommand(input?: UploadInput[], tempFiles: string[] = []) {
    const editor = Editor.editor
    const selectedText = Editor.getSelectedText(editor)
    try {
      const images = await withUploadProgress(() => Uploader.picgoAPI.upload(input))
      const output = Uploader.picgoAPI.formatOutput(images, selectedText)
      await vscode.env.clipboard.writeText(output)
      const inserted = await Editor.writeToEditor(output, editor)
      if (!inserted) showInfo('Uploaded, and the result was copied to the clipboard')
      return output
    } catch (error) {
      handleError(error)
    } finally {
      for (const file of tempFiles) fs.rmSync(file, { force: true })
    }
  }

  async uploadImageFromClipboard() {
    // PicList reads its own clipboard unless it runs on another machine.
    if (!getConfig('remoteServerMode')) return await this.uploadCommand()
    let images: IClipboardImage[]
    try {
      images = await getClipboardImage()
    } catch (error) {
      return handleError(error)
    }
    if (!images.length) return showInfo('No image in the clipboard')
    const paths = images.map(image => image.imgPath)
    const tempFiles = images.filter(image => !image.shouldKeepAfterUploading).map(image => image.imgPath)
    return await this.uploadCommand(paths, tempFiles)
  }

  /** Uploads the files selected in the explorer, or files picked in a dialog when run as a command. */
  async uploadImageFromExplorer(uri?: vscode.Uri, uris?: vscode.Uri[]) {
    let selected = uris?.length ? uris : uri instanceof vscode.Uri ? [uri] : undefined
    if (!selected) {
      const document = Editor.editor?.document
      selected = await vscode.window.showOpenDialog({
        filters: { Images: IMAGE_EXTENSIONS },
        canSelectMany: true,
        defaultUri: document && !document.isUntitled ? vscode.Uri.joinPath(document.uri, '..') : undefined,
      })
      if (!selected) return
    }
    const images = selected.filter(item => isImagePath(item.path))
    if (!images.length) return showWarning('No image selected')
    try {
      return await this.uploadCommand(await Promise.all(images.map(toUploadInput)))
    } catch (error) {
      handleError(error)
    }
  }

  async uploadImageFromInputBox() {
    const result = await vscode.window.showInputBox({ placeHolder: 'Please input a local image path or URL' })
    // Allow paths copied with quotes, as Windows "Copy as path" does.
    const value = result?.trim().replace(/^(["'])(.*)\1$/, '$2')
    if (!value) return
    if (isHttpUrl(value)) return await this.uploadCommand([value])
    if (!isImagePath(value)) return showError('Please input an image path or URL')
    const uri = await findLocalImage(value, Editor.editor?.document)
    if (!uri) return showError('No such file')
    try {
      return await this.uploadCommand([await toUploadInput(uri)])
    } catch (error) {
      handleError(error)
    }
  }

  async openImageDB() {
    if (!DataStore.readUploadedFileDB().length) return showInfo('No uploaded image')
    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(DataStore.dataStore.conUploadedFileDBPath))
  }

  /** Deletes the selected images, or the image at the cursor, from the image host and the document. */
  async deleteImage() {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    const { document } = editor
    const references = getImageReferences(editor, true, true)
    if (!references.length) return showInfo('No image URL found in the selection')
    const items = DataStore.searchUploadedFileDB(references.map(reference => reference.url))
    if (!items.length) {
      return showWarning('Image not found in the upload history. Only images uploaded with PicList can be deleted')
    }
    const confirm = await vscode.window.showWarningMessage(
      `Delete ${items.length} image(s) from the image host? This cannot be undone.`,
      { modal: true },
      'Delete',
    )
    if (confirm !== 'Delete') return
    let deletedIds: Set<string>
    try {
      deletedIds = await Uploader.picgoAPI.delete(items)
    } catch (error) {
      return handleError(error)
    }
    DataStore.removeUploadedFileDBItem(deletedIds)
    const deletedUrls = items.filter(item => deletedIds.has(String(item.id))).map(item => String(item.imgUrl))
    const edit = new vscode.WorkspaceEdit()
    for (const reference of references) {
      if (deletedUrls.some(url => isSameUrl(url, reference.url))) {
        edit.delete(document.uri, getRemovalRange(document, reference))
      }
    }
    await vscode.workspace.applyEdit(edit)
    const failed = items.length - deletedIds.size
    if (failed > 0) showError(`Failed to delete ${failed} image(s)`)
  }

  /** Uploads the images in the document and replaces only their URLs, keeping alt text and other attributes. */
  async uploadAllImgInFile(selected = false) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    const { document } = editor
    const skipRemoteImages = getConfig('skipRemoteImages')
    const references = getImageReferences(editor, selected).filter(
      reference => !(skipRemoteImages && isHttpUrl(reference.url)),
    )
    const urls = [...new Set(references.map(reference => reference.url))]
    if (!urls.length) return showInfo(selected ? 'No image found in the selection' : 'No image found')

    const version = document.version
    const uploadedUrls = new Map<string, string>()
    const notFound: string[] = []
    const errors: string[] = []
    const tracked = selected ? trackImageReferences(document, references) : undefined
    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'PicList', cancellable: true },
        async (progress, token) => {
          // Different paths can lead to the same image, so remember uploads by image.
          const uploadedByKey = new Map<string, string>()
          for (const [index, url] of urls.entries()) {
            if (token.isCancellationRequested) break
            progress.report({ message: `Uploading ${index + 1}/${urls.length}`, increment: 100 / urls.length })
            try {
              const source = await getUploadSource(url, document)
              if (!source) {
                notFound.push(url)
                continue
              }
              let uploadedUrl = uploadedByKey.get(source.key)
              if (!uploadedUrl) {
                const [image] = await Uploader.picgoAPI.upload([source.input], token)
                uploadedUrl = image.url
                uploadedByKey.set(source.key, uploadedUrl)
              }
              uploadedUrls.set(url, uploadedUrl)
            } catch (error) {
              if (error instanceof vscode.CancellationError) break
              errors.push(error instanceof Error ? error.message : String(error))
              // The remaining uploads would fail the same way.
              if (error instanceof ConnectionError) break
            }
          }
        },
      )
    } finally {
      tracked?.dispose()
    }

    // Rescan after edits while keeping selected uploads limited to their original image URLs.
    const current =
      document.version === version
        ? references
        : getImageReferences(editor, false).filter(reference => !tracked || tracked.contains(reference))
    const encodeUrl = getConfig('encodeUrl')
    const edit = new vscode.WorkspaceEdit()
    for (const reference of current) {
      const uploadedUrl = uploadedUrls.get(reference.url)
      if (!uploadedUrl) continue
      const range = new vscode.Range(document.positionAt(reference.urlStart), document.positionAt(reference.urlEnd))
      edit.replace(document.uri, range, encodeUrl ? handleUrlEncode(uploadedUrl) : uploadedUrl)
    }
    if (edit.size) await vscode.workspace.applyEdit(edit)

    if (notFound.length) showWarning(`Image not found: ${notFound.join(', ')}`)
    if (errors.length) {
      showError(`Failed to upload ${urls.length - uploadedUrls.size - notFound.length} image(s): ${errors[0]}`)
    } else if (uploadedUrls.size) {
      showInfo(`Uploaded ${uploadedUrls.size} image(s)`)
    }
  }

  async uploadSelectedImg() {
    await this.uploadAllImgInFile(true)
  }
}
