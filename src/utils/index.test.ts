import { describe, expect, it } from 'vitest'

import { buildApiUrl, formatTimestamp, isHttpUrl, isImagePath, isImageUrl, isSameUrl, parseUriList } from '.'

describe('buildApiUrl', () => {
  it('adds non-empty parameters', () => {
    expect(buildApiUrl('http://127.0.0.1:36677/upload', { key: 'k', picbed: 'aws-s3', configName: '' })).toBe(
      'http://127.0.0.1:36677/upload?key=k&picbed=aws-s3',
    )
  })

  it('keeps parameters already in the URL', () => {
    expect(buildApiUrl('http://host:36677/upload?key=mine', { key: 'setting' })).toBe(
      'http://host:36677/upload?key=mine',
    )
  })

  it('adds a missing protocol and rejects invalid URLs', () => {
    expect(buildApiUrl(' localhost:36677/upload ')).toBe('http://localhost:36677/upload')
    expect(() => buildApiUrl('http://')).toThrow('Invalid PicList API URL')
  })
})

describe('URL helpers', () => {
  it('detects image paths and URLs', () => {
    expect(isImagePath('C:\\images\\A.PNG')).toBe(true)
    expect(isImagePath('./notes.md')).toBe(false)
    expect(isImageUrl('https://example.com/a.webp?size=2#top')).toBe(true)
    expect(isImageUrl('https://example.com/page.html')).toBe(false)
  })

  it('accepts only http(s) URLs as web URLs', () => {
    expect(isHttpUrl('https://example.com/a.png')).toBe(true)
    expect(isHttpUrl('C:\\images\\a.png')).toBe(false)
    expect(isHttpUrl('file:///a.png')).toBe(false)
  })

  it('compares URLs regardless of encoding', () => {
    expect(isSameUrl('https://example.com/a b.png', 'https://example.com/a%20b.png')).toBe(true)
    expect(isSameUrl('https://example.com/a.png', 'https://example.com/b.png')).toBe(false)
  })

  it('parses uri lists', () => {
    expect(parseUriList('# comment\r\nfile:///a.png\r\n\r\nfile:///b.png\n')).toEqual([
      'file:///a.png',
      'file:///b.png',
    ])
  })

  it('formats timestamps', () => {
    expect(formatTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe('20260102030405')
  })
})
