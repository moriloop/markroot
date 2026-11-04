import { describe, expect, it } from 'vitest'
import { greet, HelloFromLib } from '../src'

describe('core', () => {
  it('builds the hello message from the workspace dependency', () => {
    expect(HelloFromLib).toBe('Hello, monorepo!')
  })

  it('re-exports the utils helper', () => {
    expect(greet('core')).toBe('Hello, core!')
  })
})
