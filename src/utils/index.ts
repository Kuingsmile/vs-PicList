export const IMAGE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'jfif',
  'webp',
  'gif',
  'bmp',
  'tif',
  'tiff',
  'ico',
  'svg',
  'avif',
  'heic',
  'heif',
]

const imageExtensionRegex = new RegExp(String.raw`\.(?:${IMAGE_EXTENSIONS.join('|')})$`, 'i')

export const isImagePath = (filePath: string): boolean => imageExtensionRegex.test(filePath)

export const isUrlEncode = (url: string): boolean => {
  if (!url) return false
  try {
    return url !== decodeURI(url)
  } catch {
    return false
  }
}

export const handleUrlEncode = (url: string): string => (isUrlEncode(url) ? url : encodeURI(url))

export const safeDecodeURI = (url: string): string => {
  try {
    return decodeURI(url)
  } catch {
    return url
  }
}

export const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Compares URLs while ignoring differences in percent-encoding. */
export const isSameUrl = (a: string, b: string): boolean => a === b || safeDecodeURI(a) === safeDecodeURI(b)

export const isURL = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url) && isURL(url)

/** Checks whether a URL points to an image file, ignoring its query string and hash. */
export const isImageUrl = (url: string): boolean => {
  try {
    return isImagePath(new URL(url).pathname)
  } catch {
    return false
  }
}

/** Formats a date as `YYYYMMDDHHmmss`. */
export function formatTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  )
}

/** Splits a `text/uri-list` value into URIs, skipping comments as RFC 2483 describes. */
export const parseUriList = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))

/**
 * Adds query parameters to a PicList API URL. Parameters already in the URL take precedence, so existing
 * settings such as `http://host:36677/upload?key=xxx` keep working.
 */
export function buildApiUrl(base: string, params: Record<string, string | undefined> = {}): string {
  const value = base.trim()
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `http://${value}`)
  } catch {
    throw new Error(`Invalid PicList API URL: ${base}`)
  }
  for (const [key, param] of Object.entries(params)) {
    if (param && !url.searchParams.has(key)) url.searchParams.set(key, param)
  }
  return url.toString()
}
