import path from 'node:path'

import * as vscode from 'vscode'

import { isImagePath, parseUriList } from '../utils'
import { IUploadFile, Uploader } from './uploader'
import { handleError, toUploadInput } from './utils'

/** An image to upload from a drop or paste: a file to read later, or content held only in memory. */
export type ImageSource = vscode.Uri | IUploadFile

export const UPLOAD_EDIT_KIND = vscode.DocumentDropOrPasteEditKind.Empty.append('piclist', 'upload')

export const UPLOAD_EDIT_TITLE = 'Upload image with PicList'

/** Collects the images being dropped or pasted, such as files from the OS, the explorer, or a screenshot. */
export async function getImagesFromDataTransfer(dataTransfer: vscode.DataTransfer): Promise<ImageSource[]> {
  const uris = new Map<string, vscode.Uri>()
  const uriList = await dataTransfer.get('text/uri-list')?.asString()
  for (const value of parseUriList(uriList ?? '')) {
    let uri: vscode.Uri
    try {
      uri = vscode.Uri.parse(value, true)
    } catch {
      continue
    }
    // Web URLs are links rather than files to upload.
    if (uri.scheme !== 'http' && uri.scheme !== 'https' && isImagePath(uri.path)) uris.set(uri.toString(), uri)
  }
  const images: ImageSource[] = [...uris.values()]
  // VS Code lists files from the OS in the uri-list. Their `DataTransferFile.uri` is unusable since VS Code parses the
  // native path as a URI, which turns `C:\a.png` into a URI with the scheme `C`, so only read the content of files
  // missing from the list, such as screenshots.
  const listedNames = new Set([...uris.values()].map(uri => path.posix.basename(uri.path)))
  for (const [mime, item] of dataTransfer) {
    const file = item.asFile()
    if (!file || listedNames.has(file.name) || !(mime.startsWith('image/') || isImagePath(file.name))) continue
    // Read content now since the data transfer is only valid during the drop or paste.
    images.push({ name: file.name, data: await file.data(), mime: mime.startsWith('image/') ? mime : undefined })
  }
  return images
}

/** Uploads the images and returns the text to insert, or an empty string after reporting a failure. */
export async function uploadImageSources(
  images: ImageSource[],
  token: vscode.CancellationToken,
  preferredName?: string,
): Promise<string> {
  try {
    const input = await Promise.all(images.map(image => (image instanceof vscode.Uri ? toUploadInput(image) : image)))
    const uploaded = await Uploader.picgoAPI.upload(input, token)
    return Uploader.picgoAPI.formatOutput(uploaded, preferredName)
  } catch (error) {
    handleError(error)
    return ''
  }
}
