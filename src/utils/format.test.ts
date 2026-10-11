import { describe, expect, it } from 'vitest'

import { formatImage, getFileName, IFormatOptions } from './format'

const options = (overrides: Partial<IFormatOptions> = {}): IFormatOptions => ({
  copyType: 'markdown',
  customType: '',
  encodeUrl: false,
  ...overrides,
})

describe('formatImage', () => {
  const url = 'https://example.com/a b.png'

  it('formats each copy type', () => {
    expect(formatImage(url, 'a', options())).toBe('![a](https://example.com/a b.png)')
    expect(formatImage(url, 'a', options({ copyType: 'html' }))).toBe('<img src="https://example.com/a b.png" alt="a">')
    expect(formatImage(url, 'a', options({ copyType: 'url' }))).toBe(url)
    expect(formatImage(url, 'a', options({ copyType: 'ubb' }))).toBe('[img]https://example.com/a b.png[/img]')
  })

  it('encodes URLs once', () => {
    expect(formatImage(url, 'a', options({ copyType: 'url', encodeUrl: true }))).toBe('https://example.com/a%20b.png')
    expect(formatImage('https://example.com/a%20b.png', 'a', options({ copyType: 'url', encodeUrl: true }))).toBe(
      'https://example.com/a%20b.png',
    )
  })

  it('escapes quotes in HTML alt text', () => {
    expect(formatImage('https://example.com/a.png', 'say "hi"', options({ copyType: 'html' }))).toBe(
      '<img src="https://example.com/a.png" alt="say &quot;hi&quot;">',
    )
  })

  it('fills custom placeholders literally', () => {
    const custom = options({ copyType: 'custom', customType: '[$fileName]: $url ($fileName)' })
    expect(formatImage('https://example.com/a.png', '$url$&', custom)).toBe(
      '[$url$&]: https://example.com/a.png ($url$&)',
    )
    expect(formatImage('https://example.com/a.png', 'a', options({ copyType: 'custom' }))).toBe(
      '![a](https://example.com/a.png)',
    )
  })
})

describe('getFileName', () => {
  it('prefers the given name', () => {
    expect(getFileName('https://example.com/a.png', 'selected')).toBe('selected')
  })

  it('decodes the file name in the URL', () => {
    expect(getFileName('https://example.com/dir/%E5%9B%BE%20a.png?x=1')).toBe('图 a.png')
    expect(getFileName('https://example.com/%E0%A4%A.png')).toBe('%E0%A4%A.png')
    expect(getFileName('not a url')).toBe('')
  })
})
