export interface IMessageToShow {
  type: 'warning' | 'error' | 'info'
  message: string
}

export const isUrlEncode = (url: string): boolean => {
  url = url || ''
  try {
    return url !== decodeURI(url)
  } catch {
    return false
  }
}

export const handleUrlEncode = (url: string): string => (isUrlEncode(url) ? url : encodeURI(url))

export const isURL = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractUrl(str: string): string[] {
  const patterns = [
    /!\[.*?\]\((.*?)\)/g,
    /<img src="(.*?)" alt=".*?">/g,
    /(https?:\/\/[^\s]+)/g,
    /\[img\](.*?)\[\/img\]/g
  ]

  const urls = []
  for (const pattern of patterns) {
    while (true) {
      const match = pattern.exec(str)
      if (!match) break
      urls.push(match[1])
    }
  }
  return Array.from(new Set(urls))
}
