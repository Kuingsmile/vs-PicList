import path from 'node:path'

import * as vscode from 'vscode'

import { getNLSText } from '../../utils/meta'
import type { UploadInput } from '../uploader'

export function addPeriod(message: string) {
  return !message.endsWith('.') && !message.endsWith('!') ? message + '.' : message
}

export function decorateMessage(message: string): string {
  return `${getNLSText('ext.displayName')}: ${addPeriod(message)}`
}

export const showWarning = async (message: string) => await vscode.window.showWarningMessage(decorateMessage(message))

export const showError = async (message: string) => await vscode.window.showErrorMessage(decorateMessage(message))

export const showInfo = async (message: string) => await vscode.window.showInformationMessage(decorateMessage(message))

/** Shows an error unless the user cancelled the operation. */
export function handleError(error: unknown) {
  if (error instanceof vscode.CancellationError) return
  showError(error instanceof Error ? error.message : String(error))
}

/** Local files are uploaded by path; files in remote workspaces are read through VS Code. */
export async function toUploadInput(uri: vscode.Uri): Promise<UploadInput> {
  if (uri.scheme === 'file') return uri.fsPath
  return { name: path.posix.basename(uri.path), data: await vscode.workspace.fs.readFile(uri) }
}

export async function isFile(uri: vscode.Uri): Promise<boolean> {
  try {
    return ((await vscode.workspace.fs.stat(uri)).type & vscode.FileType.File) !== 0
  } catch {
    return false
  }
}
