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

export const handleUrlEncode = (url: string): string => isUrlEncode(url) ? url : encodeURI(url)

export const isURL = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractUrl (str: string): string {
  const patterns = [
    /!\[.*?\]\((.*?)\)/,
    /<img src="(.*?)" alt=".*?">/,
    /(https?:\/\/[^\s]+)/,
    /\[img\](.*?)\[\/img\]/
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}
