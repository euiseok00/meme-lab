import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodeMessage, decodeMessage, MAX_LEN } from './codec.ts'

test('round trip korean + emoji', () => {
  const msg = '야 너 진짜 바보냐? ㅋㅋ 😂'
  const enc = encodeMessage(msg)
  assert.match(enc, /^[A-Za-z0-9_-]+$/)
  assert.equal(decodeMessage(enc), msg)
})

test('garbage and empty return null', () => {
  assert.equal(decodeMessage(null), null)
  assert.equal(decodeMessage(''), null)
  assert.equal(decodeMessage('%%%'), null)
  assert.equal(decodeMessage(encodeMessage('   ')), null)
})

test('caps length', () => {
  assert.equal(Array.from(decodeMessage(encodeMessage('가'.repeat(100)))!).length, MAX_LEN)
})
