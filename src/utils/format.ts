import { handleUrlEncode, safeDecodeURIComponent } from '.'

export type CopyType = 'markdown' | 'html' | 'url' | 'ubb' | 'custom'

export interface IFormatOptions {
  copyType: CopyType
  customType: string
  encodeUrl: boolean
}

export const DEFAULT_CUSTOM_TYPE = '![$fileName]($url)'

/** Uses `preferredName` (such as the selected text) or else the file name in the URL. */
export function getFileName(url: string, preferredName?: string): string {
  if (preferredName) return preferredName
  try {
    return safeDecodeURIComponent(new URL(url).pathname.split('/').pop() || '')
  } catch {
    return ''
  }
}

export function formatImage(url: string, fileName: string, options: IFormatOptions): string {
  const finalUrl = options.encodeUrl ? handleUrlEncode(url) : url
  switch (options.copyType) {
    case 'markdown':
      return `![${fileName}](${finalUrl})`
    case 'html':
      return `<img src="${finalUrl}" alt="${fileName.replace(/"/g, '&quot;')}">`
    case 'url':
      return finalUrl
    case 'ubb':
      return `[img]${finalUrl}[/img]`
    case 'custom':
      // A replacer function keeps `$` sequences in the values from being treated as replacement patterns.
      return (options.customType || DEFAULT_CUSTOM_TYPE).replace(/\$(fileName|url)/g, (_, name: string) =>
        name === 'url' ? finalUrl : fileName,
      )
    default:
      return finalUrl
  }
}
