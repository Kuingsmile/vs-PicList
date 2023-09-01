import vscode, { window } from 'vscode'
import { IMessageToShow } from '../../utils'
import { getNLSText } from '../../utils/meta'

export function addPeriod(message: string) {
  if (!message.endsWith('.') && !message.endsWith('!')) {
    message = message + '.'
  }
  return message
}

export function decorateMessage(message: string): string {
  message = addPeriod(message)
  return `${getNLSText('ext.displayName')}: ${message}`
}

export const showWarning = async (message: string) => {
  message = decorateMessage(message)
  return await window.showWarningMessage(message)
}

export const showError = async (message: string) => {
  message = decorateMessage(message)
  return await window.showErrorMessage(message)
}

export const showInfo = async (message: string) => {
  message = decorateMessage(message)
  return await window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'message',
      cancellable: false
    },
    async (progress) => {
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          progress.report({ increment: i * 10, message })
        }, 100000)
      }
    }
  )
}

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