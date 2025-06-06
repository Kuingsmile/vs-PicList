import vscode, { window } from 'vscode'
import { IMessageToShow } from '../../utils'
import { getNLSText } from '../../utils/meta'

export function addPeriod(message: string) {
  return !message.endsWith('.') && !message.endsWith('!') ? message + '.' : message
}

export function decorateMessage(message: string): string {
  return `${getNLSText('ext.displayName')}: ${addPeriod(message)}`
}

export const showWarning = async (message: string) => await window.showWarningMessage(decorateMessage(message))

export const showError = async (message: string) => await window.showErrorMessage(decorateMessage(message))

export const showInfo = async (message: string) =>
  await window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'message',
      cancellable: false
    },
    async progress => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          progress.report({ increment: i * 10, message })
        }, 100000)
      }
    }
  )

export const showMessage = (messageToShow: IMessageToShow) => {
  switch (messageToShow.type) {
    case 'warning':
      showWarning(messageToShow.message)
      break
    case 'error':
      showError(messageToShow.message)
      break
    case 'info':
      showInfo(messageToShow.message)
      break
    default:
  }
}

export function getRemoteServerMode(): boolean {
  return vscode.workspace ? vscode.workspace.getConfiguration('piclist').get('remoteServerMode') || false : false
}

export function getFileName(item: string, selectedText?: string, getFileNameFromRes = false): string {
  let fileName: string = ''
  if (selectedText && !getFileNameFromRes) {
    fileName = selectedText
  } else {
    try {
      const url = new URL(item)
      const pathSep = url.pathname.includes('/') ? '/' : '\\'
      fileName = decodeURIComponent(url.pathname.split(pathSep).pop() || '') || ''
    } catch (error) {}
  }
  return fileName || ''
}
