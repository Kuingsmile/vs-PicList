import { isImageUrl } from '.'

export type ImageSyntax = 'markdown' | 'html' | 'ubb' | 'url'

export interface IImageReference {
  syntax: ImageSyntax
  /** Offset of the whole image syntax. */
  start: number
  end: number
  /** Image URL or path exactly as written. */
  url: string
  /** Offset of `url`, so it can be replaced without touching the alt text or other attributes. */
  urlStart: number
  urlEnd: number
}

export interface IFindImageOptions {
  /** Ignore references inside Markdown code spans and fenced code blocks. */
  skipCode?: boolean
  /** Treat every bare http(s) URL as an image, not only URLs with an image extension. */
  allBareUrls?: boolean
}

// ![alt](url "title"), allowing one level of brackets in the alt text and parentheses in the URL.
const markdownImage = String.raw`!\[(?:\\.|[^\\\[\]\n]|\[(?:\\.|[^\\\[\]\n])*\])*\]\(\s*(?:<([^<>\n]*)>|((?:[^\s()]|\([^\s()]*\))+))(?:\s+(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\)))?\s*\)`
const htmlImage = String.raw`<img\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))[^>]*>`
const ubbImage = String.raw`\[img(?:=[^\]\n]*)?\]([^\[\]\n]*)\[\/img\]`
const bareUrl = String.raw`(https?:\/\/[^\s<>"'\x60\[\]]+)`

const imageRegex = new RegExp([markdownImage, htmlImage, ubbImage, bareUrl].join('|'), 'dgi')
// The syntax of each capture group in `imageRegex`.
const syntaxByGroup: ImageSyntax[] = ['markdown', 'markdown', 'html', 'html', 'html', 'ubb', 'url']

const fenceRegex = /^ {0,3}(`{3,}|~{3,})/
const inlineCodeRegex = /(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g

/** Keeps balanced parentheses in a URL, excluding unmatched brackets and trailing sentence punctuation. */
function trimBareUrl(url: string): string {
  let depth = 0
  let openStart = 0
  for (let index = 0; index < url.length; index++) {
    if (url[index] === '(') {
      if (depth === 0) openStart = index
      depth++
    } else if (url[index] === ')') {
      if (depth === 0) return url.slice(0, index).replace(/[.,;:!?]+$/, '')
      depth--
    }
  }
  return (depth ? url.slice(0, openStart) : url).replace(/[.,;:!?]+$/, '')
}

/** Finds the offset ranges of Markdown fenced code blocks and inline code spans. */
export function findCodeRanges(text: string): [number, number][] {
  const ranges: [number, number][] = []
  let fence: { marker: string; start: number } | undefined
  let offset = 0
  for (const line of text.split('\n')) {
    const match = fenceRegex.exec(line)
    const rest = match ? line.slice(match[0].length) : ''
    if (fence) {
      const isClosing = match?.[1][0] === fence.marker[0] && match[1].length >= fence.marker.length && !rest.trim()
      if (isClosing) {
        ranges.push([fence.start, offset + line.length])
        fence = undefined
      }
    } else if (match && !(match[1][0] === '`' && rest.includes('`'))) {
      fence = { marker: match[1], start: offset }
    } else {
      for (const code of line.matchAll(inlineCodeRegex)) {
        ranges.push([offset + code.index, offset + code.index + code[0].length])
      }
    }
    offset += line.length + 1
  }
  // An unclosed fence runs to the end of the document.
  if (fence) ranges.push([fence.start, text.length])
  return ranges
}

/** Finds Markdown, HTML, UBB, and bare URL image references in `text`. */
export function findImageReferences(text: string, options: IFindImageOptions = {}): IImageReference[] {
  const codeRanges = options.skipCode ? findCodeRanges(text) : []
  const references: IImageReference[] = []
  for (const match of text.matchAll(imageRegex)) {
    const group = syntaxByGroup.findIndex((_, index) => match[index + 1] !== undefined)
    if (group === -1) continue
    const syntax = syntaxByGroup[group]
    const start = match.index
    if (codeRanges.some(([codeStart, codeEnd]) => start >= codeStart && start < codeEnd)) continue
    const [urlStart] = match.indices![group + 1]!
    let url = match[group + 1]
    let end = start + match[0].length
    if (syntax === 'url') {
      url = trimBareUrl(url)
      end = urlStart + url.length
      if (!options.allBareUrls && !isImageUrl(url)) continue
    }
    if (!url.trim()) continue
    references.push({ syntax, start, end, url, urlStart, urlEnd: urlStart + url.length })
  }
  return references
}

/** Keeps references that overlap a range, or contain it when the range is empty, as with a cursor. */
export function filterReferencesByRanges(
  references: IImageReference[],
  ranges: readonly (readonly [number, number])[],
): IImageReference[] {
  return references.filter(reference =>
    ranges.some(([start, end]) =>
      start === end
        ? reference.start <= start && start <= reference.end
        : reference.start < end && start < reference.end,
    ),
  )
}
