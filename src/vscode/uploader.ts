import { readFile } from 'node:fs/promises'
import path from 'node:path'

import * as vscode from 'vscode'

import { buildApiUrl, isHttpUrl } from '../utils'
import { formatImage, getFileName } from '../utils/format'
import { getConfig, getFormatOptions } from './config'
import { DataStore, IStringKeyObject } from './db'

/** A local file path, a remote URL, or file content to upload. */
export type UploadInput = string | IUploadFile

export interface IUploadFile {
  name: string
  data: Uint8Array
  mime?: string
}

export interface IUploadedImage {
  url: string
  fullResult?: IStringKeyObject
}

interface IPicListResponse {
  success?: boolean
  message?: string
  result?: unknown
  fullResult?: unknown
  stage?: string
  finalizationId?: string
}

/** Thrown when the PicList server cannot be reached, so batch uploads can stop early. */
export class ConnectionError extends Error {}

const connectionErrorCodes = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
])

const jsonHeaders = { 'Content-Type': 'application/json' }

const isObject = (value: unknown): value is IStringKeyObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

async function createFormData(files: UploadInput[]): Promise<FormData> {
  const formData = new FormData()
  for (const item of files) {
    const file: IUploadFile =
      typeof item === 'string' ? { name: path.basename(item), data: await readFile(item) } : item
    formData.append('file', new Blob([file.data], { type: file.mime }), file.name)
  }
  return formData
}

function toRequestError(error: unknown, url: string): Error {
  if (error instanceof Error && error.name === 'AbortError') return new vscode.CancellationError()
  const code = (error as { cause?: { code?: string } } | undefined)?.cause?.code
  if (code && connectionErrorCodes.has(code)) {
    return new ConnectionError(
      `Cannot connect to ${new URL(url).origin}. Make sure PicList or PicList-Core is running with its server enabled`,
    )
  }
  return error instanceof Error ? error : new Error(String(error))
}

export class Uploader {
  static picgoAPI = new Uploader()

  getUploadAPIUrl(params: Record<string, string> = {}): string {
    return buildApiUrl(getConfig('uploadAPIUrl'), {
      key: getConfig('serverKey'),
      picbed: getConfig('picbed'),
      configName: getConfig('configName'),
      ...params,
    })
  }

  getDeleteAPIUrl(): string {
    return buildApiUrl(getConfig('deleteAPIUrl'), { key: getConfig('serverKey') })
  }

  /**
   * Uploads images through the PicList server, which uploads its clipboard image when `input` is empty.
   * Throws when nothing was uploaded.
   */
  async upload(input: UploadInput[] = [], token?: vscode.CancellationToken): Promise<IUploadedImage[]> {
    const remoteServerMode = getConfig('remoteServerMode')
    // The server reads paths and URLs itself, but a remote server cannot read files on this machine.
    const isSentAsFile = (item: UploadInput) => typeof item !== 'string' || (remoteServerMode && !isHttpUrl(item))
    const files = input.filter(isSentAsFile)
    const list = input.filter((item): item is string => !isSentAsFile(item))
    const images: IUploadedImage[] = []
    if (list.length || !files.length) {
      images.push(...(await this.send(JSON.stringify({ list }), jsonHeaders, token)))
    }
    if (files.length) {
      images.push(...(await this.send(await createFormData(files), undefined, token)))
    }
    return images
  }

  /** Deletes uploaded images and returns the IDs of the images PicList deleted. */
  async delete(items: IStringKeyObject[]): Promise<Set<string>> {
    const data = await this.post(this.getDeleteAPIUrl(), JSON.stringify({ list: items }), jsonHeaders)
    // Recent PicList versions report each item; older versions only report overall success.
    const deletedIds = Array.isArray(data.result)
      ? data.result.filter(item => isObject(item) && item.success).map(item => String(item.id))
      : data.success
        ? items.map(item => String(item.id))
        : []
    if (!deletedIds.length) throw new Error(data.message || 'Delete failed')
    return new Set(deletedIds)
  }

  formatOutput(images: IUploadedImage[], preferredName?: string): string {
    const options = getFormatOptions()
    return images.map(image => formatImage(image.url, getFileName(image.url, preferredName), options)).join('\n')
  }

  private async send(
    body: string | FormData,
    headers: Record<string, string> | undefined,
    token?: vscode.CancellationToken,
  ): Promise<IUploadedImage[]> {
    let data = await this.post(this.getUploadAPIUrl(), body, headers, token)
    // PicList asks for a retry when the image was uploaded but its post-processing failed.
    if (!data.success && data.stage === 'finalization' && data.finalizationId) {
      const url = this.getUploadAPIUrl({ finalizationId: data.finalizationId })
      data = await this.post(url, JSON.stringify({ list: [] }), jsonHeaders, token)
    }
    if (!data.success) throw new Error(data.message || 'Upload failed')
    const urls = Array.isArray(data.result) ? data.result : []
    const fullResults = Array.isArray(data.fullResult) ? data.fullResult : []
    // Skip failed items instead of writing them out as `![](null)`.
    const images = urls.flatMap((url, index): IUploadedImage[] =>
      typeof url === 'string' && url.trim()
        ? [{ url: url.trim(), fullResult: isObject(fullResults[index]) ? fullResults[index] : undefined }]
        : [],
    )
    if (!images.length) throw new Error(data.message || 'Upload failed: the server returned no image URL')
    DataStore.writeUploadedFileDB(images.flatMap(image => (image.fullResult ? [image.fullResult] : [])))
    return images
  }

  private async post(
    url: string,
    body: string | FormData,
    headers?: Record<string, string>,
    token?: vscode.CancellationToken,
  ): Promise<IPicListResponse> {
    const controller = new AbortController()
    const subscription = token?.onCancellationRequested(() => controller.abort())
    try {
      const requestUrl = new URL(url)
      const requestHeaders = new Headers(headers)
      // Fetch rejects credentials in a URL, so send them as HTTP Basic authentication instead.
      if (requestUrl.username || requestUrl.password) {
        const credentials = `${decodeURIComponent(requestUrl.username)}:${decodeURIComponent(requestUrl.password)}`
        requestHeaders.set('Authorization', `Basic ${Buffer.from(credentials).toString('base64')}`)
        requestUrl.username = ''
        requestUrl.password = ''
      }
      const response = await fetch(requestUrl, {
        method: 'POST',
        body,
        headers: requestHeaders,
        signal: controller.signal,
      })
      const text = await response.text()
      let data: unknown
      try {
        data = JSON.parse(text)
      } catch {}
      // PicList also reports errors such as unknown endpoints in a JSON body.
      if (isObject(data)) return data
      throw new Error(
        response.ok
          ? 'Unexpected response from the PicList server'
          : `PicList server responded with ${response.status} ${response.statusText}`.trim(),
      )
    } catch (error) {
      throw toRequestError(error, url)
    } finally {
      subscription?.dispose()
    }
  }
}
