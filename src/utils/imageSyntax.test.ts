import { describe, expect, it } from 'vitest'

import { filterReferencesByRanges, findCodeRanges, findImageReferences, IImageReference } from './imageSyntax'

const urlsOf = (references: IImageReference[]) => references.map(reference => reference.url)

/** Replaces each reference's URL the way "Upload All Images" does. */
function replaceUrls(text: string, replace: (url: string) => string) {
  let result = text
  for (const reference of findImageReferences(text).reverse()) {
    result = result.slice(0, reference.urlStart) + replace(reference.url) + result.slice(reference.urlEnd)
  }
  return result
}

describe('findImageReferences', () => {
  it('finds Markdown, HTML, UBB, and bare image URLs', () => {
    const text = [
      '![alt](./a.png)',
      '<img src="b.jpg" alt="b">',
      "<IMG width=10 src='c.gif'>",
      '<img src=d.webp>',
      '[img]https://example.com/e.png[/img]',
      'see https://example.com/f.svg.',
    ].join('\n')
    expect(findImageReferences(text).map(({ syntax, url }) => [syntax, url])).toEqual([
      ['markdown', './a.png'],
      ['html', 'b.jpg'],
      ['html', 'c.gif'],
      ['html', 'd.webp'],
      ['ubb', 'https://example.com/e.png'],
      ['url', 'https://example.com/f.svg'],
    ])
  })

  it('ignores bare web page URLs (#14)', () => {
    const text = '14. 查看保存的密码方式\nhttps://www.cnblogs.com/wtsgtc/p/14956884.html\n\n![](./images/test.png)'
    expect(urlsOf(findImageReferences(text))).toEqual(['./images/test.png'])
  })

  it('finds bare image URLs with query strings and every bare URL when asked', () => {
    const text = 'https://example.com/a.png?x=1 https://example.com/page'
    expect(urlsOf(findImageReferences(text))).toEqual(['https://example.com/a.png?x=1'])
    expect(urlsOf(findImageReferences(text, { allBareUrls: true }))).toEqual([
      'https://example.com/a.png?x=1',
      'https://example.com/page',
    ])
  })

  it('does not treat URLs inside image syntax as bare URLs', () => {
    const text = '![a](https://example.com/a.png) <img src="https://example.com/b.png">'
    expect(findImageReferences(text).map(reference => reference.syntax)).toEqual(['markdown', 'html'])
  })

  it('handles titles, angle brackets, parentheses, and brackets in Markdown', () => {
    const text = [
      '![a](./a.png "title")',
      '![b](<./my image.png>)',
      '![c](https://example.com/c_(1).png)',
      '![d [x]](./d.png)',
      String.raw`![e \] f](./e.png)`,
    ].join('\n')
    expect(urlsOf(findImageReferences(text))).toEqual([
      './a.png',
      './my image.png',
      'https://example.com/c_(1).png',
      './d.png',
      './e.png',
    ])
  })

  it('skips empty sources', () => {
    expect(findImageReferences('![]() <img src="">')).toEqual([])
  })

  it('keeps the alt text and attributes when replacing URLs (#12)', () => {
    const text = '![My diagram](./a.png "Title")\n<img src="./b.png" width="200" alt="B">'
    expect(replaceUrls(text, url => `https://cdn.example.com/${url.slice(2)}`)).toBe(
      '![My diagram](https://cdn.example.com/a.png "Title")\n<img src="https://cdn.example.com/b.png" width="200" alt="B">',
    )
  })

  it('skips images in code only when asked', () => {
    const text = '![a](./a.png)\n\n```md\n![b](./b.png)\n```\n\n`![c](./c.png)` ![d](./d.png)'
    expect(urlsOf(findImageReferences(text))).toEqual(['./a.png', './b.png', './c.png', './d.png'])
    expect(urlsOf(findImageReferences(text, { skipCode: true }))).toEqual(['./a.png', './d.png'])
  })
})

describe('findCodeRanges', () => {
  it('finds fenced blocks, including unclosed and tilde fences', () => {
    const text = 'a\n~~~\ncode\n~~~\nb\n````\n```\nstill code'
    expect(findCodeRanges(text).map(([start, end]) => text.slice(start, end))).toEqual([
      '~~~\ncode\n~~~',
      '````\n```\nstill code',
    ])
  })

  it('requires matching backtick runs for inline code', () => {
    const text = 'a ``x ` y`` b `z` c ```inline``` d'
    expect(findCodeRanges(text).map(([start, end]) => text.slice(start, end))).toEqual([
      '``x ` y``',
      '`z`',
      '```inline```',
    ])
  })

  it('handles CRLF line endings', () => {
    const text = '```\r\n![a](./a.png)\r\n```\r\n![b](./b.png)'
    expect(urlsOf(findImageReferences(text, { skipCode: true }))).toEqual(['./b.png'])
  })
})

describe('filterReferencesByRanges', () => {
  const text = '![a](./a.png) text ![b](./b.png)'
  const references = findImageReferences(text)

  it('selects the image at a cursor', () => {
    const cursor = text.indexOf('b.png')
    expect(urlsOf(filterReferencesByRanges(references, [[cursor, cursor]]))).toEqual(['./b.png'])
    expect(filterReferencesByRanges(references, [[15, 15]])).toEqual([])
  })

  it('selects images overlapping a selection', () => {
    expect(urlsOf(filterReferencesByRanges(references, [[5, text.indexOf('![b]')]]))).toEqual(['./a.png'])
    expect(urlsOf(filterReferencesByRanges(references, [[0, text.length]]))).toEqual(['./a.png', './b.png'])
  })
})
